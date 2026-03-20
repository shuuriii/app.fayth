-- 01_seed_modules.sql
-- Seed all 14 YB Programme modules into yb_modules
-- Safe to re-run: uses ON CONFLICT DO UPDATE
--
-- Deterministic UUIDs: 00000000-0000-4000-8000-0000000000XX
-- where XX = zero-padded chapter number (01-14)

INSERT INTO yb_modules (id, chapter_number, title, description, prerequisite_module_ids, target_symptoms, estimated_sessions, sequence_order, active)
VALUES
  (
    '00000000-0000-4000-8000-000000000001',
    1,
    'Introduction to ADHD in Adults',
    'Psychoeducation on what ADHD is in adulthood, the YB programme overview, and the six-stage psychological adjustment model post-diagnosis.',
    '{}',
    ARRAY['psychoeducation', 'self-understanding', 'diagnosis-adjustment'],
    2, 1, true
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    2,
    'Assessment',
    'Comprehensive assessment of ADHD symptoms in adults using clinical tools, symptom checklists, and neuropsychological evaluation.',
    '{1}',
    ARRAY['inattention', 'hyperactivity', 'impulsivity'],
    2, 2, true
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    3,
    'Treatment Overview & Medication',
    'Overview of treatment approaches including medication (methylphenidate, atomoxetine), motivational interviewing, and the YB programme structure.',
    '{2}',
    ARRAY['medication-adherence', 'motivation', 'treatment-engagement'],
    2, 3, true
  ),
  (
    '00000000-0000-4000-8000-000000000004',
    4,
    'Inattention & Memory',
    'Strategies for managing attentional difficulties and memory problems. Core module — foundation for all subsequent skill modules.',
    '{3}',
    ARRAY['inattention', 'working-memory', 'distractibility', 'forgetfulness'],
    3, 4, true
  ),
  (
    '00000000-0000-4000-8000-000000000005',
    5,
    'Time Management',
    'Structured approaches to planning, prioritisation, time estimation, and scheduling. Includes diary activity logs and time plans.',
    '{4}',
    ARRAY['time-blindness', 'planning', 'organisation', 'punctuality'],
    4, 5, true
  ),
  (
    '00000000-0000-4000-8000-000000000006',
    6,
    'Problem Solving',
    'Structured problem-solving framework. Brainstorming, pros/cons analysis, solution evaluation, and implementation planning.',
    '{4}',
    ARRAY['executive-dysfunction', 'decision-making', 'avoidance'],
    3, 6, true
  ),
  (
    '00000000-0000-4000-8000-000000000007',
    7,
    'Impulsivity',
    'Impulse identification, monitoring, and control strategies. IMPULSE method and CONTROL framework for managing impulsive behaviour.',
    '{4}',
    ARRAY['impulsivity', 'self-control', 'risk-behaviour', 'emotional-dysregulation'],
    3, 7, true
  ),
  (
    '00000000-0000-4000-8000-000000000008',
    8,
    'Social Relationships',
    'Communication skills, listening, conversational awareness, emotion recognition, and interpersonal functioning for adults with ADHD.',
    '{4}',
    ARRAY['social-skills', 'communication', 'relationships', 'emotion-recognition'],
    3, 8, true
  ),
  (
    '00000000-0000-4000-8000-000000000009',
    9,
    'Anxiety',
    'CBT-based anxiety management. Thought diaries, cognitive restructuring, breathing exercises, progressive muscle relaxation, and graded exposure.',
    '{4}',
    ARRAY['anxiety', 'panic', 'avoidance', 'negative-thinking', 'worry'],
    5, 9, true
  ),
  (
    '00000000-0000-4000-8000-000000000010',
    10,
    'Frustration & Anger',
    'Understanding and managing frustration and anger in ADHD. The ADHD formula, assertion skills, and anger regulation strategies.',
    '{4}',
    ARRAY['anger', 'frustration', 'emotional-dysregulation', 'aggression'],
    4, 10, true
  ),
  (
    '00000000-0000-4000-8000-000000000011',
    11,
    'Low Mood & Depression',
    'CBT for depression in ADHD. Cognitive model of depression, thinking error identification, negative thought challenging, and activity scheduling.',
    '{4}',
    ARRAY['depression', 'low-mood', 'anhedonia', 'negative-thinking', 'self-criticism'],
    5, 11, true
  ),
  (
    '00000000-0000-4000-8000-000000000012',
    12,
    'Sleep Problems',
    'Sleep hygiene, dysfunctional sleep cycle identification, behavioural and mood-based sleep strategies, and sleep diary monitoring.',
    '{4}',
    ARRAY['insomnia', 'sleep-dysregulation', 'fatigue', 'circadian-disruption'],
    3, 12, true
  ),
  (
    '00000000-0000-4000-8000-000000000013',
    13,
    'Substance Misuse',
    'Stages of substance use, motivational interviewing for change, decisional balance, craving management, and distraction techniques.',
    '{4}',
    ARRAY['substance-misuse', 'addiction', 'impulsivity', 'avoidance'],
    5, 13, true
  ),
  (
    '00000000-0000-4000-8000-000000000014',
    14,
    'Preparing for the Future',
    'Consolidation of progress, goal-setting for the future, review of successful strategies, and relapse prevention planning.',
    '{}',
    ARRAY['consolidation', 'future-planning', 'relapse-prevention'],
    2, 14, true
  )
ON CONFLICT (id) DO UPDATE SET
  chapter_number     = EXCLUDED.chapter_number,
  title              = EXCLUDED.title,
  description        = EXCLUDED.description,
  prerequisite_module_ids = EXCLUDED.prerequisite_module_ids,
  target_symptoms    = EXCLUDED.target_symptoms,
  estimated_sessions = EXCLUDED.estimated_sessions,
  sequence_order     = EXCLUDED.sequence_order,
  active             = EXCLUDED.active,
  updated_at         = now();
