import type { ModuleStatus, UnlockRule } from '@fayth/types';

// ── Types ──────────────────────────────────────────────────────────

export interface ModuleState {
  chapterNumber: number;
  unlockRule: UnlockRule;
}

export interface PatientProgress {
  completedModules: number[]; // chapter numbers
  assignedModules: number[];  // chapter numbers assigned by psychologist
}

// Core modules are chapters 4-8
const CORE_MODULE_CHAPTERS = [4, 5, 6, 7, 8];
const CORE_MODULES_REQUIRED = 4;

// ── Chapter → UnlockRule map (YB Programme is fixed at 14 chapters) ─

export const CHAPTER_UNLOCK_RULES: Record<number, UnlockRule> = {
  1: 'always',
  2: 'after_module_1',
  3: 'after_module_2',
  4: 'assigned_by_psychologist',
  5: 'after_module_4',
  6: 'after_module_4',
  7: 'after_module_4',
  8: 'assigned_by_psychologist',
  9: 'assigned_if_comorbid',
  10: 'assigned_if_comorbid',
  11: 'assigned_if_comorbid',
  12: 'assigned_if_comorbid',
  13: 'assigned_if_comorbid',
  14: 'after_4_core_modules',
};

// ── Unlock logic ───────────────────────────────────────────────────

/**
 * Determines whether a module can be unlocked for a patient based on
 * their progress and the module's unlock rule.
 *
 * Unlock rules from the YB Programme structure:
 * - 'always'                  -> always unlockable (Module 1)
 * - 'after_module_X'          -> requires module X to be completed
 * - 'assigned_by_psychologist' -> must be explicitly assigned by provider
 * - 'assigned_if_comorbid'    -> must be explicitly assigned (comorbid modules 9-13)
 * - 'after_4_core_modules'   -> requires 4+ core modules (4-8) completed (Module 14)
 */
export function canUnlockModule(
  module: ModuleState,
  progress: PatientProgress
): boolean {
  const { unlockRule } = module;

  switch (unlockRule) {
    case 'always':
      return true;

    case 'after_module_1':
    case 'after_module_2':
    case 'after_module_3':
    case 'after_module_4': {
      // Extract the prerequisite chapter number from the rule string
      const prerequisiteChapter = parseInt(unlockRule.split('_').pop()!, 10);
      return progress.completedModules.includes(prerequisiteChapter);
    }

    case 'assigned_by_psychologist':
      return progress.assignedModules.includes(module.chapterNumber);

    case 'assigned_if_comorbid':
      return progress.assignedModules.includes(module.chapterNumber);

    case 'after_4_core_modules': {
      const completedCoreCount = progress.completedModules.filter((ch) =>
        CORE_MODULE_CHAPTERS.includes(ch)
      ).length;
      return completedCoreCount >= CORE_MODULES_REQUIRED;
    }

    default: {
      // Exhaustive check — TypeScript will error if a new UnlockRule is added
      const _exhaustive: never = unlockRule;
      return _exhaustive;
    }
  }
}

/**
 * Determines the display status of a module for a given patient.
 *
 * Status precedence:
 * 1. If the module is completed -> 'complete'
 * 2. If the module is in the active/assigned list and unlockable -> 'active'
 * 3. If the module is assigned but prerequisites not met -> 'assigned'
 * 4. If the module can be unlocked (prerequisite met) -> 'assigned' (available)
 * 5. Otherwise -> 'locked'
 */
export function getModuleStatus(
  module: ModuleState,
  progress: PatientProgress
): ModuleStatus {
  // Already completed
  if (progress.completedModules.includes(module.chapterNumber)) {
    return 'complete';
  }

  const unlockable = canUnlockModule(module, progress);

  // Explicitly assigned by psychologist
  const isAssigned = progress.assignedModules.includes(module.chapterNumber);

  if (isAssigned && unlockable) {
    return 'active';
  }

  if (isAssigned) {
    // Assigned but prerequisites not yet met
    return 'assigned';
  }

  if (unlockable) {
    // Prerequisites met but not explicitly assigned — for modules that
    // auto-unlock (always, after_module_X, after_4_core_modules)
    const autoUnlockRules: UnlockRule[] = [
      'always',
      'after_module_1',
      'after_module_2',
      'after_module_3',
      'after_module_4',
      'after_4_core_modules',
    ];

    if (autoUnlockRules.includes(module.unlockRule)) {
      return 'active';
    }
  }

  return 'locked';
}

// ── Batch status resolver ─────────────────────────────────────────

/**
 * Resolves ModuleStatus for all modules given the DB data.
 *
 * @param modules — yb_modules rows (need id, chapter_number)
 * @param patientModuleRows — patient_modules rows (module_id, status)
 *
 * Returns a Map<module_id, ModuleStatus> that respects unlock rules.
 */
export function resolveAllModuleStatuses(
  modules: Array<{ id: string; chapter_number: number }>,
  patientModuleRows: Array<{ module_id: string; status: ModuleStatus }>,
): Map<string, ModuleStatus> {
  // Build chapter→id and id→chapter maps
  const idToChapter = new Map<string, number>();
  for (const m of modules) {
    idToChapter.set(m.id, m.chapter_number);
  }

  // Build lookup from patient_modules
  const dbStatusMap = new Map<string, ModuleStatus>();
  for (const pm of patientModuleRows) {
    dbStatusMap.set(pm.module_id, pm.status);
  }

  // Derive completed and assigned chapter numbers from DB rows
  const completedModules: number[] = [];
  const assignedModules: number[] = [];

  for (const pm of patientModuleRows) {
    const ch = idToChapter.get(pm.module_id);
    if (!ch) continue;
    if (pm.status === 'complete') completedModules.push(ch);
    if (pm.status === 'assigned' || pm.status === 'active') assignedModules.push(ch);
  }

  const progress: PatientProgress = { completedModules, assignedModules };
  const result = new Map<string, ModuleStatus>();

  for (const m of modules) {
    // If the DB already says 'complete', trust it
    const dbStatus = dbStatusMap.get(m.id);
    if (dbStatus === 'complete') {
      result.set(m.id, 'complete');
      continue;
    }

    // Otherwise, compute from unlock rules
    const unlockRule = CHAPTER_UNLOCK_RULES[m.chapter_number];
    if (!unlockRule) {
      result.set(m.id, 'locked');
      continue;
    }

    const computed = getModuleStatus(
      { chapterNumber: m.chapter_number, unlockRule },
      progress,
    );

    result.set(m.id, computed);
  }

  return result;
}
