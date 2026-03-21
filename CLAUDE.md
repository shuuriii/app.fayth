# fayth.life — Claude Code Context

## What this project is

fayth.life is an ADHD screening, management, and consulting platform for adults in India.
Founded by Sunshine (MBBS, Chennai). The platform has two sides:

- **Patient app** (Expo / React Native) — mobile-first
- **Provider dashboard** (Next.js 14) — web, for psychologists, psychiatrists, admin

## The core product logic

The entire therapy content is based on the **Young–Bramham (YB) Programme** — a modular
CBT-based treatment protocol from the book "ADHD in Adults" by Susan Young & Jessica Bramham.
The book has 14 chapters, each a standalone therapy module. Every worksheet, table, diary,
and checklist from the book is encoded as structured JSON in the database. This is our moat.

## Tech Stack (start fresh — do not assume any existing setup)

### Monorepo

- **Turborepo** — monorepo manager
- `apps/patient` — Expo (React Native) with Expo Router
- `apps/provider` — Next.js 14 App Router
- `packages/ui` — shared components
- `packages/types` — shared TypeScript types
- `packages/db` — Prisma ORM schema + generated client
- `packages/ai` — LLM wrapper (provider-agnostic, see AI section)
- `packages/yb-engine` — YB Programme module logic

### Backend / Infra

- **Supabase** — Postgres + Auth + RLS + Realtime + Storage
- **FastAPI** (Python) — AI/ML layer: KNN classifier (FocusOS), report generation (Plotly)
- **Prisma** — ORM, schema-as-code, type-safe queries

### AI / LLM

Provider-agnostic. Switch via env vars:

```
LLM_PROVIDER=groq|ollama|anthropic
LLM_MODEL=...
LLM_BASE_URL=...
```

- **Development**: Groq API (DeepSeek R1 or Llama 3.3 70B) — fast, free tier
- **Production**: Self-hosted Llama 3.3 70B via Ollama on GPU server (data sovereignty)
- **Fallback**: Anthropic Claude API

### Other

- **Razorpay** — payments (India, UPI, subscriptions)
- **Expo Push Notifications** — medication reminders, session reminders, check-ins
- **PostHog** — analytics, self-hostable
- **Resend** — transactional email

## Database Schema (Supabase / Postgres via Prisma)

### Key tables

```
users          — Supabase auth (id, email)
profiles       — (user_id, role: patient|psychologist|psychiatrist|admin, full_name, phone)

patients       — (user_id, assigned_psychologist_id, assigned_psychiatrist_id,
                  diagnosis_date, adhd_subtype: inattentive|hyperactive|combined,
                  adjustment_stage: 1-6, focusos_score JSONB, onboarding_complete)

providers      — (user_id, role, license_number, specialty, bio)

-- YB PROGRAMME ENGINE
yb_modules     — (id, chapter_number 1-14, title, description,
                  prerequisite_chapters INT[], target_symptoms TEXT[],
                  estimated_sessions INT, sequence_order INT, active BOOL)

yb_content_items — (id, module_id FK, type: worksheet|table|exercise|diary|psychoeducation,
                    title, instructions TEXT, schema JSONB, xp_value INT,
                    companion_website_ref TEXT)

-- PATIENT PROGRESS
patient_modules  — (patient_id, module_id, status: locked|assigned|active|complete,
                    assigned_by FK, assigned_at, started_at, completed_at, xp_earned)

patient_content_responses — (patient_id, content_item_id, session_date,
                             response_data JSONB, ai_feedback TEXT,
                             reviewed_by_provider_id, flagged BOOL)

-- TRACKING
symptom_logs   — (patient_id, logged_at, focus_score 1-10, mood_score 1-10,
                  energy_score 1-10, impulsivity_score 1-10, sleep_hours, notes)

medications    — (patient_id, name, dose_mg, frequency, form: IR|SR,
                  prescribed_by FK, start_date, active)

medication_logs — (patient_id, medication_id, taken_at, missed BOOL, side_effects TEXT[])

-- SESSIONS
sessions       — (id, patient_id, provider_id, type: therapy|medication_review,
                  scheduled_at, duration_mins, status: scheduled|complete|cancelled,
                  ai_pre_session_summary TEXT, provider_notes TEXT, modules_worked_on INT[])

-- AI
ai_checkins    — (patient_id, triggered_at, context JSONB, response TEXT,
                  flagged_for_provider BOOL, flag_reason TEXT)
```

### RLS Rules

- Patients see only their own rows (`patient_id = auth.uid()`)
- Psychologists see rows where patient is assigned to them
- Psychiatrists see medication-related rows for assigned patients
- Admin sees everything
- **Always enforce at DB level via Supabase RLS policies, not just API logic**

## YB Programme Module Structure

