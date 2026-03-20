-- rls_test.sql
-- Tests all RLS policies across 4 roles
-- Run after: supabase db reset
-- Usage: psql $DATABASE_URL -f supabase/tests/rls_test.sql

-- ============================================================================
-- SETUP: Create test users in auth.users and populate tables
-- ============================================================================

-- Deterministic test UUIDs
\set patient_a_uid '\'aaaaaaaa-aaaa-4000-8000-aaaaaaaaaaaa\''
\set patient_b_uid '\'bbbbbbbb-bbbb-4000-8000-bbbbbbbbbbbb\''
\set psychologist_uid '\'cccccccc-cccc-4000-8000-cccccccccccc\''
\set psychiatrist_uid '\'dddddddd-dddd-4000-8000-dddddddddddd\''
\set admin_uid '\'eeeeeeee-eeee-4000-8000-eeeeeeeeeeee\''

BEGIN;

-- Insert test users into auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud, instance_id)
VALUES
  (:patient_a_uid, 'patient_a@test.com', crypt('test1234', gen_salt('bf')), now(), 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  (:patient_b_uid, 'patient_b@test.com', crypt('test1234', gen_salt('bf')), now(), 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  (:psychologist_uid, 'psychologist@test.com', crypt('test1234', gen_salt('bf')), now(), 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  (:psychiatrist_uid, 'psychiatrist@test.com', crypt('test1234', gen_salt('bf')), now(), 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  (:admin_uid, 'admin@test.com', crypt('test1234', gen_salt('bf')), now(), 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Create profiles
INSERT INTO profiles (user_id, role, full_name, phone) VALUES
  (:patient_a_uid, 'patient', 'Patient A', '+919876543210'),
  (:patient_b_uid, 'patient', 'Patient B', '+919876543211'),
  (:psychologist_uid, 'psychologist', 'Dr. Psych', '+919876543212'),
  (:psychiatrist_uid, 'psychiatrist', 'Dr. Medic', '+919876543213'),
  (:admin_uid, 'admin', 'Admin User', '+919876543214')
ON CONFLICT DO NOTHING;

-- Create patient records (Patient A assigned to both providers, Patient B unassigned)
INSERT INTO patients (user_id, assigned_psychologist_id, assigned_psychiatrist_id, adhd_subtype, adjustment_stage)
VALUES
  (:patient_a_uid, :psychologist_uid, :psychiatrist_uid, 'combined', 2),
  (:patient_b_uid, NULL, NULL, 'inattentive', 1)
ON CONFLICT DO NOTHING;

-- Create provider records
INSERT INTO providers (user_id, role, license_number) VALUES
  (:psychologist_uid, 'psychologist', 'PSY-001'),
  (:psychiatrist_uid, 'psychiatrist', 'PST-001')
ON CONFLICT DO NOTHING;

-- Get patient table IDs for FK references
DO $$
DECLARE
  v_patient_a_id UUID;
  v_patient_b_id UUID;
BEGIN
  SELECT id INTO v_patient_a_id FROM patients WHERE user_id = 'aaaaaaaa-aaaa-4000-8000-aaaaaaaaaaaa';
  SELECT id INTO v_patient_b_id FROM patients WHERE user_id = 'bbbbbbbb-bbbb-4000-8000-bbbbbbbbbbbb';

  -- Symptom logs for both patients
  INSERT INTO symptom_logs (patient_id, focus_score, mood_score, energy_score, impulsivity_score, sleep_hours)
  VALUES
    (v_patient_a_id, 5, 6, 4, 7, 7.5),
    (v_patient_b_id, 3, 4, 5, 8, 6.0);

  -- Medication for Patient A
  INSERT INTO medications (patient_id, name, dose_mg, frequency, prescribed_by, active)
  VALUES (v_patient_a_id, 'Methylphenidate', 10, 'twice daily', 'dddddddd-dddd-4000-8000-dddddddddddd', true);
END $$;

COMMIT;

-- ============================================================================
-- TEST 1: Patient A can see own data, NOT Patient B's data
-- ============================================================================

\echo '=== TEST 1: Patient isolation ==='

-- Set role to Patient A
SET request.jwt.claim.sub = 'aaaaaaaa-aaaa-4000-8000-aaaaaaaaaaaa';
SET role = 'authenticated';

SELECT 'Patient A sees own profile' AS test,
       CASE WHEN count(*) = 1 THEN 'PASS' ELSE 'FAIL' END AS result
FROM profiles WHERE user_id = 'aaaaaaaa-aaaa-4000-8000-aaaaaaaaaaaa'::uuid;

SELECT 'Patient A cannot see Patient B profile directly' AS test,
       CASE WHEN count(*) <= 1 THEN 'PASS' ELSE 'FAIL — saw other patient profile' END AS result
FROM profiles WHERE role = 'patient';

SELECT 'Patient A sees own symptom logs' AS test,
       CASE WHEN count(*) >= 1 THEN 'PASS' ELSE 'FAIL' END AS result
FROM symptom_logs sl
JOIN patients p ON sl.patient_id = p.id
WHERE p.user_id = 'aaaaaaaa-aaaa-4000-8000-aaaaaaaaaaaa'::uuid;

SELECT 'Patient A cannot see Patient B symptom logs' AS test,
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL — data leak!' END AS result
FROM symptom_logs sl
JOIN patients p ON sl.patient_id = p.id
WHERE p.user_id = 'bbbbbbbb-bbbb-4000-8000-bbbbbbbbbbbb'::uuid;

-- ============================================================================
-- TEST 2: Psychologist sees assigned patients only
-- ============================================================================

\echo '=== TEST 2: Psychologist access ==='

SET request.jwt.claim.sub = 'cccccccc-cccc-4000-8000-cccccccccccc';
SET role = 'authenticated';

SELECT 'Psychologist sees assigned patient' AS test,
       CASE WHEN count(*) >= 1 THEN 'PASS' ELSE 'FAIL' END AS result
FROM patients WHERE assigned_psychologist_id = 'cccccccc-cccc-4000-8000-cccccccccccc'::uuid;

SELECT 'Psychologist sees assigned patient logs' AS test,
       CASE WHEN count(*) >= 1 THEN 'PASS' ELSE 'FAIL' END AS result
FROM symptom_logs sl
JOIN patients p ON sl.patient_id = p.id
WHERE p.assigned_psychologist_id = 'cccccccc-cccc-4000-8000-cccccccccccc'::uuid;

-- ============================================================================
-- TEST 3: Psychiatrist sees medication data for assigned patients
-- ============================================================================

\echo '=== TEST 3: Psychiatrist access ==='

SET request.jwt.claim.sub = 'dddddddd-dddd-4000-8000-dddddddddddd';
SET role = 'authenticated';

SELECT 'Psychiatrist sees assigned patient medications' AS test,
       CASE WHEN count(*) >= 1 THEN 'PASS' ELSE 'FAIL' END AS result
FROM medications m
JOIN patients p ON m.patient_id = p.id
WHERE p.assigned_psychiatrist_id = 'dddddddd-dddd-4000-8000-dddddddddddd'::uuid;

-- ============================================================================
-- TEST 4: Admin sees everything
-- ============================================================================

\echo '=== TEST 4: Admin access ==='

SET request.jwt.claim.sub = 'eeeeeeee-eeee-4000-8000-eeeeeeeeeeee';
SET role = 'authenticated';

SELECT 'Admin sees all patients' AS test,
       CASE WHEN count(*) >= 2 THEN 'PASS' ELSE 'FAIL' END AS result
FROM patients;

SELECT 'Admin sees all profiles' AS test,
       CASE WHEN count(*) >= 5 THEN 'PASS' ELSE 'FAIL' END AS result
FROM profiles;

SELECT 'Admin sees all symptom logs' AS test,
       CASE WHEN count(*) >= 2 THEN 'PASS' ELSE 'FAIL' END AS result
FROM symptom_logs;

-- ============================================================================
-- TEST 5: YB modules readable by all authenticated users
-- ============================================================================

\echo '=== TEST 5: YB modules access ==='

SET request.jwt.claim.sub = 'aaaaaaaa-aaaa-4000-8000-aaaaaaaaaaaa';
SET role = 'authenticated';

SELECT 'Patient can read YB modules' AS test,
       CASE WHEN count(*) >= 14 THEN 'PASS' ELSE 'FAIL' END AS result
FROM yb_modules;

SELECT 'Patient can read YB content items' AS test,
       CASE WHEN count(*) >= 1 THEN 'PASS' ELSE 'FAIL' END AS result
FROM yb_content_items;

-- Reset
RESET role;
RESET request.jwt.claim.sub;

\echo '=== RLS tests complete ==='
