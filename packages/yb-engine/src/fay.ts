import type {
  Level,
  AdjustmentStage,
  FayVisualState,
  FayEvolutionStage,
  FayMessage,
  FayMessageContext,
  FayState,
} from '@fayth/types';
import { FAY_EVOLUTION_MAP } from '@fayth/types';

// ── Message Pool ──────────────────────────────────────────────────
// Each context has multiple variants to prevent repetition.
// Messages are under 15 words. No exclamation marks in clinical contexts.
// No guilt, no shame, no "don't forget", no emoji.

const MESSAGE_POOL: FayMessage[] = [
  // ── Check-in prompts ──
  { context: 'checkin_prompt', text: "Morning. Check-in's open when you're ready." },
  { context: 'checkin_prompt', text: 'Hey. Quick check-in here if you want it.' },
  { context: 'checkin_prompt', text: "New day. No agenda — just checking in." },
  { context: 'checkin_prompt', text: "I'm around. Check-in's there whenever." },
  { context: 'checkin_prompt', text: 'Whenever works. The check-in will keep.' },
  { context: 'checkin_prompt', text: "Afternoon check — one slider, 10 seconds?" },
  { context: 'checkin_prompt', text: "How'd today go? Quick log before you switch off." },

  // ── Post-worksheet ──
  { context: 'post_worksheet', text: 'Done. That one had some weight to it.' },
  { context: 'post_worksheet', text: "Finished. That's real work — even if it felt small." },
  { context: 'post_worksheet', text: "That's another one behind you." },
  { context: 'post_worksheet', text: 'Solid. Take a breath if you need one.' },
  { context: 'post_worksheet', text: 'Noted and done.' },

  // ── Post-symptom log ──
  { context: 'post_symptom_log', text: 'Logged. Thanks for checking in.' },
  { context: 'post_symptom_log', text: 'Noted. That takes more effort than people think.' },
  { context: 'post_symptom_log', text: 'Got it. The numbers tell a story over time.' },
  { context: 'post_symptom_log', text: "Tracked. You're building a picture." },
  { context: 'post_symptom_log', text: "Logged. No judgment — just data." },

  // ── Post-medication ──
  { context: 'post_medication', text: 'Logged. One less thing to think about.' },
  { context: 'post_medication', text: 'Medication tracked. Done.' },
  { context: 'post_medication', text: 'Tracked. Easy one.' },
  { context: 'post_medication', text: 'Noted. Check that one off.' },

  // ── Streak milestones ──
  { context: 'streak_milestone', text: "Three days. A rhythm's forming.", minStreak: 3 },
  { context: 'streak_milestone', text: "A whole week. That's not nothing.", minStreak: 7 },
  { context: 'streak_milestone', text: 'Two weeks of showing up. That\'s real.', minStreak: 14 },
  { context: 'streak_milestone', text: "A month. You've built something here.", minStreak: 30 },

  // ── Return after absence ──
  { context: 'return_after_absence', text: 'Hey. Welcome back.' },
  { context: 'return_after_absence', text: 'There you are. No rush.' },
  { context: 'return_after_absence', text: 'Good to see you. Pick up wherever.' },
  { context: 'return_after_absence', text: "Hey. Still here." },
  { context: 'return_after_absence', text: "Welcome back. Everything's where you left it." },

  // ── Rough day (low scores) ──
  { context: 'rough_day', text: "Rough day. That's valid." },
  { context: 'rough_day', text: "Hard one. I'm here." },
  { context: 'rough_day', text: 'Low day. Those happen. Still here.' },
  { context: 'rough_day', text: 'Not every day is easy. Noted.' },
  { context: 'rough_day', text: 'Tough stretch. No need to perform.' },

  // ── Anti-hyperfocus ──
  { context: 'anti_hyperfocus', text: 'All caught up. Go live your day.' },
  { context: 'anti_hyperfocus', text: "Done for today. Fay will be here tomorrow." },
  { context: 'anti_hyperfocus', text: "That's enough for today. Seriously. Go." },
  { context: 'anti_hyperfocus', text: "Solid day. Step away — you've earned it." },

  // ── Idle (tapped with no special context) ──
  { context: 'idle', text: "I'm here. No rush." },
  { context: 'idle', text: 'Just hanging out.' },
  { context: 'idle', text: 'Nothing urgent. Take your time.' },
  { context: 'idle', text: 'All good here.' },
];

// ── Message Selection ─────────────────────────────────────────────

// Track recently shown messages per context to avoid repeats
const recentlyShown = new Map<FayMessageContext, Set<string>>();

function getMessagesForContext(context: FayMessageContext): FayMessage[] {
  return MESSAGE_POOL.filter((m) => m.context === context);
}

