# fayth.life — Project Tracker

> Last updated: 2026-03-22 (sprint tracker added)

---

## Phase 0 — Scaffold & Foundation

- [x] Turborepo monorepo setup (pnpm workspaces)
- [x] Supabase project + Postgres schema (initial migration)
- [x] Auth with 4 roles (patient, psychologist, psychiatrist, admin)
- [x] RLS policies (row-level security for all tables)
- [x] Additional indexes for performance
- [x] Expo (patient) app skeleton with Expo Router
- [x] Next.js 14 (provider) dashboard skeleton
- [x] Shared packages: `ui`, `types`, `db` (Prisma), `ai`, `yb-engine`
- [x] All 14 YB module seed data (JSON + SQL)
- [x] FastAPI service scaffold (focusos, ai, reports)

---

## Phase 1 — MVP (1 psychologist + 3 patients)

### Patient App

- [x] Welcome screen with role selection
- [x] Patient onboarding flow (name, diagnosis)
- [x] Home tab (dashboard)
- [x] Symptom logging (log tab)
- [x] Profile tab
- [x] Universal worksheet renderer (WorksheetRenderer)
- [x] Module browser / detail screen (`module/[id]`)
- [x] Growth Garden module map (ModuleMap)
- [x] Psychoeducation reader with vertical scroll
- [x] Score display & score sliders
- [x] Micro-celebrations on completion
- [x] Fay AI companion (firefly animation, LLM check-ins)
- [x] Gamification: XP awarding, levels, streaks
- [x] Module unlock logic & auto-completion
- [x] Stepped worksheets with auto-save indicator
- [x] Medication logging UI
- [x] Push notifications (token registration + batch push via edge function)
- [x] Daily check-in flow (pg_cron 9AM IST → edge function → Fay message + push)

### Provider Dashboard

- [x] Login page
- [x] Main dashboard
- [x] Patient list view
- [x] Individual patient profile page
- [x] Session management page
- [x] AI pre-session summary component
- [x] Module assignment UI (assign-module)
- [x] Worksheet response review (flagged items)
- [x] Provider notes on sessions

### Backend / AI

- [x] LLM client abstraction (provider-agnostic: Groq/Ollama/Anthropic)
- [x] AI prompt templates (`packages/ai/generators/`)
- [x] PII sanitization (`packages/ai/sanitize.ts`)
- [x] Fay check-in message generation (`packages/yb-engine/fay.ts`)
- [x] FastAPI: adjustment stage detection
- [x] FastAPI: module recommendation engine
- [x] FastAPI: FocusOS KNN classifier
- [x] FastAPI: Plotly report/chart generation
- [ ] AI pre-session summary auto-trigger (24hr before session)
- [ ] Worksheet guidance (in-app AI hints)

### Database / Infra

- [x] Initial schema migration
- [x] RLS policies migration
- [x] Performance indexes
- [x] Gamification fields (XP, level columns)
- [x] Security hardening migration
- [x] Adjustment stage RLS + column rename
- [x] XP ↔ level sync
- [x] Session attendance XP
- [x] Expo push token migration (applied, vault-secured cron)
- [x] Daily check-in cron migration (9AM IST, pg_cron + pg_net)
- [x] EAS Build tested end-to-end (preview APK built 2026-03-22)

---

## Current Sprint — Close Phase 1 for Pilot

> Goal: Get a working pilot system for 1 psychologist + 3 patients

### Batch 1 — Core Gaps
- [x] Medication logging screen (patient app — new Meds tab)
- [x] Provider session detail page with notes editing
- [x] Link session rows to detail page

### Batch 2 — Provider Review + Infra
- [x] Worksheet response review drill-down (provider dashboard)
- [x] Link patient detail response rows to review page
- [x] Apply pending migrations (expo push token + daily checkin cron)
- [x] Deploy daily-checkin-batch edge function

### Batch 3 — Polish
- [x] Error boundary for patient app
- [x] EAS Build smoke test (Android APK — build 2f4f5e05, finished 2026-03-22)

### Deferred (not blocking pilot)
- AI pre-session summary auto-trigger (manual click works)
- Worksheet AI guidance (psychologist present during pilot)
- Push notification scheduling (WhatsApp reminders for 3 patients)

---

## Phase 2 — Full YB Programme

- [ ] All 14 modules fully playable with all worksheets
- [ ] Module prerequisite enforcement in app
- [ ] Comorbid module assignment flow (Modules 9-13)
- [ ] Module 14 unlock after 4+ core modules
- [ ] Advanced gamification (streak multipliers, badges)
- [ ] Comprehensive progress analytics (patient-facing)
- [ ] Provider analytics dashboard (trends, cohort view)

---

## Phase 3 — Scale & Monetize

- [ ] Psychiatrist-specific views (medication management)
- [ ] Medication management (prescriptions, adherence tracking)
- [ ] Razorpay integration (UPI, subscriptions)
- [ ] PostHog analytics (self-hosted)
- [ ] Resend transactional email
- [ ] Hindi/Tamil i18n
- [ ] Phone number OTP login (India-first)
- [ ] Patient reports (PDF export)
- [ ] Data export / GDPR compliance

---

## Notes

- MVP target: 1 psychologist + 3 patients, CBT/psychoeducation focus
- No hard deadline — quality over speed
- India-first: all UX decisions should prioritize Indian users
