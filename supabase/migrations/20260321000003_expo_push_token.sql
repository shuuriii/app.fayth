-- Add expo_push_token to patients for push notifications
ALTER TABLE patients ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Index for batch queries (find all patients with a push token)
CREATE INDEX IF NOT EXISTS idx_patients_expo_push_token
  ON patients (expo_push_token)
  WHERE expo_push_token IS NOT NULL;
