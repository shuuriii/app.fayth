-- 10_seed_module_12.sql
-- Seed content items for Module 12 (Sleep Problems) into yb_content_items
-- Safe to re-run: uses ON CONFLICT DO UPDATE
--
-- Module 12 UUID: 00000000-0000-4000-8000-000000000012  (from 01_seed_modules.sql)
-- Content item UUIDs: 00000000-0000-4000-a000-000000120001 through ...120011

INSERT INTO yb_content_items (id, module_id, type, title, instructions, xp_value, companion_website_ref, schema)
VALUES

-- ch12_item_01: Psychoeducation — ADHD and Sleep: Why Sleep is Hard for You
(
  '00000000-0000-4000-a000-000000120001',
  '00000000-0000-4000-8000-000000000012',
  'psychoeducation',
  'ADHD and Sleep: Why Sleep is Hard for You',
  'Read through this to understand the relationship between ADHD and sleep difficulties.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "The ADHD-Sleep Connection",
        "body": "Many people with ADHD report difficulties with sleep, but the relationship is complex. Sleep disorders themselves can cause underfunctioning of the prefrontal cortex and lead to symptoms such as short attention span and impulsivity — even in people without ADHD. So sleep problems can make your existing ADHD cognitive deficits worse."
      },
      {
        "heading": "Why Your Brain Struggles to Switch Off",
        "body": "ADHD is characterised by poor regulation of the arousal system, leading to attentional difficulties and overactivity. Many people feel too restless to fall asleep, as though they are constantly ''on the go'' and cannot relax. Sleep and attention/alertness can be thought of as opposite extremes of the same continuum. A problem with regulating the arousal system may mean you cannot achieve both full alertness during the day and deep sleep at night — only grades of semi-alertness throughout the day and night."
      },
      {
        "heading": "Ceaseless Mental Activity",
        "body": "Adults with ADHD commonly report ceaseless mental activity that persists into the night and prevents them from sleeping. This has a knock-on effect on daytime attention — you may be more prone to ''daydream'' due to sleep deprivation."
      },
      {
        "heading": "Disorganisation and Late Nights",
        "body": "Difficulties with organisation and prioritisation can often leave you trying to complete tasks very late at night, which encroaches on your sleep time. When you do go to bed, you may be preoccupied with unfinished tasks."
      },
      {
        "heading": "Medication Effects",
        "body": "Some sleep problems may be a side effect of ADHD medication, as stimulant medications may cause difficulty falling asleep. Discuss timing of medication with your prescriber if this is a concern."
      }
    ],
    "clinician_notes": "Normalise the ADHD-sleep connection. Many clients feel guilty about sleep difficulties. Emphasise the neurobiological basis rather than framing as a behavioural failing. Screen for medication timing issues early."
  }'::jsonb
),

