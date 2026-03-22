/**
 * Maps specific content item IDs to custom interactive component names.
 * Items not in this registry use the default experience for their type.
 */

export interface CustomRenderer {
  /** Component name (used for dynamic rendering) */
  component:
    | 'CBTCycleDiagram'
    | 'AdjustmentStageSelector'
    | 'DSMChecklist'
    | 'SymptomRadarChart'
    | 'TimelineExercise';
  /** Optional mode for components that have multiple modes */
  mode?: 'view' | 'edit';
}

export const CUSTOM_RENDERERS: Record<string, CustomRenderer> = {
  // Module 1
  '00000000-0000-4000-a000-000000010002': { component: 'CBTCycleDiagram', mode: 'view' },
  '00000000-0000-4000-a000-000000010005': { component: 'CBTCycleDiagram', mode: 'edit' },
  // Module 2
  '00000000-0000-4000-a000-000000020003': { component: 'DSMChecklist' },
  '00000000-0000-4000-a000-000000020006': { component: 'SymptomRadarChart' },
  '00000000-0000-4000-a000-000000020008': { component: 'TimelineExercise' },
};

/** Check if a content item has a custom renderer */
export function getCustomRenderer(contentItemId: string): CustomRenderer | null {
  return CUSTOM_RENDERERS[contentItemId] ?? null;
}

/** Estimate completion time in minutes based on content type and field count */
export function estimateTime(
  type: 'psychoeducation' | 'worksheet' | 'exercise' | 'table' | 'diary',
  fieldCount: number,
  wordCount?: number,
): number {
  switch (type) {
    case 'psychoeducation':
      return Math.max(1, Math.ceil((wordCount ?? 500) / 200));
    case 'worksheet':
    case 'table':
    case 'diary':
      return Math.max(1, Math.ceil(fieldCount * 0.5)); // ~30s per field
    case 'exercise':
      return Math.max(2, Math.ceil(fieldCount * 2)); // ~2min per field (reflective)
    default:
      return 3;
  }
}
