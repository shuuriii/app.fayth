-- 001_initial_schema.sql
-- fayth.life — Initial database schema
-- All tables from CLAUDE.md, RLS enabled (no policies yet)

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('patient', 'psychologist', 'psychiatrist', 'admin');
CREATE TYPE adhd_subtype AS ENUM ('inattentive', 'hyperactive', 'combined');
CREATE TYPE module_status AS ENUM ('locked', 'assigned', 'active', 'complete');
CREATE TYPE content_item_type AS ENUM ('worksheet', 'table', 'exercise', 'diary', 'psychoeducation');
CREATE TYPE medication_form AS ENUM ('IR', 'SR');
CREATE TYPE session_type AS ENUM ('therapy', 'medication_review');
CREATE TYPE session_status AS ENUM ('scheduled', 'complete', 'cancelled');

-- ============================================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PATIENTS
-- ============================================================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_psychologist_id UUID REFERENCES auth.users(id),
    assigned_psychiatrist_id UUID REFERENCES auth.users(id),
    diagnosis_date DATE,
    adhd_subtype adhd_subtype,
    adjustment_stage INT CHECK (adjustment_stage BETWEEN 1 AND 6),
    focusos_score JSONB,
    onboarding_complete BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_assigned_psychologist ON patients(assigned_psychologist_id);
CREATE INDEX idx_patients_assigned_psychiatrist ON patients(assigned_psychiatrist_id);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROVIDERS
-- ============================================================================

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL CHECK (role IN ('psychologist', 'psychiatrist', 'admin')),
    license_number TEXT,
    specialty TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_role ON providers(role);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- YB PROGRAMME ENGINE
-- ============================================================================

CREATE TABLE yb_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_number INT NOT NULL UNIQUE CHECK (chapter_number BETWEEN 1 AND 14),
    title TEXT NOT NULL,
    description TEXT,
    prerequisite_module_ids INT[],
    target_symptoms TEXT[],
    estimated_sessions INT,
    sequence_order INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_yb_modules_chapter_number ON yb_modules(chapter_number);
CREATE INDEX idx_yb_modules_sequence_order ON yb_modules(sequence_order);

ALTER TABLE yb_modules ENABLE ROW LEVEL SECURITY;

CREATE TABLE yb_content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES yb_modules(id) ON DELETE CASCADE,
    type content_item_type NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT,
    schema JSONB,
    xp_value INT NOT NULL DEFAULT 0,
    companion_website_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_yb_content_items_module_id ON yb_content_items(module_id);
CREATE INDEX idx_yb_content_items_type ON yb_content_items(type);

ALTER TABLE yb_content_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PATIENT PROGRESS
-- ============================================================================

CREATE TABLE patient_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES yb_modules(id) ON DELETE CASCADE,
    status module_status NOT NULL DEFAULT 'locked',
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    xp_earned INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (patient_id, module_id)
);

CREATE INDEX idx_patient_modules_patient_id ON patient_modules(patient_id);
CREATE INDEX idx_patient_modules_module_id ON patient_modules(module_id);
CREATE INDEX idx_patient_modules_status ON patient_modules(status);

ALTER TABLE patient_modules ENABLE ROW LEVEL SECURITY;

CREATE TABLE patient_content_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    content_item_id UUID NOT NULL REFERENCES yb_content_items(id) ON DELETE CASCADE,
    session_date DATE,
    response_data JSONB,
    ai_feedback TEXT,
    reviewed_by_provider_id UUID REFERENCES auth.users(id),
    flagged BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patient_content_responses_patient_id ON patient_content_responses(patient_id);
CREATE INDEX idx_patient_content_responses_content_item_id ON patient_content_responses(content_item_id);
CREATE INDEX idx_patient_content_responses_flagged ON patient_content_responses(flagged) WHERE flagged = true;

ALTER TABLE patient_content_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TRACKING
-- ============================================================================

CREATE TABLE symptom_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    focus_score INT CHECK (focus_score BETWEEN 1 AND 10),
    mood_score INT CHECK (mood_score BETWEEN 1 AND 10),
    energy_score INT CHECK (energy_score BETWEEN 1 AND 10),
    impulsivity_score INT CHECK (impulsivity_score BETWEEN 1 AND 10),
    sleep_hours NUMERIC(3,1),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_symptom_logs_patient_id ON symptom_logs(patient_id);
CREATE INDEX idx_symptom_logs_logged_at ON symptom_logs(logged_at);
CREATE INDEX idx_symptom_logs_patient_date ON symptom_logs(patient_id, logged_at DESC);

ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dose_mg NUMERIC NOT NULL,
    frequency TEXT NOT NULL,
    form medication_form,
    prescribed_by UUID REFERENCES auth.users(id),
    start_date DATE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medications_patient_id ON medications(patient_id);
CREATE INDEX idx_medications_active ON medications(patient_id, active) WHERE active = true;

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    missed BOOLEAN NOT NULL DEFAULT false,
    side_effects TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medication_logs_patient_id ON medication_logs(patient_id);
CREATE INDEX idx_medication_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX idx_medication_logs_taken_at ON medication_logs(patient_id, taken_at DESC);

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SESSIONS
-- ============================================================================

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users(id),
    type session_type NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_mins INT,
    status session_status NOT NULL DEFAULT 'scheduled',
    ai_pre_session_summary TEXT,
    provider_notes TEXT,
    modules_worked_on INT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX idx_sessions_provider_id ON sessions(provider_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON sessions(status);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AI
-- ============================================================================

CREATE TABLE ai_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    context JSONB,
    response TEXT,
    flagged_for_provider BOOLEAN NOT NULL DEFAULT false,
    flag_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_checkins_patient_id ON ai_checkins(patient_id);
CREATE INDEX idx_ai_checkins_triggered_at ON ai_checkins(patient_id, triggered_at DESC);
CREATE INDEX idx_ai_checkins_flagged ON ai_checkins(flagged_for_provider) WHERE flagged_for_provider = true;

ALTER TABLE ai_checkins ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_yb_modules_updated_at BEFORE UPDATE ON yb_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_yb_content_items_updated_at BEFORE UPDATE ON yb_content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patient_modules_updated_at BEFORE UPDATE ON patient_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patient_content_responses_updated_at BEFORE UPDATE ON patient_content_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_symptom_logs_updated_at BEFORE UPDATE ON symptom_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_medication_logs_updated_at BEFORE UPDATE ON medication_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_ai_checkins_updated_at BEFORE UPDATE ON ai_checkins FOR EACH ROW EXECUTE FUNCTION update_updated_at();
