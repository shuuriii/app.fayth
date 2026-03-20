-- 20260320000002_rls_policies.sql
-- RLS policies for fayth.life
-- Four roles: patient (own data), psychologist (assigned patients),
--             psychiatrist (medication for assigned patients), admin (all)

-- ============================================================================
-- HELPER: get current user's role from profiles
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get patient_id for current user (if they are a patient)
CREATE OR REPLACE FUNCTION public.get_my_patient_id()
RETURNS UUID AS $$
  SELECT id FROM patients WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Admin can read all profiles
CREATE POLICY profiles_select_admin ON profiles
  FOR SELECT USING (is_admin());

-- Admin can update all profiles
CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (is_admin());

-- Providers can read profiles of their assigned patients
CREATE POLICY profiles_select_provider ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.user_id = profiles.user_id
        AND (p.assigned_psychologist_id = auth.uid()
          OR p.assigned_psychiatrist_id = auth.uid())
    )
  );

-- ============================================================================
-- PATIENTS
-- ============================================================================

-- Patients see only their own row
CREATE POLICY patients_select_own ON patients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY patients_update_own ON patients
  FOR UPDATE USING (user_id = auth.uid());

-- Psychologists see assigned patients
CREATE POLICY patients_select_psychologist ON patients
  FOR SELECT USING (assigned_psychologist_id = auth.uid());

-- Psychiatrists see assigned patients
CREATE POLICY patients_select_psychiatrist ON patients
  FOR SELECT USING (assigned_psychiatrist_id = auth.uid());

-- Admin sees all
CREATE POLICY patients_select_admin ON patients
  FOR SELECT USING (is_admin());

CREATE POLICY patients_update_admin ON patients
  FOR ALL USING (is_admin());

-- ============================================================================
-- PROVIDERS
-- ============================================================================

-- Providers can see their own row
CREATE POLICY providers_select_own ON providers
  FOR SELECT USING (user_id = auth.uid());

-- Patients can see their assigned providers
CREATE POLICY providers_select_patient ON providers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.user_id = auth.uid()
        AND (p.assigned_psychologist_id = providers.user_id
          OR p.assigned_psychiatrist_id = providers.user_id)
    )
  );

-- Admin sees all
CREATE POLICY providers_select_admin ON providers
  FOR SELECT USING (is_admin());

CREATE POLICY providers_update_admin ON providers
  FOR ALL USING (is_admin());

-- ============================================================================
-- YB MODULES (read-only for patients/providers, writable by admin)
-- ============================================================================

CREATE POLICY yb_modules_select_all ON yb_modules
  FOR SELECT USING (true);

CREATE POLICY yb_modules_admin ON yb_modules
  FOR ALL USING (is_admin());

-- ============================================================================
-- YB CONTENT ITEMS (read-only for patients/providers, writable by admin)
-- ============================================================================

CREATE POLICY yb_content_items_select_all ON yb_content_items
  FOR SELECT USING (true);

CREATE POLICY yb_content_items_admin ON yb_content_items
  FOR ALL USING (is_admin());

-- ============================================================================
-- PATIENT MODULES
-- ============================================================================

-- Patient sees own modules
CREATE POLICY patient_modules_select_own ON patient_modules
  FOR SELECT USING (patient_id = get_my_patient_id());

CREATE POLICY patient_modules_update_own ON patient_modules
  FOR UPDATE USING (patient_id = get_my_patient_id());

-- Psychologist sees assigned patients' modules
CREATE POLICY patient_modules_select_psychologist ON patient_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_modules.patient_id
        AND p.assigned_psychologist_id = auth.uid()
    )
  );

-- Psychologist can assign/update modules
CREATE POLICY patient_modules_modify_psychologist ON patient_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_modules.patient_id
        AND p.assigned_psychologist_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY patient_modules_admin ON patient_modules
  FOR ALL USING (is_admin());

-- ============================================================================
-- PATIENT CONTENT RESPONSES
-- ============================================================================

-- Patient sees own responses
CREATE POLICY patient_content_responses_select_own ON patient_content_responses
  FOR SELECT USING (patient_id = get_my_patient_id());

CREATE POLICY patient_content_responses_insert_own ON patient_content_responses
  FOR INSERT WITH CHECK (patient_id = get_my_patient_id());

CREATE POLICY patient_content_responses_update_own ON patient_content_responses
  FOR UPDATE USING (patient_id = get_my_patient_id());