```
Module 1  — Introduction & ADHD Background      (Chapter 1) — always unlocked
Module 2  — Assessment                          (Chapter 2) — unlocked after 1
Module 3  — Treatment Overview & Medication     (Chapter 3) — unlocked after 2
Module 4  — Inattention & Memory               (Chapter 4) — CORE, assigned by psychologist
Module 5  — Time Management                    (Chapter 5) — prerequisite: 4
Module 6  — Problem Solving                    (Chapter 6) — prerequisite: 4
Module 7  — Impulsivity                        (Chapter 7) — prerequisite: 4
Module 8  — Social Relationships               (Chapter 8) — assigned by psychologist
Module 9  — Anxiety                            (Chapter 9) — assigned if comorbid
Module 10 — Frustration & Anger               (Chapter 10) — assigned if comorbid
Module 11 — Low Mood & Depression             (Chapter 11) — assigned if comorbid
Module 12 — Sleep Problems                    (Chapter 12) — assigned if comorbid
Module 13 — Substance Misuse                  (Chapter 13) — assigned if comorbid
Module 14 — Preparing for the Future         (Chapter 14) — final, after ≥4 core modules
```

## yb_content_items Schema Field Reference

The `schema` JSONB field defines what fields a worksheet has. Format:

```json
{
  "fields": [
    {
      "id": "field_1",
      "label": "Question or prompt text",
      "type": "text|number|scale|likert|checkbox|time|date|textarea|select",
      "required": true,
      "options": ["Only for select/likert/checkbox types"],
      "scale_min": 0,
      "scale_max": 10,
      "scale_labels": {"0": "Never", "4": "Always"},
      "placeholder": "hint text"
    }
  ],
  "scoring": {
    "method": "sum|average|custom|none",
    "interpretation": {"low": "text", "medium": "text", "high": "text"}
  },
  "instructions_for_patient": "What to tell the patient before they fill this in",
  "clinician_notes": "What the therapist should know about this tool"
}
```

## The Six Psychological Adjustment Stages (Post-Diagnosis)

Critical for onboarding content pacing. After diagnosis, patients go through:

1. Relief and elation
2. Confusion and emotional turmoil
3. Anger ("why wasn't I diagnosed sooner?")
4. Sadness and grief
5. Anxiety (chronic lifelong condition)
6. Accommodation and acceptance

**Important**: Patients don't absorb information at diagnosis. The app should NOT
dump content at onboarding. Pace psychoeducation across first 2-3 sessions.
The adjustment stage should be stored in `patients.adjustment_stage` and updated by AI/provider.

## AI Integration Points

1. **Post-session check-ins** (patient-facing, daily)
   - Input: symptom_logs last 7 days, active module, last worksheet response
   - Output: short warm CBT-informed message
   - Flag if scores drop sharply → create alert for provider

2. **Pre-session summary** (provider-facing, auto 24hr before session)
   - Input: 2 weeks of logs, worksheet completions, medication adherence, flags
   - Output: structured summary — trends, wins, concerns, suggested focus

3. **Worksheet guidance** (patient-facing, in-app)
   - Explains what a question means, gives examples
   - Does NOT do the therapy itself

4. **Module recommendation** (provider-facing)
   - Suggests next module based on symptom profile
   - Psychologist approves

5. **Adjustment stage detection** (internal, background)
   - Periodic re-evaluation based on responses
   - Surfaces to psychologist as a suggested update

## Gamification

```
XP:
  Log symptoms (daily streak)    → 10 XP, 2x after 7-day streak
  Complete worksheet             → 50 XP
  Take medication on time        → 15 XP
  Attend session                 → 100 XP
  Complete module                → 500 XP

Levels (6 — mirror adjustment stages):
  Seed → Sapling → Sprout → Focus → Flow → Thrive

Key streaks:
  Daily check-in, Medication, Session attendance
```

## Build Sequence

- **Phase 0** (now): Turborepo scaffold + Supabase project + Auth with 4 roles + routing skeleton
- **Phase 1** (MVP): Patient onboarding + symptom logging + 1 worksheet + provider patient list + AI pre-session summary
- **Phase 2**: All 14 YB modules seeded + universal worksheet renderer + module engine + gamification
- **Phase 3**: Psychiatrist views, medication management, analytics, subscriptions

## File Structure

```
fayth.life/
├── apps/
│   ├── patient/              # Expo app
│   └── provider/             # Next.js 14
├── packages/
│   ├── ui/
│   ├── types/
│   ├── db/                   # Prisma schema here
│   ├── ai/                   # LLM wrapper
│   └── yb-engine/            # module logic
├── supabase/
│   ├── migrations/
│   └── seed/                 # YB content library — JSON files
└── fastapi/                  # Python service
    ├── focusos/              # KNN classifier
    ├── ai/                   # checkins, summaries
    └── reports/              # Plotly
```

## Seed Data Location

All YB content lives in `supabase/seed/`.
File per module: `module_01.json` through `module_14.json`
Schema: `{ module: {...}, content_items: [...] }`
Seed script: `supabase/seed/run_seed.py`

## Key Constraints

- **Never store clinical data outside Supabase** (no logs in FastAPI)
- All LLM prompts must be in `packages/ai/prompts/` as versioned files
- **No patient PII in LLM context** — use patient_id references, not names/emails
- RLS must be tested before any patient-facing feature ships
- **India-first**: phone number login (OTP via Supabase), UPI payment, Hindi/Tamil i18n planned Phase 3
