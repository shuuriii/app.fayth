-- 20260320000003_additional_indexes.sql
-- Additional indexes recommended by Database Optimizer for Phase 1 queries

-- Provider dashboard: "my sessions today/upcoming" query
CREATE INDEX IF NOT EXISTS idx_sessions_provider_scheduled
  ON sessions(provider_id, scheduled_at DESC);

-- Patient app: "my active modules" query
CREATE INDEX IF NOT EXISTS idx_patient_modules_patient_status
  ON patient_modules(patient_id, status);

-- Provider dashboard: "flagged responses for my patients" query
CREATE INDEX IF NOT EXISTS idx_patient_content_responses_patient_flagged
  ON patient_content_responses(patient_id, flagged) WHERE flagged = true;