-- ch12_item_02: Psychoeducation — Common Sleep Disorders in ADHD
(
  '00000000-0000-4000-a000-000000120002',
  '00000000-0000-4000-8000-000000000012',
  'psychoeducation',
  'Common Sleep Disorders in ADHD',
  'Learn about the specific sleep disorders that commonly co-occur with ADHD.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Insomnia — The Three Categories",
        "body": "Adults with ADHD usually report sleep problems in one or more of three categories: (1) Difficulty getting to sleep — lying awake for several hours; (2) Not being able to wake up in the morning — finding it impossible to get out of bed; (3) Difficulty remaining alert during the day — feeling sleepy, especially when there is little stimulation. These three problems are often interrelated and form a dysfunctional cycle."
      },
      {
        "heading": "The Dysfunctional Sleep Cycle",
        "body": "You have difficulty getting to sleep because you are wide awake in the evenings and do stimulating activities. You eventually sleep fitfully, then find it hard to wake up because you are still tired. Since you have not had enough sleep, you feel drowsy during the day. However, as the day wears on you gradually feel more awake and ready to become active again — often right at bedtime. The achievements made in the evening seem to reinforce this late-night schedule, creating a self-perpetuating pattern."
      },
      {
        "heading": "Sleep Apnoea",
        "body": "Sleep apnoea is a disorder of interrupted breathing during sleep. The windpipe collapses during breathing when muscles relax during sleep, and the brain responds by waking you — often resulting in a snort or gasp. This can happen hundreds of times a night. It is associated with obesity, loud snoring, excessive daytime sleepiness, and impaired attention. If you suspect sleep apnoea, please raise this with your doctor."
      },
      {
        "heading": "Nightmares and Night Terrors",
        "body": "Night terrors are extreme versions of nightmares where the sleeper experiences terrible danger and may physically and vocally appear distressed. They differ from nightmares in that they are less likely to be remembered. Some medications, particularly stimulant-based preparations, can increase nightmare frequency. For adults, nightmares seem more likely when there are daytime anxieties affecting sleep."
      },
      {
        "heading": "Narcolepsy",
        "body": "People with narcolepsy fall asleep at various times during the day, even with adequate night-time sleep. Adults with ADHD are often significantly more sleepy during the day, though it is unclear whether this reflects true narcolepsy or attentional difficulties leading to a sleep-like state."
      },
      {
        "heading": "Restless Legs Syndrome",
        "body": "Restless Legs Syndrome (RLS) causes unpleasant crawling, prickling, or tingling sensations in the legs and an urge to move for relief. Over a quarter of adults with RLS exhibit ADHD symptoms. Both conditions may share a dopaminergic deficiency. If you experience these symptoms, raise them with your psychiatrist."
      }
    ],
    "clinician_notes": "Use this to screen for specific sleep disorders. If sleep apnoea, narcolepsy, or RLS is suspected, refer for medical evaluation before proceeding with behavioural sleep interventions. Nightmares may indicate comorbid anxiety or trauma."
  }'::jsonb
),

-- ch12_item_03: Psychoeducation — The Sleep Cycle — Stages of Sleep (Table 12.1)
(
  '00000000-0000-4000-a000-000000120003',
  '00000000-0000-4000-8000-000000000012',
  'psychoeducation',
  'The Sleep Cycle — Stages of Sleep (Table 12.1)',
  'Understanding how sleep works in stages helps you see why quality matters as much as quantity.',
  20,
  'Table 12.1',
  '{
    "content_blocks": [
      {
        "heading": "Sleep is Not Passive",
        "body": "Sleep was once thought to be a passive process where the brain shuts down. We now know sleep is a highly active state. Sleep goes in cycles, moving into deep restorative sleep, then coming back towards wakefulness, then back down again. This cyclical pattern exists for evolutionary reasons — it would be dangerous to shut down completely."
      },
      {
        "heading": "Stage 1 — Drowsiness",
        "body": "Characterised by drowsiness and ''half sleep'' with moderately alert but relaxed brain waves. Drifting in and out of sleep occurs for about 5-10 minutes. You can be woken easily."
      },
      {
        "heading": "Stage 2 — Light Sleep",
        "body": "Brain waves slow down. Eye movements stop. Heart rate slows and body temperature drops. About 50% of total sleep time is spent in this stage."
      },
      {
        "heading": "Stage 3 — Transition to Deep Sleep",
        "body": "Extremely slow delta waves begin to appear, interspersed with some smaller, quicker waves."
      },
      {
        "heading": "Stage 4 — Deep Sleep",
        "body": "The brain produces delta waves almost exclusively. It is very difficult to wake someone during stages 3 and 4 (together called deep sleep). There is no eye movement or muscle activity. This is where the most restorative processes occur."
      },
      {
        "heading": "REM Sleep — Dream Sleep",
        "body": "REM (rapid eye movement) sleep occurs after the sleeper moves back through stages 4 to 3 to 2 to 1. Breathing, pulse rate, and eye muscles fluctuate erratically. The muscles of the body (apart from breathing and circulation) become paralysed. About 20% of total sleep is spent in REM. A sleeper woken during REM has an 80% chance of recalling a dream."
      },
      {
        "heading": "The Full Cycle",
        "body": "Adults typically go through 4-5 cycles of sleep, each taking about 90 minutes. Each cycle becomes gradually less deep, so most deep sleep occurs in the earlier half of the night. Most adults need approximately 7-8 hours, though this varies between individuals and decreases with age."
      }
    ],
    "clinician_notes": "Use this to educate the client about the active nature of sleep. Helpful for clients who think sleep is binary (asleep vs awake). Understanding stages helps explain why alcohol prevents restorative sleep — it keeps you in stages 1-2."
  }'::jsonb
),

