import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AdjustmentStage } from '@fayth/types';
import { LLMClient } from '../client';
import { sanitizeForLLM } from '../sanitize';
import type { Message } from '../types';
import type { DayScore, CheckinResult } from './daily-checkin';

// ── Context ───────────────────────────────────────────────────────

export interface FayCheckinContext {
  patient_id: string;
  recent_scores: DayScore[];
  active_module_title: string;
  adjustment_stage: AdjustmentStage;
}

// ── Prompt loading ────────────────────────────────────────────────

let cachedVoicePrompt: string | null = null;
let cachedCheckinPrompt: string | null = null;

async function loadPrompt(filename: string): Promise<string> {
  const promptPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    `../../prompts/${filename}`
  );
  return readFile(promptPath, 'utf-8');
}

async function loadVoicePrompt(): Promise<string> {
  if (cachedVoicePrompt) return cachedVoicePrompt;
  cachedVoicePrompt = await loadPrompt('fay-voice.v1.md');
  return cachedVoicePrompt;
}

async function loadCheckinPrompt(): Promise<string> {
  if (cachedCheckinPrompt) return cachedCheckinPrompt;
  cachedCheckinPrompt = await loadPrompt('daily-checkin.v1.md');
  return cachedCheckinPrompt;
}

// ── Score analysis helpers ────────────────────────────────────────

function computeTrend(scores: DayScore[]): string {
  if (scores.length < 2) return 'insufficient data';
  const half = Math.floor(scores.length / 2);
  const firstAvg =
    scores.slice(0, half).reduce((s, d) => s + d.focus_score + d.mood_score, 0) / (half * 2);
  const secondAvg =
    scores.slice(half).reduce((s, d) => s + d.focus_score + d.mood_score, 0) /
    ((scores.length - half) * 2);
  const diff = secondAvg - firstAvg;
  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

function detectFlag(scores: DayScore[]): string | null {
  if (scores.length < 3) return null;
  const recent = scores.slice(-3);
  const reasons: string[] = [];
  if (recent.every((s) => s.focus_score < 3))
    reasons.push('Focus below 3 for 3+ consecutive days');
  if (recent.every((s) => s.mood_score < 3))
    reasons.push('Mood below 3 for 3+ consecutive days');
  return reasons.length > 0 ? reasons.join('; ') : null;
}

// ── Generator ─────────────────────────────────────────────────────

const client = new LLMClient({ temperature: 0.8, maxTokens: 128 });

/**
 * Generate a daily check-in message wrapped in Fay's voice.
 *
 * Uses the Fay voice constraints as system prompt and the daily check-in
 * context as the user prompt. Output is guaranteed to match Fay's
 * personality rules (15 words max, no guilt, no emojis, etc.)
 */
export async function generateFayCheckin(
  context: FayCheckinContext
): Promise<CheckinResult> {
  const [voicePrompt, checkinPrompt] = await Promise.all([
    loadVoicePrompt(),
    loadCheckinPrompt(),
  ]);

  // Build a compact context summary for the LLM
  const avgFocus =
    context.recent_scores.length > 0
      ? (context.recent_scores.reduce((s, d) => s + d.focus_score, 0) / context.recent_scores.length).toFixed(1)
      : 'N/A';
  const avgMood =
    context.recent_scores.length > 0
      ? (context.recent_scores.reduce((s, d) => s + d.mood_score, 0) / context.recent_scores.length).toFixed(1)
      : 'N/A';
  const trend = computeTrend(context.recent_scores);

  const contextSummary = [
    `Patient: ${context.patient_id}`,
    `Adjustment stage: ${context.adjustment_stage}`,
    `Active module: ${context.active_module_title || 'None'}`,
    `7-day avg focus: ${avgFocus}, avg mood: ${avgMood}`,
    `Trend: ${trend}`,
    `Days of data: ${context.recent_scores.length}`,
  ].join('\n');

  const systemPrompt = sanitizeForLLM(
    `${voicePrompt}\n\n---\n\nPatient context:\n${contextSummary}`
  );

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content:
        'Generate a single Fay check-in message for this patient. Follow all voice rules strictly.',
    },
  ];

  const message = await client.complete(messages);

  // Enforce 15-word hard limit client-side as safety net
  const words = message.trim().split(/\s+/);
  const truncated = words.length > 20 ? words.slice(0, 20).join(' ') + '...' : message.trim();

  const flagReason = detectFlag(context.recent_scores);

  return {
    message: truncated,
    flagForProvider: flagReason !== null,
    flagReason: flagReason ?? undefined,
  };
}
