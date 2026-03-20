-- 06_seed_module_04.sql
-- Seed content items for Module 4 (Inattention and Memory Problems) into yb_content_items
-- Safe to re-run: uses ON CONFLICT DO UPDATE
--
-- Module 4 UUID: 00000000-0000-4000-8000-000000000004  (from 01_seed_modules.sql)
-- Content item UUIDs: 00000000-0000-4000-a000-000000040001 through ...040014

INSERT INTO yb_content_items (id, module_id, type, title, instructions, xp_value, companion_website_ref, schema)
VALUES

-- ch4_item_01: Psychoeducation — Understanding Attention and ADHD
(
  '00000000-0000-4000-a000-000000040001',
  '00000000-0000-4000-8000-000000000004',
  'psychoeducation',
  'Understanding Attention and ADHD',
  'Read through this to understand how ADHD affects your attention. This is the foundation for all the strategies you will learn in this module.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Why Attention is Hard with ADHD",
        "body": "Attention is the process that allows us to focus on particular features of our environment. Your brain has a ''supervisory attentional system'' that decides what to prioritise — and in ADHD, this system does not work efficiently. This is not a character flaw. It is a neurological difference in how your brain allocates attentional resources."
      },
      {
        "heading": "The Four Domains of Attention",
        "body": "ADHD can affect four types of attention: (1) Selective attention — focusing on one thing while ignoring distractions. (2) Divided attention — doing two things at once. (3) Attention shifting — switching between tasks smoothly. (4) Sustained attention — staying focused over a long period. Most adults with ADHD struggle most with sustained attention."
      },
      {
        "heading": "Motivation and Attention Are Linked",
        "body": "There are two types of motivation: extrinsic (rewards and consequences) and intrinsic (genuine interest). Both fluctuate in ADHD. When motivation drops, attention drops too. This is why you can focus for hours on something interesting but struggle with a 10-minute boring task. It is not laziness — it is how ADHD affects your motivation-attention system."
      },
      {
        "heading": "The Two-Pronged Approach",
        "body": "In this module you will learn two types of strategies: External strategies (''change from the outside in'') — adapting your environment to reduce distraction. Internal strategies (''change from the inside out'') — building persistence, self-monitoring, and reward systems. Both are needed for the best results."
      }
    ],
    "clinician_notes": "Normalise attentional difficulties before introducing strategies. Emphasise that inconsistent attention (focused on games but not on chores) is a hallmark of ADHD, not evidence of laziness. Use this psychoeducation to validate the patient''s experiences."
  }'::jsonb
),