-- ch12_item_04: Psychoeducation — Functions of Sleep
(
  '00000000-0000-4000-a000-000000120004',
  '00000000-0000-4000-8000-000000000012',
  'psychoeducation',
  'Functions of Sleep',
  'Understanding why sleep matters can motivate you to prioritise it.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Why We Need Sleep",
        "body": "Sleep deprivation affects the nervous system, the immune system, and cell growth and repair. Without sleep, neurons become depleted in energy or polluted with by-products of normal cellular activity. They need sleep to repair themselves to perform effectively during the day."
      },
      {
        "heading": "Memory and Learning",
        "body": "Sleep allows the brain to encode and store new information. If you are studying or learning new skills, adequate sleep is essential for consolidation."
      },
      {
        "heading": "Physical Repair",
        "body": "Deep sleep coincides with the release of growth hormone. There is increased production and reduced breakdown of proteins during sleep — the body''s building blocks for cell growth and repair."
      },
      {
        "heading": "Consequences of Sleep Deprivation",
        "body": "Sleep deprivation can impair judgement and reaction times, and magnify the effects of alcohol. In extreme cases, it can lead to hallucinations and mood swings."
      },
      {
        "heading": "Extra Importance for ADHD",
        "body": "Sleep may be even more important if you have ADHD because many individuals have heightened activity levels during the day and may require more sleep than non-ADHD people to fully recover energy expended during the day."
      }
    ],
    "clinician_notes": "Use this to build motivation for sleep hygiene changes. Many ADHD clients deprioritise sleep. Connecting sleep to cognitive function (memory, attention) can be especially motivating given their existing deficits."
  }'::jsonb
),

