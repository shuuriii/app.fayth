-- ============================================================================
-- Award 100 XP to the patient when a session is marked as complete.
-- This is a provider-side action, so we use a DB trigger rather than
-- a client hook.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.award_session_xp()
RETURNS TRIGGER AS $$
DECLARE
  patient_user_id UUID;
BEGIN
  -- Only fire when status changes TO 'complete'
  IF NEW.status = 'complete' AND (OLD.status IS DISTINCT FROM 'complete') THEN
    -- Resolve the patient's auth user_id from the patients table
    SELECT user_id INTO patient_user_id
    FROM patients
    WHERE id = NEW.patient_id;

    IF patient_user_id IS NOT NULL THEN
      PERFORM public.increment_xp(patient_user_id, 100);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to sessions table
DROP TRIGGER IF EXISTS trg_award_session_xp ON sessions;
CREATE TRIGGER trg_award_session_xp
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.award_session_xp();
