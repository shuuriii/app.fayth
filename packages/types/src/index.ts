// ── Enums (mirror database) ──────────────────────────────────────────

export type UserRole = 'patient' | 'psychologist' | 'psychiatrist' | 'admin';
export type AdhdSubtype = 'inattentive' | 'hyperactive' | 'combined';
export type ModuleStatus = 'locked' | 'assigned' | 'active' | 'complete';
export type ContentItemType = 'worksheet' | 'table' | 'exercise' | 'diary' | 'psychoeducation';
export type MedicationForm = 'IR' | 'SR';
export type SessionType = 'therapy' | 'medication_review';
export type SessionStatus = 'scheduled' | 'complete' | 'cancelled';
export type AdjustmentStage = 1 | 2 | 3 | 4 | 5 | 6;

// ── Symptom Logging ─────────────────────────────────────────────────

export interface SymptomLogInput {
  focus_score: number;
  mood_score: number;
  energy_score: number;
  impulsivity_score: number;
  sleep_hours: number;
  notes?: string;
}

// ── YB Content Schema (JSONB structure) ─────────────────────────────

export interface YBField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'scale' | 'likert' | 'checkbox' | 'select' | 'date' | 'time' | 'repeating_group';
  required?: boolean;
  options?: string[];
  scale_min?: number;
  scale_max?: number;
  scale_labels?: Record<string, string>;
  placeholder?: string;
  score_values?: number[];
  reverse_score?: boolean;
  sub_fields?: YBField[];
}

export interface ContentBlock {
  heading: string;
  body: string;
}

export interface Scoring {
  method: 'sum' | 'average' | 'custom' | 'none';
  max_score?: number;
  interpretation?: Record<string, string>;
}

export interface YBContentSchema {
  fields?: YBField[];
  content_blocks?: ContentBlock[];
  scoring?: Scoring;
  instructions_for_patient?: string;
  clinician_notes?: string;
}

// ── Gamification ────────────────────────────────────────────────────

export type Level = 'seed' | 'sapling' | 'sprout' | 'focus' | 'flow' | 'thrive';

export interface XPState {
  total_xp: number;
  level: Level;
  streaks: {
    daily_checkin: number;
    medication: number;
    session: number;
  };
}

export const LEVEL_THRESHOLDS: Record<Level, number> = {
  seed: 0,
  sapling: 500,
  sprout: 1500,
  focus: 3500,
  flow: 7000,
  thrive: 12000,
};

// ── Fay Companion ─────────────────────────────────────────────────

export type FayVisualState = 'resting' | 'present' | 'attentive' | 'celebrating' | 'glowing';

export type FayEvolutionStage = 'ember' | 'spark' | 'glow' | 'flare' | 'radiance' | 'lumina';

/** Maps player Level to Fay's evolution stage */
export const FAY_EVOLUTION_MAP: Record<Level, FayEvolutionStage> = {
  seed: 'ember',
  sapling: 'spark',
  sprout: 'glow',
  focus: 'flare',
  flow: 'radiance',
  thrive: 'lumina',
};

export type FayMessageContext =
  | 'checkin_prompt'
  | 'post_worksheet'
  | 'post_symptom_log'
  | 'post_medication'
  | 'streak_milestone'
  | 'return_after_absence'
  | 'rough_day'
  | 'anti_hyperfocus'
  | 'idle';

export interface FayMessage {
  context: FayMessageContext;
  text: string;
  /** Minimum streak days required (for streak_milestone) */
  minStreak?: number;
}

export interface FayState {
  visualState: FayVisualState;
  evolutionStage: FayEvolutionStage;
  message: FayMessage | null;
  visible: boolean;
}

export interface FayPreferences {
  enabled: boolean;
  quietMode: boolean;
  notificationsCheckin: boolean;
  notificationsMilestone: boolean;
}

// ── Module Unlock Rules ─────────────────────────────────────────────

export type UnlockRule =
  | 'always'
  | 'after_module_1'
  | 'after_module_2'
  | 'after_module_3'
  | 'after_module_4'
  | 'assigned_by_psychologist'
  | 'assigned_if_comorbid'
  | 'after_4_core_modules';
