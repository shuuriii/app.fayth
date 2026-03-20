import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AdhdSubtype, AdjustmentStage, SymptomLogInput } from '@fayth/types';
import { LLMClient } from '../client';
import { sanitizeForLLM } from '../sanitize';
import type { Message } from '../types';

// ── Context type ───────────────────────────────────────────────────

export interface PreSessionContext {
  patient_id: string;
  adhd_subtype: AdhdSubtype;
  adjustment_stage: AdjustmentStage;
  active_modules: string[]; // module titles
  symptom_logs: Array<SymptomLogInput & { logged_at: string }>; // last 14 days
  worksheet_completions: Array<{
    title: string;
    completed_at: string;
    xp_earned: number;
  }>;
  medication_adherence_rate: number; // 0-100 percentage
  flags: string[];
}

// ── Prompt loading ─────────────────────────────────────────────────

let cachedPromptTemplate: string | null = null;

async function loadPromptTemplate(): Promise<string> {
  if (cachedPromptTemplate) return cachedPromptTemplate;

  // Resolve relative to this file's directory
  const promptPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../prompts/pre-session-summary.v1.md'
  );
  cachedPromptTemplate = await readFile(promptPath, 'utf-8');
  return cachedPromptTemplate;
}

// ── Template hydration ─────────────────────────────────────────────

function formatSymptomLogsTable(
  logs: PreSessionContext['symptom_logs']
): string {
  if (logs.length === 0) return 'No symptom logs recorded in this period.';

  const header = '| Date | Focus | Mood | Energy | Impulsivity | Sleep (h) |';
  const divider = '|------|-------|------|--------|-------------|-----------|';
  const rows = logs.map((log) => {
    const date = log.logged_at.split('T')[0] ?? log.logged_at;
    return `| ${date} | ${log.focus_score} | ${log.mood_score} | ${log.energy_score} | ${log.impulsivity_score} | ${log.sleep_hours} |`;
  });

  return [header, divider, ...rows].join('\n');
}

function formatWorksheetCompletions(
  completions: PreSessionContext['worksheet_completions']
): string {
  if (completions.length === 0) return 'No worksheets completed in this period.';

  return completions
    .map((c) => `- ${c.title} (completed ${c.completed_at.split('T')[0]}, ${c.xp_earned} XP)`)
    .join('\n');
}

function hydrateTemplate(template: string, ctx: PreSessionContext): string {
  const replacements: Record<string, string> = {
    '{{patient_id}}': ctx.patient_id,
    '{{adhd_subtype}}': ctx.adhd_subtype,
    '{{adjustment_stage}}': String(ctx.adjustment_stage),
    '{{active_modules}}': ctx.active_modules.join(', ') || 'None',
    '{{symptom_logs_table}}': formatSymptomLogsTable(ctx.symptom_logs),
    '{{worksheet_completions}}': formatWorksheetCompletions(ctx.worksheet_completions),
    '{{medication_adherence}}': `${ctx.medication_adherence_rate}% adherence rate`,
    '{{flags}}': ctx.flags.length > 0 ? ctx.flags.map((f) => `- ${f}`).join('\n') : 'None',
  };

  let result = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(placeholder, value);
  }
  return result;
}

// ── Generator ──────────────────────────────────────────────────────

const client = new LLMClient({ temperature: 0.4, maxTokens: 512 });

/**
 * Generate a pre-session summary for a therapist.
 * This is the highest-value Phase 1 AI feature — it runs 24 hours
 * before a scheduled session and produces a structured clinical summary.
 */
export async function generatePreSessionSummary(
  context: PreSessionContext
): Promise<string> {
  const template = await loadPromptTemplate();
  const hydratedPrompt = sanitizeForLLM(hydrateTemplate(template, context));

  const messages: Message[] = [
    { role: 'system', content: hydratedPrompt },
    {
      role: 'user',
      content: 'Generate the pre-session summary now.',
    },
  ];

  return client.complete(messages);
}
