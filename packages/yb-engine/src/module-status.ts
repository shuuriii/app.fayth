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
