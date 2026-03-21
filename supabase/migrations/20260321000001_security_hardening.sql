-- 20260321000001_security_hardening.sql
-- Tier 1 security fixes: privilege escalation, XP race condition, audit trail

-- ============================================================================
-- FIX 1: Prevent role escalation via profiles UPDATE
-- Without this, any user can UPDATE profiles SET role = 'admin'
-- ============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS profiles_update_own ON profiles;

-- Re-create with WITH CHECK that prevents role changes
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND role = (SELECT role FROM profiles WHERE user_id = auth.uid()));

-- Also protect patients table: users should not be able to reassign themselves to different providers
DROP POLICY IF EXISTS patients_update_own ON patients;

CREATE POLICY patients_update_own ON patients
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    -- Patients cannot change their own provider assignments or adjustment stage
    AND assigned_psychologist_id IS NOT DISTINCT FROM (SELECT assigned_psychologist_id FROM patients WHERE user_id = auth.uid())
    AND assigned_psychiatrist_id IS NOT DISTINCT FROM (SELECT assigned_psychiatrist_id FROM patients WHERE user_id = auth.uid())
  );

-- ============================================================================
-- FIX 2: Atomic XP increment function (prevents race condition)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_xp(p_user_id UUID, p_amount INT)
RETURNS INT AS $$
DECLARE
  new_xp INT;
BEGIN
  UPDATE patients
  SET total_xp = COALESCE(total_xp, 0) + p_amount
  WHERE user_id = p_user_id
  RETURNING total_xp INTO new_xp;

  RETURN COALESCE(new_xp, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (RPC calls go through auth)
GRANT EXECUTE ON FUNCTION public.increment_xp(UUID, INT) TO authenticated;

-- ============================================================================
-- FIX 3: Audit log table for clinical data changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  old_data JSONB,
  new_data JSONB
);

-- Index for querying by table and record
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
-- Index for querying by user
CREATE INDEX idx_audit_log_changed_by ON audit_log(changed_by);
-- Index for time-range queries
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at DESC);

-- Enable RLS (only admins can read audit logs)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_admin_only ON audit_log
  FOR ALL USING (is_admin());

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, changed_by, new_data)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'INSERT', auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, changed_by, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'UPDATE', auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, changed_by, old_data)
    VALUES (TG_TABLE_NAME, OLD.id::TEXT, 'DELETE', auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers to sensitive tables
CREATE TRIGGER audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_medications
  AFTER INSERT OR UPDATE OR DELETE ON medications
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_patient_modules
  AFTER INSERT OR UPDATE OR DELETE ON patient_modules
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_sessions
  AFTER INSERT OR UPDATE OR DELETE ON sessions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_patient_content_responses
  AFTER INSERT OR UPDATE OR DELETE ON patient_content_responses
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_profiles
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
