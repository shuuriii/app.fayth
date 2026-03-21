-- 20260321000002_adjustment_stage_rls_and_column_rename.sql
-- Fix 1: Lock down adjustment_stage to provider/admin-only write
-- Fix 2: Rename prerequisite_module_ids -> prerequisite_chapters for clarity

-- ============================================================================
-- FIX 1: Protect adjustment_stage from patient self-update
-- The previous hardening migration's comment said "or adjustment stage" but
-- the WITH CHECK only protected provider assignment columns. A patient could
-- set themselves to Stage 6 (Acceptance) to manipulate Fay's tone.
-- ============================================================================

DROP POLICY IF EXISTS patients_update_own ON patients;

CREATE POLICY patients_update_own ON patients
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND assigned_psychologist_id IS NOT DISTINCT FROM (SELECT assigned_psychologist_id FROM patients WHERE user_id = auth.uid())
    AND assigned_psychiatrist_id IS NOT DISTINCT FROM (SELECT assigned_psychiatrist_id FROM patients WHERE user_id = auth.uid())
    AND adjustment_stage IS NOT DISTINCT FROM (SELECT adjustment_stage FROM patients WHERE user_id = auth.uid())
  );

-- ============================================================================
-- FIX 2: Rename prerequisite_module_ids -> prerequisite_chapters
-- The column stores chapter_number references (INT), not module UUIDs.
-- The old name was misleading since yb_modules.id is UUID.
-- ============================================================================

ALTER TABLE yb_modules RENAME COLUMN prerequisite_module_ids TO prerequisite_chapters;
COMMENT ON COLUMN yb_modules.prerequisite_chapters IS 'Array of chapter_number values (INT) that must be completed before this module unlocks. References yb_modules.chapter_number, NOT yb_modules.id.';