-- ch12_item_05: Psychoeducation — Factors That Affect Sleep in ADHD (Table 12.2)
(
  '00000000-0000-4000-a000-000000120005',
  '00000000-0000-4000-8000-000000000012',
  'psychoeducation',
  'Factors That Affect Sleep in ADHD (Table 12.2)',
  'Review these common factors that may be disrupting your sleep. Tick which ones apply to you — this will help your therapist plan which strategies to focus on.',
  20,
  'Table 12.2',
  '{
    "content_blocks": [
      {
        "heading": "Psychological and Behavioural Factors",
        "body": "These include: (1) Restlessness and ceaseless mental activity — feeling ''on the go'' at bedtime; (2) Worrying about sleep itself — anxiety about not getting enough sleep; (3) Incompatible bedtime activities — playing games, working in the bedroom; (4) Chronic anxiety or depression — ruminating about the day or low self-worth; (5) Irregular sleep patterns — from disorganisation, shift work, or procrastination leading to late-night tasks; (6) Oversleeping during the day — napping that disrupts nighttime sleep; (7) Nocturnal panics — panicking late at night about uncompleted tasks."
      },
      {
        "heading": "Environmental Factors",
        "body": "These include: (1) Unpredictable sensory stimulation — noise, light, traffic, TV left on; (2) Significant signals — daylight, children waking; (3) Intense sensory stimulation — temperature extremes, humidity."
      },
      {
        "heading": "Biological Factors",
        "body": "These include: (1) Stimulant medication — may improve ADHD symptoms but keep you awake; (2) Side effects of other medications — antidepressants may affect sleep; (3) Excessive caffeine — self-medicating ADHD with caffeine, long half-life affects sleep hours later; (4) Heavy meals before bed — forgetting to eat during the day then eating late; (5) Vigorous exercise before bed — needing to burn off energy too close to bedtime; (6) Physical health problems — chronic pain, dental issues; (7) Need for urination — late-night drinking; (8) Respiratory difficulties — sleep apnoea."
      }
    ],
    "fields": [
      {
        "id": "psychological_factors",
        "label": "Which psychological/behavioural factors apply to you?",
        "type": "checkbox",
        "required": false,
        "options": [
          "Restlessness / ceaseless mental activity at bedtime",
          "Worrying specifically about sleep",
          "Incompatible bedtime activities (screens, work in bedroom)",
          "Chronic anxiety or depression keeping me awake",
          "Irregular sleep patterns / no consistent bedtime",
          "Oversleeping or napping during the day",
          "Nocturnal panics about unfinished tasks"
        ]
      },
      {
        "id": "environmental_factors",
        "label": "Which environmental factors apply to you?",
        "type": "checkbox",
        "required": false,
        "options": [
          "Noise disturbances (traffic, neighbours, TV)",
          "Light disturbances (streetlights, phone screens, daylight)",
          "Temperature or humidity problems"
        ]
      },
      {
        "id": "biological_factors",
        "label": "Which biological factors apply to you?",
        "type": "checkbox",
        "required": false,
        "options": [
          "Stimulant medication keeping me awake",
          "Side effects from other medications",
          "Excessive caffeine intake (especially after midday)",
          "Eating heavy meals close to bedtime",
          "Vigorous exercise close to bedtime",
          "Physical health problems (pain, discomfort)",
          "Waking to urinate",
          "Breathing difficulties / snoring"
        ]
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Tick all the factors that apply to you. Bring this to your session so we can discuss which ones to tackle first.",
    "clinician_notes": "This is both psychoeducation and a screening tool. Use the checked items to prioritise interventions. Biological factors (especially apnoea, medication timing) may need medical referral before behavioural work."
  }'::jsonb
),

-- ch12_item_06: Worksheet — My Dysfunctional Sleep Cycle (Figure 12.1)
(
  '00000000-0000-4000-a000-000000120006',
  '00000000-0000-4000-8000-000000000012',
  'worksheet',
  'My Dysfunctional Sleep Cycle (Figure 12.1)',
  'Map out your own version of the dysfunctional sleep cycle. This helps you see how your sleep problems are connected and self-reinforcing.',
  50,
  'Figure 12.1',
  '{
    "fields": [
      {"id": "difficulty_falling_asleep", "label": "Difficulty falling asleep: Describe what happens when you try to sleep", "type": "textarea", "required": true, "placeholder": "e.g. Mind races, can''t switch off, lie awake for hours..."},
      {"id": "overactivity_evening", "label": "Overactivity in the evening: What do you typically do in the evenings that keeps you awake?", "type": "textarea", "required": true, "placeholder": "e.g. Working late, scrolling phone, gaming, exercising..."},
      {"id": "difficulty_waking", "label": "Difficulty waking: How hard is it for you to get up? What happens?", "type": "textarea", "required": true, "placeholder": "e.g. Hit snooze 10 times, miss alarms, feel groggy until noon..."},
      {"id": "difficulty_alertness", "label": "Difficulty maintaining alertness: When during the day do you feel most sleepy?", "type": "textarea", "required": true, "placeholder": "e.g. Yawning in meetings, dozing off while reading, sleepy after lunch..."},
      {"id": "becoming_awake", "label": "Becoming more awake through the day: When do you start feeling alert and energised?", "type": "textarea", "required": true, "placeholder": "e.g. After 4pm, evenings feel like my most productive time..."},
      {"id": "reinforcement", "label": "What achievements or rewards do you get from being active in the evening?", "type": "textarea", "required": true, "placeholder": "e.g. Finally get assignments done, quieter so can focus, feel productive..."},
      {"id": "cycle_insight", "label": "Can you see how these parts connect into a cycle? What stands out to you?", "type": "textarea", "required": false}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Go through each section honestly. The goal is not to judge yourself but to see the pattern clearly.",
    "clinician_notes": "Walk through the cycle diagram with the client. The key insight is that evening productivity negatively reinforces the dysfunctional pattern. Identify which part of the cycle is the best intervention point for this individual."
  }'::jsonb
),

-- ch12_item_07: Diary — Sleep Diary (Table 12.3)
(
  '00000000-0000-4000-a000-000000120007',
  '00000000-0000-4000-8000-000000000012',
  'diary',
  'Sleep Diary (Table 12.3)',
  'Record your sleep patterns every day for at least one week. Fill this in each morning (for the previous night). The more honest you are, the more useful this will be for identifying what is disrupting your sleep.',
  60,
  'Table 12.3',
  '{
    "fields": [
      {"id": "log_date", "label": "Night of (date)", "type": "date", "required": true},
      {"id": "daytime_sleep", "label": "Did you sleep during the day? If so, for how long?", "type": "text", "required": false, "placeholder": "e.g. Nap at 2pm-3:30pm, No sleep"},
      {"id": "caffeine", "label": "How much caffeine did you drink and when?", "type": "text", "required": false, "placeholder": "e.g. Coffee at 11am and 4pm, Tea at 6pm"},
      {"id": "alcohol", "label": "How much alcohol did you drink and when?", "type": "text", "required": false, "placeholder": "e.g. 2 beers at 9pm, None"},
      {"id": "last_meal", "label": "What was the last thing you ate and when?", "type": "text", "required": false, "placeholder": "e.g. Rice and dal at 9pm, Snack at midnight"},
      {"id": "medication", "label": "Did you take your medication? What time?", "type": "text", "required": false, "placeholder": "e.g. Tablet at 6pm, Forgot today"},
      {"id": "mood_before_bed", "label": "How were you feeling before you went to bed?", "type": "select", "required": true, "options": ["Relaxed", "Tired", "Stressed", "Anxious", "Agitated", "Low / sad", "Drunk", "Wired / alert", "Other"]},
      {"id": "mood_notes", "label": "Any specific worries or thoughts on your mind?", "type": "textarea", "required": false, "placeholder": "e.g. Worried about exam, thinking about unfinished work..."},
      {"id": "activity_before_bed", "label": "What were you doing before you went to bed?", "type": "text", "required": true, "placeholder": "e.g. Watching reels, finishing assignment, reading..."},
      {"id": "time_to_bed", "label": "What time did you go to bed?", "type": "time", "required": true},
      {"id": "time_fell_asleep", "label": "Roughly what time did you fall asleep?", "type": "time", "required": true},
      {"id": "night_wakings", "label": "Times you woke up in the night and for how long", "type": "textarea", "required": false, "placeholder": "e.g. 3:15am-3:45am, 5:00am-5:20am"},
      {"id": "time_woke_morning", "label": "What time did you wake up in the morning?", "type": "time", "required": true},
      {"id": "total_hours_sleep", "label": "Total hours of sleep (estimate)", "type": "number", "required": true, "placeholder": "e.g. 5.5"},
      {"id": "sleep_quality", "label": "Quality of sleep (0 = worst possible, 10 = fully refreshed)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Worst possible", "5": "Average", "10": "Fully refreshed"}}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Fill this in every morning for at least 7 days. It takes about 3 minutes. The monitoring itself may temporarily make you more aware of sleep difficulties — this is normal and will pass. Be as accurate as you can.",
    "clinician_notes": "Review after 7 days minimum. Look for patterns: caffeine timing, alcohol effects on quality, medication timing, late meals, mood-sleep connection, napping effects, activity before bed. Compare self-reported quality against objective hours. Clients often overestimate time to fall asleep and underestimate actual sleep. The 13 areas to review: (1) daytime sleep, (2) caffeine, (3) alcohol, (4) food, (5) medication, (6) affective state, (7) activity before bed, (8) time in bed, (9) time fallen asleep, (10) night wakings, (11) morning wake time, (12) total hours, (13) quality."
  }'::jsonb
),

