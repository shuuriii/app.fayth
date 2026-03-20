import type { Level, XPState } from '@fayth/types';
import { LEVEL_THRESHOLDS } from '@fayth/types';

// ── XP Action types ────────────────────────────────────────────────

export type XPAction =
  | 'log_symptoms'
  | 'complete_worksheet'
  | 'take_medication'
  | 'attend_session'
  | 'complete_module';

// ── XP values from spec ────────────────────────────────────────────

const BASE_XP: Record<XPAction, number> = {
  log_symptoms: 10,
  complete_worksheet: 50,
  take_medication: 15,
  attend_session: 100,
  complete_module: 500,
};

const STREAK_MULTIPLIER_THRESHOLD = 7; // days
const STREAK_MULTIPLIER = 2;

// ── XP calculation ─────────────────────────────────────────────────

/**
 * Calculate XP earned for a given action.
 *
 * For log_symptoms: base 10 XP, doubled after a 7-day streak.
 * streakDays is only relevant for 'log_symptoms'.
 */
export function calculateXP(action: XPAction, streakDays?: number): number {
  const base = BASE_XP[action];

  if (action === 'log_symptoms' && streakDays !== undefined && streakDays >= STREAK_MULTIPLIER_THRESHOLD) {
    return base * STREAK_MULTIPLIER;
  }

  return base;
}

// ── Level calculation ──────────────────────────────────────────────

// Levels ordered from highest to lowest threshold for lookup
const LEVELS_DESCENDING: Array<{ level: Level; threshold: number }> = (
  Object.entries(LEVEL_THRESHOLDS) as Array<[Level, number]>
)
  .sort((a, b) => b[1] - a[1])
  .map(([level, threshold]) => ({ level, threshold }));

// Levels ordered ascending for next-level lookup
const LEVELS_ASCENDING: Array<{ level: Level; threshold: number }> = (
  Object.entries(LEVEL_THRESHOLDS) as Array<[Level, number]>
)
  .sort((a, b) => a[1] - b[1])
  .map(([level, threshold]) => ({ level, threshold }));

/**
 * Determine the player's level based on total XP.
 * Returns the highest level whose threshold the player has reached.
 */
export function getLevelForXP(totalXP: number): Level {
  for (const { level, threshold } of LEVELS_DESCENDING) {
    if (totalXP >= threshold) {
      return level;
    }
  }
  // Should never reach here since 'seed' threshold is 0
  return 'seed';
}

/**
 * Get detailed progress toward the next level.
 */
export function getXPToNextLevel(totalXP: number): {
  current: Level;
  next: Level | null;
  xpNeeded: number;
  progress: number;
} {
  const currentLevel = getLevelForXP(totalXP);

  // Find the index of the current level in ascending order
  const currentIndex = LEVELS_ASCENDING.findIndex((l) => l.level === currentLevel);
  const nextEntry = LEVELS_ASCENDING[currentIndex + 1];

  if (!nextEntry) {
    // Already at max level
    return {
      current: currentLevel,
      next: null,
      xpNeeded: 0,
      progress: 1,
    };
  }

  const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
  const nextThreshold = nextEntry.threshold;
  const xpInLevel = totalXP - currentThreshold;
  const xpForLevel = nextThreshold - currentThreshold;

  return {
    current: currentLevel,
    next: nextEntry.level,
    xpNeeded: nextThreshold - totalXP,
    progress: xpForLevel > 0 ? xpInLevel / xpForLevel : 1,
  };
}