-- ch4_item_02: Worksheet — Examples of Attentional Impairments (Table 4.1)
(
  '00000000-0000-4000-a000-000000040002',
  '00000000-0000-4000-8000-000000000004',
  'worksheet',
  'Examples of Attentional Impairments (Table 4.1)',
  'This worksheet lists common attentional problems grouped by type. For each problem, rate how much it affects you. This helps you and your therapist identify which areas to target first.',
  50,
  'Table 4.1',
  '{
    "fields": [
      {"id": "selective_1", "label": "Selective Attention: Being unable to see detail / being ''slapdash''", "type": "likert", "required": true, "options": ["Not a problem", "Mild", "Moderate", "Severe", "Very severe"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "selective_2", "label": "Selective Attention: Making mistakes in reading or filling in forms", "type": "likert", "required": true, "options": ["Not a problem", "Mild", "Moderate", "Severe", "Very severe"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "selective_3", "label": "Selective Attention: Skipping lines in questionnaires", "type": "likert", "required": true, "options": ["Not a problem", "Mild", "Moderate", "Severe", "Very severe"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "selective_4", "label": "Selective Attention: Not being able to focus on a conversation or task when there is background noise", "type": "likert", "required": true, "options": ["Not a problem", "Mild", "Moderate", "Severe", "Very severe"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "divided_1", "label": "Divided Attention: Not being able to do two things at once to an acceptable standard", "type": "likert", "required": true, "options": ["Not a problem", "Mild", "Moderate", "Severe", "Very severe"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "shifting_1", "label": "Attention Shifting: Getting stuck on one topic and not being able to change track", "type": "likert", "required": true, "options": ["Not a problem", "Mild", "Moderate", "Severe", "Very severe"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "shifting_2", "label": "Attention Shifting: Always starting tasks but never finishing because it is difficult to resume the original task", "type": "likert", "required": true, "options": ["Not a problem", "Mild", "Moderate", "Severe", "Very severe"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "sustained_1", "label": "Sustained Attention: Losing track of a conversation, film, book, etc.", "type": "likert", "required": true, "options": ["Not a problem", "Mild", "Moderate", "Severe", "Very severe"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "sustained_2", "label": "Sustained Attention: Being distracted by own thoughts (internal) or anything else going on around you (external)", "type": "likert", "required": true, "options": ["Not a problem", "Mild", "Moderate", "Severe", "Very severe"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "worst_domain", "label": "Looking at your answers, which type of attention is most affected for you?", "type": "select", "required": true, "options": ["Selective (focusing on detail)", "Divided (multitasking)", "Shifting (switching tasks)", "Sustained (staying focused over time)"]},
      {"id": "personal_example", "label": "Describe a recent situation where one of these attentional problems caused difficulty for you.", "type": "textarea", "required": true, "placeholder": "e.g. I was filling in an online form and submitted it with errors because I skipped a section..."}
    ],
    "scoring": {
      "method": "sum",
      "max_score": 36,
      "interpretation": {
        "0-12": "Mild attentional difficulties. You may benefit from targeted strategies for your weakest domain.",
        "13-24": "Moderate attentional difficulties across multiple domains. This module will be very helpful.",
        "25-36": "Significant attentional difficulties. Prioritise the external strategies first, then build internal strategies."
      }
    },
    "instructions_for_patient": "Rate each problem honestly based on the last month. This is not a test — it helps identify where to focus your efforts.",
    "clinician_notes": "Use the domain with highest scores to guide which strategies (external/internal) to prioritise. Revisit at module end to track improvement. The personal example helps ground the abstract domains in lived experience."
  }'::jsonb
),

-- ch4_item_03: Exercise — Identifying Your Attentional Difficulties
(
  '00000000-0000-4000-a000-000000040003',
  '00000000-0000-4000-8000-000000000004',
  'exercise',
  'Identifying Your Attentional Difficulties',
  'Before learning strategies, it helps to map exactly where your attention breaks down. Think about the last two weeks and describe specific situations where your attention caused problems. Your therapist will help you identify patterns.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "difficulty_1", "label": "Do you lose your train of thought, especially mid-sentence?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"]},
      {"id": "difficulty_2", "label": "Do you find it hard to sustain a conversation when there is background noise or many people around?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"]},
      {"id": "difficulty_3", "label": "Do you struggle to stay on one topic in conversation without jumping to other ideas?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"]},
      {"id": "difficulty_4", "label": "Does your mind wander or daydream when watching TV, reading, or studying?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"]},
      {"id": "difficulty_5", "label": "Do you start tasks but not finish them because you get distracted into doing something else?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"]},
      {"id": "difficulty_6", "label": "Do you find it hard to do more than one thing at a time (e.g. driving while talking)?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"]},
      {"id": "constructive_distraction", "label": "Do you find that having several activities on the go actually helps you stay productive?", "type": "select", "required": true, "options": ["Yes, it helps me", "No, it makes things worse", "It depends on the situation"]},
      {"id": "best_focus_conditions", "label": "Describe the conditions under which you focus best (time of day, environment, type of task, mood).", "type": "textarea", "required": true, "placeholder": "e.g. I focus best in the morning, alone, with music, on something I find interesting..."},
      {"id": "worst_focus_conditions", "label": "Describe the conditions under which your attention is worst.", "type": "textarea", "required": true, "placeholder": "e.g. Afternoons after lunch, in noisy offices, on paperwork I find boring..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Be as specific and honest as possible. There are no right or wrong answers. This helps us design strategies that fit your life.",
    "clinician_notes": "Use responses to identify whether the patient has a dominant attentional deficit (e.g. predominantly sustained vs divided). The best/worst focus conditions are critical for tailoring external strategies. Note whether the patient benefits from constructive distraction — this is an individual difference that affects which internal strategies to recommend."
  }'::jsonb
),

-- ch4_item_04: Worksheet — External Strategies to Improve Attentional Control (Table 4.2)
(
  '00000000-0000-4000-a000-000000040004',
  '00000000-0000-4000-8000-000000000004',
  'worksheet',
  'External Strategies to Improve Attentional Control (Table 4.2)',
  'These are ''change from the outside in'' techniques — ways to adapt your environment so you can focus better. Review each strategy, rate whether you already use it, and pick 2-3 new ones to try as mini-experiments this week.',
  50,
  'Table 4.2',
  '{
    "fields": [
      {"id": "auditory_music", "label": "Auditory: Listen to low-level music without lyrics to mask out intermittent noises. Do you already do this?", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Not relevant to me"]},
      {"id": "auditory_reduce_noise", "label": "Auditory: Ask others around you to reduce noise. Have you tried this?", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Not relevant to me"]},
      {"id": "auditory_earplugs", "label": "Auditory: Use earplugs or noise-cancelling headphones to block out sounds.", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Not relevant to me"]},
      {"id": "auditory_phone_silent", "label": "Auditory: Switch phone to silent mode during focus time. Check messages at set intervals or after task completion.", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Not relevant to me"]},
      {"id": "auditory_move_location", "label": "Auditory: Move away from noisy environments to a quieter place (library, quiet room, friend''s house).", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Not relevant to me"]},
      {"id": "visual_remove_distractors", "label": "Visual: Remove distracting material (posters, screens, open tabs) from your line of vision when working.", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Not relevant to me"]},
      {"id": "visual_seating", "label": "Visual: Position yourself facing into a room rather than a window (to reduce daydreaming) or a wall (to reduce restlessness).", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Not relevant to me"]},
      {"id": "visual_colours", "label": "Visual: Use bright colours (post-it notes, highlighter pens) to attract your attention to the task.", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Not relevant to me"]},
      {"id": "visual_cue_cards", "label": "Visual: Place cue cards or notes in ''risk'' places as reminders to pay attention (e.g. ''Stop dreaming! Focus!'' on your monitor).", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Not relevant to me"]},
      {"id": "strategies_to_try", "label": "Which 2-3 strategies will you try as mini-experiments this week?", "type": "textarea", "required": true, "placeholder": "e.g. 1. Phone on silent during work hours. 2. Move to the library for focused study. 3. Put a Focus! note on my laptop."},
      {"id": "own_strategy", "label": "Do you have your own external strategy that already works for you? Describe it here.", "type": "textarea", "required": false, "placeholder": "e.g. I work better in coffee shops because the background hum keeps me alert..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Pick strategies that feel realistic for your daily life. You will review how they went in your next session.",
    "clinician_notes": "Encourage the patient to try strategies as ''mini-experiments'' rather than permanent commitments. If a strategy does not work, determine whether it was applied correctly or was simply not suitable. Validate any existing strategies the patient already uses."
  }'::jsonb
),

-- ch4_item_05: Worksheet — Internal Strategies to Improve Attentional Control (Table 4.3)
(
  '00000000-0000-4000-a000-000000040005',
  '00000000-0000-4000-8000-000000000004',
  'worksheet',
  'Internal Strategies to Improve Attentional Control (Table 4.3)',
  'These are ''change from the inside out'' techniques — ways to build internal persistence, motivation, and focus. Review each strategy and pick 2-3 to try this week.',
  50,
  'Table 4.3',
  '{
    "fields": [
      {"id": "reward", "label": "Reward: Set up a reward for completing tasks — even small ones. What rewards motivate you?", "type": "textarea", "required": true, "placeholder": "e.g. Tea break after 25 mins of work, favourite snack after finishing paperwork, episode of a show after chores..."},
      {"id": "competition", "label": "Competition: Challenge yourself or compete with someone (e.g. ''Can I finish this in 30 minutes?''). Would this work for you?", "type": "select", "required": true, "options": ["Yes, I respond well to competition", "Maybe, I want to try it", "No, competition stresses me out"]},
      {"id": "novelty", "label": "Novelty: Capitalise on the ''novelty factor'' — are there new or interesting versions of boring tasks you could try?", "type": "textarea", "required": false, "placeholder": "e.g. Pay bills online instead of by post, try a new app for grocery lists, listen to a podcast while doing chores..."},
      {"id": "snap", "label": "Snap! Technique: Wear an elastic band on your wrist and snap it gently to reorient attention when you notice your mind drifting. Would you try this?", "type": "select", "required": true, "options": ["Yes, I will try this", "Maybe", "No, not for me"]},
      {"id": "cognitive_challenges", "label": "Cognitive Challenges: Practice saying ''Sorry, I have forgotten what I was saying'' without embarrassment. Have you rehearsed this?", "type": "select", "required": true, "options": ["Already comfortable doing this", "I find this embarrassing but want to practice", "This is too difficult right now"]},
      {"id": "repetition", "label": "Repetition: When given instructions, ask for them to be repeated. Are you comfortable doing this?", "type": "select", "required": true, "options": ["Already do this", "I find this hard but want to practice", "This is too embarrassing right now"]},
      {"id": "goal_setting", "label": "Goal Setting: Set small, achievable goals rather than large vague ones. Write one example of breaking a big goal into small steps.", "type": "textarea", "required": true, "placeholder": "e.g. Instead of ''clean the house'', break into: clear kitchen counter (10 mins), load dishwasher (5 mins), wipe surfaces (5 mins)..."},
      {"id": "breaks", "label": "Breaks: Schedule breaks BEFORE you lose focus (e.g. if you can concentrate for 30 mins, take a break at 25 mins). How long can you typically focus before losing concentration?", "type": "text", "required": true, "placeholder": "e.g. About 20 minutes"},
      {"id": "strategies_to_try", "label": "Which 2-3 internal strategies will you try as mini-experiments this week?", "type": "textarea", "required": true, "placeholder": "e.g. 1. Set a timer for 25 mins with a 5-min break. 2. Reward myself with chai after finishing each task. 3. Snap the band when I notice I am scrolling my phone."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "These strategies work best when combined with the external strategies from the previous worksheet. Try a mix of both.",
    "clinician_notes": "The reward system is the highest priority internal strategy for ADHD. Ensure the patient sets up at least one reward system. The ''snap'' technique and cognitive challenges can be role-played in session. For breaks, help the patient identify their realistic focus window and set breaks slightly before that point."
  }'::jsonb
),

-- ch4_item_06: Exercise — Attentional Strategy Mini-Experiment Log
(
  '00000000-0000-4000-a000-000000040006',
  '00000000-0000-4000-8000-000000000004',
  'exercise',
  'Attentional Strategy Mini-Experiment Log',
  'After choosing external and internal strategies to try, use this log to track your mini-experiments over the week. Record what you tried, when, and whether it helped.',
  70,
  NULL,
  '{
    "fields": [
      {
        "id": "experiments",
        "label": "Log each strategy you tried",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "date", "label": "Date", "type": "date"},
          {"id": "strategy_name", "label": "Which strategy did you try?", "type": "text", "placeholder": "e.g. Phone on silent, Elastic band snap, 25-min timer..."},
          {"id": "strategy_type", "label": "Type", "type": "select", "options": ["External", "Internal"]},
          {"id": "situation", "label": "What task were you doing?", "type": "text", "placeholder": "e.g. Working on spreadsheet, Studying, Cleaning..."},
          {"id": "effectiveness", "label": "How helpful was it? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not helpful at all", "5": "Somewhat helpful", "10": "Very helpful"}},
          {"id": "notes", "label": "What did you notice?", "type": "textarea", "placeholder": "e.g. Worked well for the first 20 mins but then I forgot to keep doing it..."}
        ],
        "min_items": 3,
        "max_items": 14
      },
      {"id": "best_strategy", "label": "Which strategy worked best for you and why?", "type": "textarea", "required": true},
      {"id": "worst_strategy", "label": "Which strategy did not work? Why do you think it failed?", "type": "textarea", "required": false}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Try at least 3 different strategies over the week. Log each attempt as close to the time as possible.",
    "clinician_notes": "Review in session. Determine whether failed strategies were applied incorrectly or are genuinely unsuitable. Successful strategies should be reinforced and made habitual. This is a core behavioural experiment — emphasise that ''data'' from the experiment is valuable even when strategies fail."
  }'::jsonb
),

-- ch4_item_07: Psychoeducation — Distractibility, Restlessness, and Internal Drive
(
  '00000000-0000-4000-a000-000000040007',
  '00000000-0000-4000-8000-000000000004',
  'psychoeducation',
  'Distractibility, Restlessness, and Internal Drive',
  'Read through this to understand the difference between external and internal distractibility, and how restlessness in adults with ADHD differs from childhood hyperactivity.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Two Types of Distraction",
        "body": "External distraction is noticing irrelevant things around you — someone walking past, a notification, background noise. Internal distraction is the urge to do something more stimulating — wanting to chat when you should be working quietly, or your mind jumping to more exciting ideas. Both types pull you away from the task at hand."
      },
      {
        "heading": "Restlessness in Adults",
        "body": "Unlike children with ADHD who may run around or climb things, adults usually experience restlessness as an ''internal motor'' — pacing, tapping fingers, jigging feet, changing posture, fiddling with objects, or excessive talking. This is often mistaken for anxiety. It is actually your ADHD brain seeking stimulation."
      },
      {
        "heading": "Capitalising on Your Energy",
        "body": "Instead of fighting restlessness, use it. Schedule tasks that involve physical exertion or movement as part of your reward system. Alternate between cognitively demanding tasks and physical activities. After completing a mentally challenging task, schedule something restful or physical to release pent-up energy."
      }
    ],
    "clinician_notes": "Distinguish between ADHD-driven restlessness and generalised anxiety. If the patient reports significant internal restlessness, incorporate physical activity breaks into their daily schedule (see Module 5 on Time Management for activity scheduling). This section links to the activity scheduling work in Chapter 5."
  }'::jsonb
),

-- ch4_item_08: Psychoeducation — The Anxiety-Attention Spiral (Figure 4.1)
(
  '00000000-0000-4000-a000-000000040008',
  '00000000-0000-4000-8000-000000000004',
  'psychoeducation',
  'The Anxiety-Attention Spiral (Figure 4.1)',
  'Read through this to understand how anxiety and attention problems feed each other in a vicious cycle — and what you can do about it.',
  20,
  'Figure 4.1',
  '{
    "content_blocks": [
      {
        "heading": "The Vicious Cycle",
        "body": "When you feel anxious about a task (e.g. ''I am so nervous, I will lose my train of thought''), your anxiety itself becomes a distraction. This makes your attention worse, which makes you more anxious, which further impairs your attention. It becomes a self-fulfilling prophecy."
      },
      {
        "heading": "How It Works Step by Step",
        "body": "Step 1: You feel anxious (''I cannot do this, I will fail''). Step 2: The anxious thoughts compete with the task for your attention (internal distraction). Step 3: Something in the environment also distracts you (external distraction). Step 4: You lose track of what you were doing. Step 5: You feel even more anxious (''I cannot remember what I was saying''). Step 6: The cycle repeats and worsens."
      },
      {
        "heading": "Breaking the Spiral",
        "body": "Awareness is the first step. When you notice anxiety rising, use the strategies from this module: take a scheduled break, use the snap technique to reorient, break the task into smaller pieces, or simply acknowledge the anxiety without judging yourself. Specific anxiety management techniques are covered in Module 9 if needed."
      }
    ],
    "clinician_notes": "This psychoeducation item is critical for patients who present with comorbid anxiety. The spiral diagram should be discussed in session. If the patient identifies strongly with this cycle, consider assigning Module 9 (Anxiety) alongside this module. Link back to the cognitive challenges strategy from Table 4.3."
  }'::jsonb
),

-- ch4_item_09: Psychoeducation — Understanding Memory Systems and ADHD
(
  '00000000-0000-4000-a000-000000040009',
  '00000000-0000-4000-8000-000000000004',
  'psychoeducation',
  'Understanding Memory Systems and ADHD',
  'Read through this to understand how memory works and why ADHD makes it harder. This will help you understand why the memory strategies in this module work.',
  20,
  'Figure 4.2',
  '{
    "content_blocks": [
      {
        "heading": "Three Memory Systems",
        "body": "Your brain processes memories in three stages: (1) Immediate memory — a brief ''snapshot'' of everything your senses pick up, quickly overwritten by new input. (2) Working memory (short-term) — a temporary workspace where information is held and manipulated, like a mental notepad. (3) Long-term memory — storage of information from minutes ago to years ago, involving encoding, storage, and retrieval."
      },
      {
        "heading": "How ADHD Affects Working Memory",
        "body": "Working memory has three parts: the Central Executive (decides what to pay attention to), the Phonological Loop (holds a few seconds of sounds/words, like a short tape loop), and the Visuospatial Sketchpad (holds visual images, like an Etch-a-Sketch). In ADHD, the Central Executive is easily hijacked by distractions, so information may not enter working memory properly in the first place."
      },
      {
        "heading": "Common Memory Problems in ADHD",
        "body": "Because of these disruptions, people with ADHD commonly: (1) Misplace things — forgetting where they put keys or glasses. (2) Forget appointments, deadlines, and future tasks. (3) Lose track of time passing. (4) Need instructions repeated slowly multiple times. (5) Struggle with mental arithmetic and processing. These problems arise because information is not being encoded properly, not because your long-term memory is broken."
      },
      {
        "heading": "The Good News",
        "body": "Memory problems in ADHD are mainly caused by poor attention at the encoding stage — not by a broken memory system. This means that strategies which improve attention at the point of encoding can dramatically improve your memory. Both external aids (diaries, alarms, lists) and internal techniques (repetition, visual cues, mnemonics) can help."
      }
    ],
    "clinician_notes": "Use the memory systems diagram (Figure 4.2) and working memory model (Figure 4.3) in session to explain concepts visually. Emphasise that ADHD memory problems are primarily encoding failures due to attentional disruption, not storage or retrieval failures. This reframe reduces self-blame and increases motivation to use strategies."
  }'::jsonb
),

-- ch4_item_10: Worksheet — My Memory Problems Checklist
(
  '00000000-0000-4000-a000-000000040010',
  '00000000-0000-4000-8000-000000000004',
  'worksheet',
  'My Memory Problems Checklist',
  'Check which memory problems you experience regularly. This helps identify which memory strategies to prioritise.',
  50,
  NULL,
  '{
    "fields": [
      {"id": "misplacing", "label": "Misplacing things (e.g. forgetting where you put glasses, keys, phone)", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "forgetting_appointments", "label": "Forgetting appointments, deadlines, and things that need to be done", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "losing_time", "label": "Losing time — not noticing time passing, being late, not knowing where time went", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "forgetting_instructions", "label": "Forgetting instructions — needing things repeated slowly multiple times", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "mental_processing", "label": "Difficulty with mental processing (e.g. mental arithmetic, holding several things in mind)", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very often"], "score_values": [0, 1, 2, 3, 4]},
      {"id": "worst_memory_problem", "label": "Which memory problem causes you the most difficulty in daily life?", "type": "textarea", "required": true, "placeholder": "Describe a specific recent example..."}
    ],
    "scoring": {
      "method": "sum",
      "max_score": 20,
      "interpretation": {
        "0-6": "Mild memory difficulties. Targeted strategies for your top problem area should help.",
        "7-13": "Moderate memory difficulties. A combination of external aids and internal strategies is recommended.",
        "14-20": "Significant memory difficulties. Start with external aids (diary, alarms, lists) and build internal strategies over time."
      }
    },
    "instructions_for_patient": "Think about the last month when rating each item. The specific example you write will help your therapist suggest the best strategies.",
    "clinician_notes": "Use responses to prioritise which external and internal memory strategies to introduce first. Patients scoring high on ''forgetting appointments'' should start with diary/alarm strategies. Those scoring high on ''forgetting instructions'' should practise repetition and rehearsal techniques."
  }'::jsonb
),

-- ch4_item_11: Worksheet — External Strategies to Improve Memory (Table 4.4)
(
  '00000000-0000-4000-a000-000000040011',
  '00000000-0000-4000-8000-000000000004',
  'worksheet',
  'External Strategies to Improve Memory (Table 4.4)',
  'These are external aids and systems that reduce the burden on your memory. Review each strategy, note whether you already use it, and pick 2-3 new ones to set up this week.',
  50,
  'Table 4.4',
  '{
    "fields": [
      {"id": "diary", "label": "Diary: Use a ''page-a-day'' diary for appointments and daily tasks. Do you use one?", "type": "select", "required": true, "options": ["Already use this", "Want to start this", "Not relevant to me"]},
      {"id": "weekly_calendar", "label": "Weekly Calendar: A shared family calendar with reminders and responsibilities. Do you have one?", "type": "select", "required": true, "options": ["Already use this", "Want to start this", "Not relevant to me"]},
      {"id": "annual_planner", "label": "Annual Wall Planner: For marking long-term events — holidays, birthdays, anniversaries. Do you use one?", "type": "select", "required": true, "options": ["Already use this", "Want to start this", "Not relevant to me"]},
      {"id": "voice_recorder", "label": "Voice Recorder / Voice Notes: Record verbal reminders and ideas on your phone when they come to mind. Do you do this?", "type": "select", "required": true, "options": ["Already use this", "Want to start this", "Not relevant to me"]},
      {"id": "self_messages", "label": "Self-Messages: Leave yourself voicemails, WhatsApp messages, or emails as reminders. Do you do this?", "type": "select", "required": true, "options": ["Already use this", "Want to start this", "Not relevant to me"]},
      {"id": "lists", "label": "Lists: Make daily to-do lists, shopping lists, and chore lists. Tick off completed items for positive reinforcement. Do you use lists?", "type": "select", "required": true, "options": ["Already use this", "Want to start this", "Not relevant to me"]},
      {"id": "help_cards", "label": "Help Cards: Write step-by-step instructions for tasks you do infrequently (e.g. filing tax returns, setting up appliances). Do you use these?", "type": "select", "required": true, "options": ["Already use this", "Want to start this", "Not relevant to me"]},
      {"id": "clocks", "label": "Watches and Clocks: Place clocks in every room. Use watches that beep or chime to reorient to time. Do you have clocks visible?", "type": "select", "required": true, "options": ["Already use this", "Want to start this", "Not relevant to me"]},
      {"id": "alarms", "label": "Alarms and Digital Reminders: Set phone alarms for medication, appointments, and recurring tasks. Do you use alarms?", "type": "select", "required": true, "options": ["Already use this", "Want to start this", "Not relevant to me"]},
      {"id": "phone_organiser", "label": "Phone as Organiser: Use your phone''s calendar, reminders, and notes apps as a combined organiser. Is your phone set up for this?", "type": "select", "required": true, "options": ["Already use this", "Want to start this", "Not relevant to me"]},
      {"id": "strategies_to_try", "label": "Which 2-3 external memory aids will you set up this week?", "type": "textarea", "required": true, "placeholder": "e.g. 1. Set up daily alarms for medication at 8am and 8pm. 2. Start using phone voice notes for ideas. 3. Buy a wall calendar for the kitchen."},
      {"id": "own_strategy", "label": "Do you already have an external memory strategy that works for you? Describe it.", "type": "textarea", "required": false, "placeholder": "e.g. I always put my keys in the same bowl by the door..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "External aids are your first line of defence against memory problems. The goal is not to remember everything — it is to build reliable systems so you do not have to.",
    "clinician_notes": "Introduce external aids gradually — do not overwhelm the patient with too many at once. Ensure electronic organisers are set up as functional tools and do not become sources of distraction. If the patient has tried and abandoned strategies before, explore what went wrong and set realistic goals for re-introducing them."
  }'::jsonb
),

-- ch4_item_12: Worksheet — Internal Strategies to Improve Memory (Table 4.5)
(
  '00000000-0000-4000-a000-000000040012',
  '00000000-0000-4000-8000-000000000004',
  'worksheet',
  'Internal Strategies to Improve Memory (Table 4.5)',
  'These are ''change from the inside out'' memory techniques — ways to strengthen how your brain encodes and retrieves information. Review each strategy and try at least 2 this week.',
  50,
  'Table 4.5',
  '{
    "fields": [
      {"id": "repetition_rehearsal", "label": "Repetition and Rehearsal: Repeat information to yourself (self-talk) to help it stick in working memory. Have you tried this?", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Not sure how"]},
      {"id": "repetition_practice", "label": "Write a piece of information you need to remember this week. Practice repeating it to yourself now.", "type": "textarea", "required": false, "placeholder": "e.g. Doctor''s appointment Thursday 3pm at Apollo Hospital..."},
      {"id": "visual_cue", "label": "Create a Visual Cue: Pair something you need to remember with a vivid, exaggerated mental image. The more bizarre the image, the better it sticks.", "type": "textarea", "required": true, "placeholder": "e.g. To remember to pay the water bill, picture yourself white-water rafting into the bank!"},
      {"id": "mnemonics", "label": "Mnemonics: Create a word or phrase where each letter stands for something you need to remember. Try one now.", "type": "textarea", "required": true, "placeholder": "e.g. Shopping list: S.T.O.P. = Sausages, Tomatoes, Oranges, Potatoes"},
      {"id": "spaced_retrieval", "label": "Spaced Retrieval: Rehearse information at increasing intervals (5 mins, 30 mins, 1 hour, next day). This strengthens the memory trace. Would you like to practise this in session?", "type": "select", "required": true, "options": ["Yes, let us practise now", "I will try this on my own", "I need more explanation"]},
      {"id": "problem_solving_retrace", "label": "Retracing Steps: When you lose something, mentally retrace your steps by asking: ''When did I last have it? Where did I go? Where would I put it now?''. Does this work for you?", "type": "select", "required": true, "options": ["Already do this", "Want to try this", "Never thought of this"]},
      {"id": "keeping_calm", "label": "Keeping Calm: Stress and anxiety interfere with both attention and memory. Before trying to remember something important, take a moment to calm yourself. What helps you feel calm?", "type": "textarea", "required": false, "placeholder": "e.g. Deep breathing, stepping outside for a minute, counting to 10..."},
      {"id": "strategies_to_try", "label": "Which 2 internal memory strategies will you practise this week?", "type": "textarea", "required": true, "placeholder": "e.g. 1. Create a mnemonic for my weekly shopping list. 2. Practise spaced retrieval for my new colleague''s name."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Internal strategies build your confidence and reduce reliance on external aids. Combine both for the best results.",
    "clinician_notes": "Spaced retrieval can be practised live in session — give the patient a piece of information and test recall at increasing intervals throughout the session. Visual cues and mnemonics are often fun and engaging for ADHD patients. The ''keeping calm'' strategy links to Chapters 9 and 10 for patients with comorbid anxiety or anger."
  }'::jsonb
),

-- ch4_item_13: Diary — Memory Strategy Practice Diary
(
  '00000000-0000-4000-a000-000000040013',
  '00000000-0000-4000-8000-000000000004',
  'diary',
  'Memory Strategy Practice Diary',
  'Use this diary over the next week to log each time you use a memory strategy — either external or internal. Record what happened and whether it helped.',
  60,
  NULL,
  '{
    "fields": [
      {"id": "log_date", "label": "Date", "type": "date", "required": true},
      {"id": "situation", "label": "What did you need to remember?", "type": "textarea", "required": true, "placeholder": "e.g. Appointment time, where I put my wallet, shopping list items..."},
      {"id": "strategy_used", "label": "Which strategy did you use?", "type": "text", "required": true, "placeholder": "e.g. Set a phone alarm, used a mnemonic, retraced my steps..."},
      {"id": "strategy_category", "label": "Was this an external or internal strategy?", "type": "select", "required": true, "options": ["External (aid/tool)", "Internal (mental technique)"]},
      {"id": "did_it_work", "label": "Did it work?", "type": "select", "required": true, "options": ["Yes, completely", "Partially", "No, I still forgot"]},
      {"id": "notes", "label": "Any observations or notes?", "type": "textarea", "required": false, "placeholder": "e.g. The alarm worked but I snoozed it and forgot again. Next time I will set two alarms..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Log entries as close to the event as possible. Aim for at least one entry per day. Even ''failures'' are useful data.",
    "clinician_notes": "Review in session. Look for patterns: are external strategies more effective than internal ones? Is the patient using strategies consistently? Celebrate successes and troubleshoot failures. Use this diary to gradually build a personalised ''memory toolkit'' for the patient."
  }'::jsonb
),

-- ch4_item_14: Exercise — Managing Restlessness and Energy
(
  '00000000-0000-4000-a000-000000040014',
  '00000000-0000-4000-8000-000000000004',
  'exercise',
  'Managing Restlessness and Energy',
  'People with ADHD often feel an ''internal motor'' — restlessness, fidgeting, pacing, or excessive talking. Instead of fighting this energy, this exercise helps you channel it productively.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "restlessness_signs", "label": "How does restlessness show up for you? (tick all that apply)", "type": "checkbox", "required": true, "options": ["Pacing or walking around", "Tapping fingers or jigging feet", "Changing posture frequently", "Fiddling with objects (pen, phone, hair)", "Swaying from foot to foot", "Humming or making sounds", "Excessive talking", "Feeling of being ''driven by a motor''", "Difficulty sitting still in meetings or at a desk", "Other"]},
      {"id": "restlessness_other", "label": "If ''Other'', describe how restlessness shows up for you.", "type": "textarea", "required": false},
      {"id": "physical_activities", "label": "List physical activities you enjoy or could do during the day to release restless energy.", "type": "textarea", "required": true, "placeholder": "e.g. Walking, stretching, dancing, going up and down stairs, push-ups, cycling..."},
      {"id": "relaxing_activities", "label": "List activities you find genuinely relaxing and restful.", "type": "textarea", "required": true, "placeholder": "e.g. Listening to music, sitting in the garden, having a warm shower, drawing..."},
      {"id": "schedule_plan", "label": "Plan your day to alternate between cognitively demanding tasks and physical/restful activities. Write a sample schedule for tomorrow.", "type": "textarea", "required": true, "placeholder": "e.g. 9-10am: Work on report. 10-10:15am: Walk around the block. 10:15-11am: Emails. 11-11:10am: Stretching..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "The goal is not to eliminate restlessness — it is to use it. Build movement and rest into your daily schedule so restlessness does not hijack your focus.",
    "clinician_notes": "Help the patient see restlessness as energy to be channelled, not a symptom to suppress. Integrate physical activity breaks into the time management plan (links to Module 5). Distinguish ADHD restlessness from anxiety — if the patient reports significant anxiety alongside restlessness, consider assigning Module 9."
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