-- ch12_item_08: Exercise — Behavioural Sleep Strategies (Table 12.4)
(
  '00000000-0000-4000-a000-000000120008',
  '00000000-0000-4000-8000-000000000012',
  'exercise',
  'Behavioural Sleep Strategies (Table 12.4)',
  'Review these strategies organised by time of day. Choose 3-5 strategies to try this week. Tick the ones you will commit to and review with your therapist next session.',
  70,
  'Table 12.4',
  '{
    "fields": [
      {
        "id": "during_day_strategies",
        "label": "DURING THE DAY — Which strategies will you try?",
        "type": "checkbox",
        "required": true,
        "options": [
          "Avoid taking naps — distract yourself with an energising task instead",
          "Relax by reading or listening to music (not in the bedroom) instead of sleeping",
          "Make a list of activities for the following day so I do not rehearse them at night",
          "Avoid heavy meals before bed — eat light carbohydrates, low sugar if hungry",
          "Limit liquid intake in the evening to avoid waking for the toilet",
          "Avoid smoking close to bedtime (nicotine is a stimulant)",
          "Limit or avoid alcohol — it prevents deep restorative sleep even if it makes you drowsy"
        ]
      },
      {
        "id": "before_sleep_strategies",
        "label": "BEFORE SLEEP — Which strategies will you try?",
        "type": "checkbox",
        "required": true,
        "options": [
          "Maintain a consistent bedtime every night (including weekends)",
          "If I only sleep a few hours, limit bed time to that amount and gradually increase by 15-30 mins",
          "Follow a winding-down routine 1 hour before bed (music, magazine, bath)",
          "Get ready for bed (brush teeth, wash) before starting the winding-down period",
          "Only get into bed when I actually feel tired"
        ]
      },
      {
        "id": "in_bed_strategies",
        "label": "IN BED — Which strategies will you try?",
        "type": "checkbox",
        "required": true,
        "options": [
          "Avoid activities incompatible with sleep — no TV, phone, eating, or reading in bed",
          "If unable to fall asleep within 30 minutes, get out of bed and move to another room — return only when ready to sleep"
        ]
      },
      {
        "id": "awakening_strategies",
        "label": "AWAKENING — Which strategies will you try?",
        "type": "checkbox",
        "required": true,
        "options": [
          "Set a regular alarm and wake at the same time each day, even weekends",
          "Use two alarm clocks — take medication at the first, get out of bed at the second",
          "Expose myself to bright light or sunshine soon after waking (open curtains, use a lamp timer)"
        ]
      },
      {
        "id": "my_plan",
        "label": "My Sleep Plan — Write out the specific routine you will follow this week",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. No caffeine after 4pm. Eat dinner at 7pm. At 10:30pm I will change, brush teeth, then listen to music until 11pm. Get into bed at 11pm. If not asleep by 11:30pm, go sit in the living room. Alarm at 7am, take tablet, second alarm at 7:30am..."
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Do not try to change everything at once. Pick 3-5 strategies and commit to them for 1 week. Review your Sleep Diary alongside this plan to see what is working.",
    "clinician_notes": "Help the client select realistic strategies. The ''two alarm clock'' technique is particularly useful for ADHD clients on stimulant medication. Emphasise consistency over perfection. The bedroom-as-sleep-only-zone is often the single most impactful change. Review after 1-2 weeks of consistent application."
  }'::jsonb
),

-- ch12_item_09: Worksheet — Sleep and Rumination — Identifying Thoughts, Feelings, and Behaviours
(
  '00000000-0000-4000-a000-000000120009',
  '00000000-0000-4000-8000-000000000012',
  'worksheet',
  'Sleep and Rumination — Identifying Thoughts, Feelings, and Behaviours',
  'Worry and rumination at bedtime are common with ADHD. This worksheet helps you identify the specific thoughts, feelings, and behaviours that are keeping you awake.',
  50,
  NULL,
  '{
    "fields": [
      {"id": "before_sleep_thoughts", "label": "Before falling asleep — What thoughts go through your mind when you are trying to sleep?", "type": "textarea", "required": true, "placeholder": "e.g. ''If I don''t get 8 hours sleep, I won''t cope tomorrow'', ''I forgot to do X'', ''What if I oversleep again?''"},
      {"id": "during_sleep_experience", "label": "During sleep — Do you experience restless tossing and turning, nightmares, or night terrors?", "type": "textarea", "required": false, "placeholder": "e.g. Nightmares about missing deadlines, restless and tossing..."},
      {"id": "after_waking_thoughts", "label": "After awakening — What thoughts or feelings do you have when you wake in the night or early morning?", "type": "textarea", "required": false, "placeholder": "e.g. Panic about the time, dread facing the day, anxiety about tasks..."},
      {
        "id": "common_thoughts",
        "label": "Tick any thoughts you recognise",
        "type": "checkbox",
        "required": false,
        "options": [
          "If I don''t get 7-8 hours sleep, I haven''t had enough",
          "If I don''t sleep, I won''t be able to get up",
          "I won''t be able to concentrate tomorrow and will forget things",
          "Lying in bed with eyes closed is more restful than sitting up",
          "I need to finish this task before I can sleep",
          "Something bad will happen if I don''t sort this out tonight"
        ]
      },
      {
        "id": "common_feelings",
        "label": "Tick any feelings you experience at bedtime",
        "type": "checkbox",
        "required": false,
        "options": [
          "Anxiety",
          "Frustration",
          "Worry",
          "Restlessness",
          "Irritability",
          "Low mood / sadness",
          "Panic"
        ]
      },
      {
        "id": "common_behaviours",
        "label": "Tick any behaviours you do when you cannot sleep",
        "type": "checkbox",
        "required": false,
        "options": [
          "Surfing the internet / scrolling phone",
          "Having an alcoholic drink as a nightcap",
          "Getting up and pacing around",
          "Getting up to do tasks in case I forget by tomorrow",
          "Getting up to look for something I have lost",
          "Checking the clock repeatedly",
          "Calculating how many hours I can still sleep",
          "Eating a snack"
        ]
      },
      {"id": "vicious_cycle", "label": "Can you see a cycle? How do your thoughts lead to feelings, which lead to behaviours, which lead back to more thoughts?", "type": "textarea", "required": false, "placeholder": "e.g. I think ''I must sleep now'' → I feel anxious → I check the clock → I think ''only 4 hours left'' → I feel more anxious..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Fill this in after a few nights of monitoring with your Sleep Diary. Look for patterns in what keeps you awake.",
    "clinician_notes": "This bridges the behavioural strategies (Table 12.4) with the mood-related strategies (Table 12.5). If rumination is a major factor, also consider work from Chapter 9 (Anxiety) and Chapter 11 (Low Mood). The key CBT insight is the self-perpetuating cycle: thoughts → feelings → behaviours → reinforced thoughts."
  }'::jsonb
),

-- ch12_item_10: Exercise — Mood-Related Sleep Strategies (Table 12.5)
(
  '00000000-0000-4000-a000-000000120010',
  '00000000-0000-4000-8000-000000000012',
  'exercise',
  'Mood-Related Sleep Strategies (Table 12.5)',
  'If worry, anxiety, or low mood are keeping you awake, these strategies target the thoughts, feelings, and behaviours that maintain sleep difficulties.',
  70,
  'Table 12.5',
  '{
    "fields": [
      {
        "id": "thought_strategies",
        "label": "THOUGHT Strategies — Which will you try?",
        "type": "checkbox",
        "required": true,
        "options": [
          "Have a designated ''worry time'' well before winding down — write worries down so they do not need to be rehearsed at night",
          "Use calming self-talk: ''A few hours sleep is better than no hours sleep''",
          "Write a to-do list for tomorrow so my brain does not need to hold it"
        ]
      },
      {"id": "worry_time_plan", "label": "If you chose ''worry time'' — when will you schedule it and for how long?", "type": "text", "required": false, "placeholder": "e.g. 8pm-8:15pm, I will write my worries in a notebook"},
      {
        "id": "feeling_strategies",
        "label": "FEELING Strategies — Which relaxation techniques will you try?",
        "type": "checkbox",
        "required": true,
        "options": [
          "Counting from 1 to 10 slowly, pausing after a different number each time",
          "Progressive muscle relaxation (tense and release each muscle group)",
          "Deep breathing exercises",
          "Guided imagery — imagine a pleasant scene: what can you see, hear, smell, feel?"
        ]
      },
      {"id": "imagery_scene", "label": "If you chose guided imagery — describe the scene you will use", "type": "textarea", "required": false, "placeholder": "e.g. A quiet beach at sunset. I can hear waves, feel warm sand, smell salt air..."},
      {"id": "behaviour_strategies", "label": "BEHAVIOUR Strategies — Review the behavioural strategies from Table 12.4. If anxiety is driving your sleep problem, you should also target the thought and feeling components above.", "type": "textarea", "required": false, "placeholder": "Which behavioural strategies from the previous exercise will you combine with these mood strategies?"},
      {"id": "combined_plan", "label": "My Combined Sleep and Mood Plan — Write your complete plan for tonight", "type": "textarea", "required": true, "placeholder": "e.g. At 8pm I will do 15 mins worry time and write a to-do list. At 10pm I will start my winding-down routine. In bed I will do deep breathing. If I notice anxious thoughts, I will tell myself ''a few hours is better than none''. If I am not asleep in 30 mins, I will get up and sit quietly."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "These strategies work best when combined with the behavioural strategies from Table 12.4. Pick at least one strategy from each category (thoughts, feelings, behaviours).",
    "clinician_notes": "If mood-related strategies are insufficient, consider cross-referencing with Chapter 9 (Anxiety) and Chapter 11 (Low Mood/Depression). The counting technique is surprisingly effective for clients with racing thoughts. Progressive muscle relaxation may need to be taught in session before the client can use it independently."
  }'::jsonb
),

-- ch12_item_11: Diary — Sleep Improvement Tracker
(
  '00000000-0000-4000-a000-000000120011',
  '00000000-0000-4000-8000-000000000012',
  'diary',
  'Sleep Improvement Tracker',
  'After implementing your sleep strategies for at least one week, use this diary to track your progress. Fill in each morning and compare with your original Sleep Diary to see what has changed.',
  60,
  NULL,
  '{
    "fields": [
      {"id": "log_date", "label": "Date", "type": "date", "required": true},
      {"id": "strategies_used", "label": "Which strategies did you use last night?", "type": "textarea", "required": true, "placeholder": "e.g. No caffeine after 4pm, winding down at 10pm, deep breathing in bed..."},
      {"id": "bedtime", "label": "What time did you go to bed?", "type": "time", "required": true},
      {"id": "time_fell_asleep", "label": "Roughly what time did you fall asleep?", "type": "time", "required": true},
      {"id": "night_wakings", "label": "Night wakings (times and duration)", "type": "text", "required": false, "placeholder": "e.g. None, or 3am for 15 mins"},
      {"id": "wake_time", "label": "What time did you wake up?", "type": "time", "required": true},
      {"id": "total_sleep", "label": "Total hours of sleep", "type": "number", "required": true},
      {"id": "sleep_quality", "label": "Quality of sleep (0-10)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Worst possible", "5": "Average", "10": "Fully refreshed"}},
      {"id": "what_helped", "label": "What helped most?", "type": "textarea", "required": false, "placeholder": "e.g. The winding-down routine really helped me feel sleepy..."},
      {"id": "what_hindered", "label": "What got in the way?", "type": "textarea", "required": false, "placeholder": "e.g. I broke my caffeine rule, got stressed about a deadline..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Use this for at least 7 days after starting your sleep plan. Compare your sleep quality and total hours with your original Sleep Diary to see progress.",
    "clinician_notes": "Compare with the initial Sleep Diary (Table 12.3). Look for improvements in total hours, sleep quality, and time to fall asleep. Identify which strategies the client finds most helpful and reinforce those. Adjust the plan based on what is and is not working."
  }'::jsonb
)

ON CONFLICT (id) DO UPDATE SET
  module_id              = EXCLUDED.module_id,
  type                   = EXCLUDED.type,
  title                  = EXCLUDED.title,
  instructions           = EXCLUDED.instructions,
  xp_value               = EXCLUDED.xp_value,
  companion_website_ref  = EXCLUDED.companion_website_ref,
  schema                 = EXCLUDED.schema,
  updated_at             = now();
