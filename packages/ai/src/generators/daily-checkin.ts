import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AdjustmentStage } from '@fayth/types';
import { LLMClient } from '../client';
import { sanitizeForLLM } from '../sanitize';
import type { Message } from '../types';

// ── Context type ───────────────────────────────────────────────────

export interface DayScore {
  date: string;
  focus_score: number;
  mood_score: number;
  energy_score: number;
  impulsivity_score: number;
  sleep_hours: number;
}

export interface CheckinContext {
  patient_id: string;
  recent_scores: DayScore[]; // last 7 days, ordered chronologically
  active_module_title: string;
  adjustment_stage: AdjustmentStage;
}

export interface CheckinResult {
  message: string;
  flagForProvider: boolean;
  flagReason?: string;
}

// ── Prompt loading ─────────────────────────────────────────────────

let cachedPromptTemplate: string | null = null;

async function loadPromptTemplate(): Promise<string> {
  if (cachedPromptTemplate) return cachedPromptTemplate;

  const promptPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../prompts/daily-checkin.v1.md'
  );
  cachedPromptTemplate = await readFile(promptPath, 'utf-8');
  return cachedPromptTemplate;
}

// ── Flag detection ─────────────────────────────────────────────────

const SCORE_THRESHOLD = 3;
const CONSECUTIVE_DAYS_THRESHOLD = 3;

/**
 * Checks if focus or mood has dropped below threshold for N+ consecutive days.
 * Returns a flag reason string if so, or null.
 */
function detectFlag(scores: DayScore[]): string | null {
  if (scores.length < CONSECUTIVE_DAYS_THRESHOLD) return null;

  const reasons: string[] = [];

  // Check last N days for consecutive low focus
  const recentScores = scores.slice(-CONSECUTIVE_DAYS_THRESHOLD);
  const allLowFocus = recentScores.every((s) => s.focus_score < SCORE_THRESHOLD);
  const allLowMood = recentScores.every((s) => s.mood_score < SCORE_THRESHOLD);

  if (allLowFocus) {
    reasons.push(
      `Focus score below ${SCORE_THRESHOLD} for ${CONSECUTIVE_DAYS_THRESHOLD}+ consecutive days`
    );
  }
  if (allLowMood) {
    reasons.push(
      `Mood score below ${SCORE_THRESHOLD} for ${CONSECUTIVE_DAYS_THRESHOLD}+ consecutive days`
    );
  }

  return reasons.length > 0 ? reasons.join('; ') : null;
}

// ── Template hydration ─────────────────────────────────────────────

function computeTrend(scores: DayScore[]): string {
  if (scores.length < 2) return 'insufficient data';

  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));

  const avg = (arr: DayScore[]) =>
    arr.reduce((sum, s) => sum + s.focus_score + s.mood_score, 0) / (arr.length * 2);

  const firstAvg = avg(firstHalf);
  const secondAvg = avg(secondHalf);
  const diff = secondAvg - firstAvg;

  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

function formatScoresTable(scores: DayScore[]): string {
  if (scores.length === 0) return 'No scores recorded this week.';

  const header = '| Date | Focus | Mood | Energy | Impulsivity | Sleep (h) |';
  const divider = '|------|-------|------|--------|-------------|-----------|';
  const rows = scores.map(
    (s) =>
      `| ${s.date} | ${s.focus_score} | ${s.mood_score} | ${s.energy_score} | ${s.impulsivity_score} | ${s.sleep_hours} |`
  );

  return [header, divider, ...rows].join('\n');
}

function hydrateTemplate(template: string, ctx: CheckinContext): string {
  const avgFocus =
    ctx.recent_scores.length > 0
      ? (
          ctx.recent_scores.reduce((sum, s) => sum + s.focus_score, 0) /
          ctx.recent_scores.length
        ).toFixed(1)
      : 'N/A';

  const avgMood =
    ctx.recent_scores.length > 0
      ? (
          ctx.recent_scores.reduce((sum, s) => sum + s.mood_score, 0) /
          ctx.recent_scores.length
        ).toFixed(1)
      : 'N/A';

  const replacements: Record<string, string> = {
    '{{patient_id}}': ctx.patient_id,
    '{{adjustment_stage}}': String(ctx.adjustment_stage),
    '{{active_module_title}}': ctx.active_module_title || 'None assigned',
    '{{avg_focus}}': avgFocus,
    '{{avg_mood}}': avgMood,
    '{{trend_direction}}': computeTrend(ctx.recent_scores),
    '{{recent_scores_table}}': formatScoresTable(ctx.recent_scores),
  };

  let result = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(placeholder, value);
  }
  return result;
}

// ── Generator ──────────────────────────────────────────────────────

const client = new LLMClient({ temperature: 0.8, maxTokens: 256 });

/**
 * Generate a daily check-in message for a patient.
 * Also detects if the patient's scores warrant flagging for their provider.
 */
export async function generateDailyCheckin(
  context: CheckinContext
): Promise<CheckinResult> {
  const template = await loadPromptTemplate();
  const hydratedPrompt = sanitizeForLLM(hydrateTemplate(template, context));

  const messages: Message[] = [
    { role: 'system', content: hydratedPrompt },
    {
      role: 'user',
      content: 'Generate the daily check-in message now.',
    },
  ];

  const message = await client.complete(messages);

  // Flag detection runs locally, independent of LLM output
  const flagReason = detectFlag(context.recent_scores);

  return {
    message,
    flagForProvider: flagReason !== null,
    flagReason: flagReason ?? undefined,
  };
}
