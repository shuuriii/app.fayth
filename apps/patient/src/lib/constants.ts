// ── Colors ──────────────────────────────────────────────────────────
export const Colors = {
  primary: '#2f9468',
  primaryLight: '#e8f5ee',
  primaryDark: '#1e7a52',

  background: '#faf9f7',
  surface: '#ffffff',
  surfaceAlt: '#f5f3ef',

  text: '#1a1a1a',
  textSecondary: '#6b6b6b',
  textTertiary: '#9e9e9e',
  textOnPrimary: '#ffffff',

  border: '#e5e2dc',
  borderLight: '#f0ede8',

  error: '#d94444',
  errorLight: '#fef2f2',
  warning: '#e6a817',
  warningLight: '#fefce8',
  success: '#2f9468',
  successLight: '#e8f5ee',

  // Score colors (1-10 gradient)
  scoreRed: '#e05252',
  scoreOrange: '#e08a52',
  scoreYellow: '#e0c752',
  scoreYellowGreen: '#a3c44a',
  scoreGreen: '#2f9468',

  locked: '#c8c5bf',
  lockedBg: '#f0ede8',
} as const;

// ── Typography ──────────────────────────────────────────────────────
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,
} as const;

// ── Spacing ─────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ── Border Radius ───────────────────────────────────────────────────
export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ── Fay Companion ─────────────────────────────────────────────────
export const FayColors = {
  /** Core amber glow */
  glow: '#D4A852',
  glowLight: '#F5E6C4',
  glowDim: '#B8935A',
  /** Celebration spark */
  spark: '#E8C868',
  /** Dot-eyes */
  eyes: '#FFFDF5',
  /** Resting state — warm but subdued */
  restingBg: 'rgba(212, 168, 82, 0.08)',
  /** Active glow halo */
  halo: 'rgba(212, 168, 82, 0.15)',
} as const;

export const FAY_EVOLUTION_LABELS: Record<string, string> = {
  ember: 'Ember',
  spark: 'Spark',
  glow: 'Glow',
  flare: 'Flare',
  radiance: 'Radiance',
  lumina: 'Lumina',
};

// ── Level display names ─────────────────────────────────────────────
export const LEVEL_LABELS: Record<string, string> = {
  seed: 'Seed',
  sapling: 'Sapling',
  sprout: 'Sprout',
  focus: 'Focus',
  flow: 'Flow',
  thrive: 'Thrive',
};

// ── Level XP thresholds ─────────────────────────────────────────────
// Each entry: [levelKey, xpRequired to reach this level]
export const LEVEL_ORDER = ['seed', 'sapling', 'sprout', 'focus', 'flow', 'thrive'] as const;

export const LEVEL_THRESHOLDS: Record<string, number> = {
  seed: 0,
  sapling: 500,
  sprout: 1500,
  focus: 3500,
  flow: 7000,
  thrive: 12000,
};

/** Given total XP, return { currentLevel, nextLevel, xpIntoLevel, xpNeededForNext } */
export function getLevelProgress(totalXp: number) {
  let currentLevel = 'seed';
  let currentThreshold = 0;

  for (const level of LEVEL_ORDER) {
    if (totalXp >= LEVEL_THRESHOLDS[level]) {
      currentLevel = level;
      currentThreshold = LEVEL_THRESHOLDS[level];
    } else {
      break;
    }
  }

  const currentIndex = LEVEL_ORDER.indexOf(currentLevel as typeof LEVEL_ORDER[number]);
  const nextLevel = currentIndex < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[currentIndex + 1] : null;
  const nextThreshold = nextLevel ? LEVEL_THRESHOLDS[nextLevel] : currentThreshold;

  const xpIntoLevel = totalXp - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const progress = nextLevel ? Math.min(xpIntoLevel / xpNeededForNext, 1) : 1;

  return {
    currentLevel,
    nextLevel,
    xpIntoLevel,
    xpNeededForNext,
    progress,
    label: LEVEL_LABELS[currentLevel] ?? currentLevel,
    nextLabel: nextLevel ? LEVEL_LABELS[nextLevel] : null,
  };
}

// ── Adjustment stage labels ─────────────────────────────────────────
export const ADJUSTMENT_STAGE_LABELS: Record<number, string> = {
  1: 'Relief & Elation',
  2: 'Confusion & Turmoil',
  3: 'Anger',
  4: 'Sadness & Grief',
  5: 'Anxiety',
  6: 'Accommodation & Acceptance',
};

// ── ADHD Subtype labels ─────────────────────────────────────────────
export const SUBTYPE_LABELS: Record<string, string> = {
  inattentive: 'Inattentive',
  hyperactive: 'Hyperactive-Impulsive',
  combined: 'Combined',
};