/**
 * Select a message for the given context, avoiding recent repeats.
 * Uses simple rotation — no randomness dependency.
 */
export function selectMessage(
  context: FayMessageContext,
  options?: { streakDays?: number }
): FayMessage | null {
  let candidates = getMessagesForContext(context);

  // For streak milestones, filter by streak threshold
  if (context === 'streak_milestone' && options?.streakDays !== undefined) {
    // Find the highest milestone at or below current streak
    const milestones = candidates
      .filter((m) => m.minStreak !== undefined && m.minStreak <= options.streakDays!)
      .sort((a, b) => (b.minStreak ?? 0) - (a.minStreak ?? 0));

    if (milestones.length === 0) return null;
    // Return the highest applicable milestone
    return milestones[0];
  }

  if (candidates.length === 0) return null;

  // Filter out recently shown
  const shown = recentlyShown.get(context) ?? new Set();
  let fresh = candidates.filter((m) => !shown.has(m.text));

  // If all have been shown, reset
  if (fresh.length === 0) {
    shown.clear();
    fresh = candidates;
  }

  // Pick based on rotating index (deterministic within session)
  const pick = fresh[Math.floor(Math.random() * fresh.length)];
  shown.add(pick.text);
  recentlyShown.set(context, shown);

  return pick;
}

// ── Evolution ─────────────────────────────────────────────────────

export function getEvolutionStage(level: Level): FayEvolutionStage {
  return FAY_EVOLUTION_MAP[level];
}

export const EVOLUTION_MESSAGES: Record<FayEvolutionStage, string | null> = {
  ember: null, // starting state
  spark: "Something's changing. I can feel it too.",
  glow: "Look at us. We're getting somewhere.",
  flare: "You're different now. Can you tell?",
  radiance: "This isn't just a streak. This is who you are.",
  lumina: 'We started as a spark. Look at this light.',
};

// ── State Resolution ──────────────────────────────────────────────

export interface FayContext {
  level: Level;
  streakDays: number;
  todayLogComplete: boolean;
  daysSinceLastOpen: number;
  lastFocusScore?: number;
  lastMoodScore?: number;
  /** Has completed all daily actions (log + current worksheet/task) */
  dailyActionsComplete: boolean;
  /** Is the user in the middle of a task (worksheet, logging) */
  activeTask: boolean;
}

const LOW_SCORE_THRESHOLD = 4;

/**
 * Resolve Fay's complete visual + message state from the current context.
 * This is the single function the UI calls.
 */
export function resolveFayState(ctx: FayContext): FayState {
  const evolutionStage = getEvolutionStage(ctx.level);

  // Determine visual state
  let visualState: FayVisualState = 'present';

  if (ctx.activeTask) {
    visualState = 'attentive';
  } else if (ctx.streakDays >= 3) {
    visualState = 'glowing';
  }

  // Determine contextual message
  let message: FayMessage | null = null;

  if (ctx.daysSinceLastOpen >= 2) {
    // Returning after absence — greet without mentioning the gap
    message = selectMessage('return_after_absence');
  } else if (ctx.dailyActionsComplete) {
    // Done for the day — encourage stepping away
    message = selectMessage('anti_hyperfocus');
  } else if (
    ctx.todayLogComplete &&
    ctx.lastFocusScore !== undefined &&
    ctx.lastMoodScore !== undefined &&
    (ctx.lastFocusScore < LOW_SCORE_THRESHOLD || ctx.lastMoodScore < LOW_SCORE_THRESHOLD)
  ) {
    // Rough day detected
    message = selectMessage('rough_day');
  } else if (ctx.todayLogComplete) {
    // Log is done but other tasks remain
    message = selectMessage('idle');
  } else {
    // Default: prompt for check-in
    message = selectMessage('checkin_prompt');
  }

  return {
    visualState,
    evolutionStage,
    message,
    visible: true,
  };
}

/**
 * Get a celebration message after completing an action.
 * Called by UI after XP is awarded.
 */
export function getCelebrationMessage(
  action: 'log' | 'worksheet' | 'medication',
  streakDays?: number
): { message: FayMessage | null; showStreakMilestone: boolean; streakMessage: FayMessage | null } {
  const contextMap: Record<string, FayMessageContext> = {
    log: 'post_symptom_log',
    worksheet: 'post_worksheet',
    medication: 'post_medication',
  };

  const message = selectMessage(contextMap[action]);

  // Check if this action triggers a streak milestone
  let streakMessage: FayMessage | null = null;
  const showStreakMilestone =
    streakDays !== undefined && [3, 7, 14, 30, 60, 90].includes(streakDays);

  if (showStreakMilestone) {
    streakMessage = selectMessage('streak_milestone', { streakDays });
  }

  return { message, showStreakMilestone, streakMessage };
}
