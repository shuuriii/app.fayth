-- 20260320000004_patient_gamification_fields.sql
-- Add gamification tracking columns to patients table

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS total_xp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'seed',
  ADD COLUMN IF NOT EXISTS daily_checkin_streak INT NOT NULL DEFAULT 0;

-- Index for leaderboard/level queries
CREATE INDEX IF NOT EXISTS idx_patients_level ON patients(level);