-- Psychologist sees assigned patients' responses
CREATE POLICY patient_content_responses_select_psychologist ON patient_content_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_content_responses.patient_id
        AND p.assigned_psychologist_id = auth.uid()
    )
  );

-- Psychologist can review/flag responses
CREATE POLICY patient_content_responses_update_psychologist ON patient_content_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_content_responses.patient_id
        AND p.assigned_psychologist_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY patient_content_responses_admin ON patient_content_responses
  FOR ALL USING (is_admin());

-- ============================================================================
-- SYMPTOM LOGS
-- ============================================================================

-- Patient sees own logs
CREATE POLICY symptom_logs_select_own ON symptom_logs
  FOR SELECT USING (patient_id = get_my_patient_id());

CREATE POLICY symptom_logs_insert_own ON symptom_logs
  FOR INSERT WITH CHECK (patient_id = get_my_patient_id());

-- Psychologist sees assigned patients' logs
CREATE POLICY symptom_logs_select_psychologist ON symptom_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = symptom_logs.patient_id
        AND p.assigned_psychologist_id = auth.uid()
    )
  );

-- Psychiatrist sees assigned patients' logs
CREATE POLICY symptom_logs_select_psychiatrist ON symptom_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = symptom_logs.patient_id
        AND p.assigned_psychiatrist_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY symptom_logs_admin ON symptom_logs
  FOR ALL USING (is_admin());

-- ============================================================================
-- MEDICATIONS
-- ============================================================================

-- Patient sees own medications
CREATE POLICY medications_select_own ON medications
  FOR SELECT USING (patient_id = get_my_patient_id());

-- Psychiatrist sees/manages medications for assigned patients
CREATE POLICY medications_select_psychiatrist ON medications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medications.patient_id
        AND p.assigned_psychiatrist_id = auth.uid()
    )
  );

CREATE POLICY medications_modify_psychiatrist ON medications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medications.patient_id
        AND p.assigned_psychiatrist_id = auth.uid()
    )
  );

-- Psychologist can read (but not modify) medications
CREATE POLICY medications_select_psychologist ON medications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medications.patient_id
        AND p.assigned_psychologist_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY medications_admin ON medications
  FOR ALL USING (is_admin());

-- ============================================================================
-- MEDICATION LOGS
-- ============================================================================

-- Patient sees own medication logs
CREATE POLICY medication_logs_select_own ON medication_logs
  FOR SELECT USING (patient_id = get_my_patient_id());

CREATE POLICY medication_logs_insert_own ON medication_logs
  FOR INSERT WITH CHECK (patient_id = get_my_patient_id());

-- Psychiatrist sees assigned patients' medication logs
CREATE POLICY medication_logs_select_psychiatrist ON medication_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medication_logs.patient_id
        AND p.assigned_psychiatrist_id = auth.uid()
    )
  );

-- Psychologist can read medication logs for context
CREATE POLICY medication_logs_select_psychologist ON medication_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medication_logs.patient_id
        AND p.assigned_psychologist_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY medication_logs_admin ON medication_logs
  FOR ALL USING (is_admin());

-- ============================================================================
-- SESSIONS
-- ============================================================================

-- Patient sees own sessions
CREATE POLICY sessions_select_own ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = sessions.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- Provider sees their own sessions
CREATE POLICY sessions_select_provider ON sessions
  FOR SELECT USING (provider_id = auth.uid());

-- Provider can create/update their sessions
CREATE POLICY sessions_modify_provider ON sessions
  FOR ALL USING (provider_id = auth.uid());

-- Admin full access
CREATE POLICY sessions_admin ON sessions
  FOR ALL USING (is_admin());

-- ============================================================================
-- AI CHECKINS
-- ============================================================================

-- Patient sees own AI checkins
CREATE POLICY ai_checkins_select_own ON ai_checkins
  FOR SELECT USING (patient_id = get_my_patient_id());

-- Psychologist sees flagged checkins for assigned patients
CREATE POLICY ai_checkins_select_psychologist ON ai_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = ai_checkins.patient_id
        AND p.assigned_psychologist_id = auth.uid()
    )
  );

-- Psychiatrist sees flagged checkins for assigned patients
CREATE POLICY ai_checkins_select_psychiatrist ON ai_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = ai_checkins.patient_id
        AND p.assigned_psychiatrist_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY ai_checkins_admin ON ai_checkins
  FOR ALL USING (is_admin());
