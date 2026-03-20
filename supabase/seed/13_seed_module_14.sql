-- 13_seed_module_14.sql
-- Seed content items for Module 14 (Preparing for the Future) into yb_content_items
-- Safe to re-run: uses ON CONFLICT DO UPDATE
--
-- Module 14 UUID: 00000000-0000-4000-8000-000000000014  (from 01_seed_modules.sql)
-- Content item UUIDs: 00000000-0000-4000-a000-000000140001 through ...140010

INSERT INTO yb_content_items (id, module_id, type, title, instructions, xp_value, companion_website_ref, schema)
VALUES

-- ch14_item_01: Psychoeducation — The Progression of ADHD
(
  '00000000-0000-4000-a000-000000140001',
  '00000000-0000-4000-8000-000000000014',
  'psychoeducation',
  'The Progression of ADHD',
  'Read through this material to understand how ADHD changes over time and what to expect going forward.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "How Symptoms Change Over Time",
        "body": "Different ADHD symptoms decline at different rates. Hyperactivity usually diminishes first, followed by impulsivity. Inattention tends to be the most prominent symptom lasting into adulthood. Even when you no longer meet full diagnostic criteria, you may remain partially symptomatic — this is known as ''ADHD in partial remission''."
      },
      {
        "heading": "Three Factors That Determine Functional Impact",
        "body": "1. Biological change — brain maturation naturally reduces some symptoms over time. 2. Environmental change — your ability to shape your surroundings so that problems arising from symptoms are reduced. 3. Psychological coping strategies — recognising how symptoms affect you and developing internal techniques to manage them. You cannot speed up biological change, but you can influence environmental and psychological factors — and that is what the Young-Bramham Programme has equipped you to do."
      },
      {
        "heading": "The Legacy of ADHD",
        "body": "Even when symptoms improve, the ''legacy'' of ADHD can persist. Years of difficulties may have left you with low self-esteem, a pattern of anticipated failure, and learned helplessness. These patterns can become socially ingrained. This is sometimes called the ''hangover'' of ADHD. Family and friends may not understand that your current difficulties stem from insecurity and lack of confidence rather than laziness or attitude problems."
      },
      {
        "heading": "Breaking the Negative Cycle",
        "body": "Many people with ADHD have tried and failed at so many things that they lose faith in themselves. Failure gets reinforced by further failure — a self-fulfilling prophecy. Successes are minimised or not recognised at all. The good news: through reappraising your capabilities, you can develop a greater sense of self-efficacy and purpose. That is the goal of this final module."
      }
    ],
    "clinician_notes": "This psychoeducation sets the stage for the entire module. Normalise the ''ADHD hangover'' concept. Validate that even when symptoms remit, the emotional legacy is real and deserves attention. Emphasise that the three-factor model gives them agency over two of the three factors."
  }'::jsonb
),

-- ch14_item_02: Psychoeducation — Raising Self-Esteem and Recognising ADHD Strengths
(
  '00000000-0000-4000-a000-000000140002',
  '00000000-0000-4000-8000-000000000014',
  'psychoeducation',
  'Raising Self-Esteem and Recognising ADHD Strengths',
  'Read through this to understand why self-esteem work is so important at this stage — and what strengths you bring.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Why Self-Esteem Matters Now",
        "body": "People with ADHD often enter treatment with a chronic sense of failure — a mismatch between actual achievement and potential, and the belief that they have to work harder than others to achieve the same outcome. Through therapy, you may have gained a more complete recognition of the severity of your problems and feel regret about lost opportunities. This is normal and important to acknowledge."
      },
      {
        "heading": "The Good Side of ADHD",
        "body": "The experience of ADHD can be characterised as ''the good, the bad and the ugly''. It is essential to focus on the positive features. People with ADHD are often creative, artistic, witty, and entertaining. You may have specialised skills — creative flair in art, design, music, or practical skills like technology. These are your ''islands of excellence'' that form the basis of fundamental optimism."
      },
      {
        "heading": "Resilience — Your Greatest Strength",
        "body": "Resilience is the factor that helps you stay the course. The motto of people with ADHD is: ''if at first you don''t succeed, try, try again''. People who do not try will never have the opportunity to succeed. Your natural creativity, optimism, and interest in new challenges mean you always have access to multiple solutions and possibilities. People with ADHD are life''s true entrepreneurs — but to succeed, you must find a way of defining your own structures and boundaries."
      },
      {
        "heading": "From Self-Doubt to Self-Efficacy",
        "body": "Improving self-esteem involves reviewing your lifetime achievements and recognising progress and success. The journey starts with believing you can achieve. Negative assumptions and expectations make you avoid situations, especially when they seem anxiety-provoking. The exercises that follow are designed to shift you from a pattern of anticipated failure to one of confident forward-planning."
      }
    ],
    "clinician_notes": "This section explicitly addresses what has been an implicit theme throughout the programme. Help the client identify their personal ''islands of excellence''. Validate that self-efficacy often exists underneath the low self-esteem — the underlying belief in their potential is what makes them resilient. Use this as a bridge to the Top Ten Achievements exercise."
  }'::jsonb
),

-- ch14_item_03: Worksheet — Top Ten Achievements (Table 14.1)
(
  '00000000-0000-4000-a000-000000140003',
  '00000000-0000-4000-8000-000000000014',
  'worksheet',
  'Top Ten Achievements (Table 14.1)',
  'List your top 10 achievements to date. These can be from any area of life — personal, professional, academic, social. Big or small, if you are proud of it, it counts. This exercise draws your attention to what you have accomplished despite your many challenges.',
  50,
  'Table 14.1',
  '{
    "fields": [
      {"id": "achievement_1", "label": "Achievement 1", "type": "textarea", "required": true, "placeholder": "e.g. Completed a degree, raised my children, learned to drive..."},
      {"id": "achievement_2", "label": "Achievement 2", "type": "textarea", "required": true, "placeholder": "Think about personal milestones..."},
      {"id": "achievement_3", "label": "Achievement 3", "type": "textarea", "required": true, "placeholder": "Career or work achievements..."},
      {"id": "achievement_4", "label": "Achievement 4", "type": "textarea", "required": true, "placeholder": "Something you overcame..."},
      {"id": "achievement_5", "label": "Achievement 5", "type": "textarea", "required": true, "placeholder": "A skill you developed..."},
      {"id": "achievement_6", "label": "Achievement 6", "type": "textarea", "required": false},
      {"id": "achievement_7", "label": "Achievement 7", "type": "textarea", "required": false},
      {"id": "achievement_8", "label": "Achievement 8", "type": "textarea", "required": false},
      {"id": "achievement_9", "label": "Achievement 9", "type": "textarea", "required": false},
      {"id": "achievement_10", "label": "Achievement 10", "type": "textarea", "required": false},
      {"id": "reflection", "label": "Looking at this list, what does it tell you about yourself?", "type": "textarea", "required": true, "placeholder": "What strengths do these achievements reveal? What patterns do you notice?"}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Take your time with this. You may find it hard at first — people with ADHD are more familiar with their weaknesses. Ask family or friends if you get stuck. You have achieved more than you think.",
    "clinician_notes": "Many clients will struggle to list 10 achievements. Prompt generously. Ask about childhood, school, relationships, creative pursuits, acts of kindness, things they survived. The reflection question is critical — guide the client to see patterns of resilience and capability. This exercise provides external validation that counteracts internalised failure."
  }'::jsonb
),

-- ch14_item_04: Worksheet — Future Goals (Table 14.2)
(
  '00000000-0000-4000-a000-000000140004',
  '00000000-0000-4000-8000-000000000014',
  'worksheet',
  'Future Goals (Table 14.2)',
  'Now that you have reviewed what you have achieved, it is time to look forward. List five goals you wish to achieve in the next year. These should be realistic but stretching — things that matter to you personally.',
  50,
  'Table 14.2',
  '{
    "fields": [
      {"id": "goal_1", "label": "Goal 1", "type": "textarea", "required": true, "placeholder": "e.g. Complete a professional qualification, start exercising regularly..."},
      {"id": "goal_2", "label": "Goal 2", "type": "textarea", "required": true, "placeholder": "e.g. Improve a relationship, learn a new skill..."},
      {"id": "goal_3", "label": "Goal 3", "type": "textarea", "required": true, "placeholder": "e.g. Get finances in order, find a new job..."},
      {"id": "goal_4", "label": "Goal 4", "type": "textarea", "required": false},
      {"id": "goal_5", "label": "Goal 5", "type": "textarea", "required": false},
      {"id": "tangible_outcomes", "label": "Which of these goals will give you a tangible outcome (certificate, document, visible result)?", "type": "textarea", "required": true, "placeholder": "Tangible outcomes provide external validation and positive reinforcement..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Keep this list visible — on your phone, on the fridge, somewhere you will see it. Paperwork and tangible outcomes provide external validation, so aim to include goals that produce a concrete result.",
    "clinician_notes": "Encourage goals that produce tangible outcomes (certificates, portfolios, visible results) as these provide clear positive reinforcement. Goals should be reviewed in follow-up. Ensure at least some goals are achievable in the short term to build momentum."
  }'::jsonb
),

-- ch14_item_05: Exercise — Steps Towards Goals (Figure 14.1)
(
  '00000000-0000-4000-a000-000000140005',
  '00000000-0000-4000-8000-000000000014',
  'exercise',
  'Steps Towards Goals (Figure 14.1)',
  'Pick three of your goals from the Future Goals worksheet. For each one, break it down into smaller, achievable steps — just like you learned in the Time Management module. Include a reward for completing each step.',
  70,
  'Figure 14.1',
  '{
    "fields": [
      {"id": "goal_a_name", "label": "Goal A — Name", "type": "text", "required": true, "placeholder": "Copy one goal from your Future Goals list"},
      {"id": "goal_a_step_1", "label": "Goal A — Step 1", "type": "text", "required": true, "placeholder": "First concrete action to take..."},
      {"id": "goal_a_step_2", "label": "Goal A — Step 2", "type": "text", "required": true, "placeholder": "Next step..."},
      {"id": "goal_a_step_3", "label": "Goal A — Step 3", "type": "text", "required": true, "placeholder": "Next step..."},
      {"id": "goal_a_reward", "label": "Goal A — Reward for progress", "type": "text", "required": true, "placeholder": "e.g. Watch a movie, go for a swim, treat myself to a nice meal..."},
      {"id": "goal_b_name", "label": "Goal B — Name", "type": "text", "required": true, "placeholder": "Copy another goal from your Future Goals list"},
      {"id": "goal_b_step_1", "label": "Goal B — Step 1", "type": "text", "required": true},
      {"id": "goal_b_step_2", "label": "Goal B — Step 2", "type": "text", "required": true},
      {"id": "goal_b_step_3", "label": "Goal B — Step 3", "type": "text", "required": true},
      {"id": "goal_b_reward", "label": "Goal B — Reward for progress", "type": "text", "required": true},
      {"id": "goal_c_name", "label": "Goal C — Name", "type": "text", "required": true, "placeholder": "Copy a third goal from your Future Goals list"},
      {"id": "goal_c_step_1", "label": "Goal C — Step 1", "type": "text", "required": true},
      {"id": "goal_c_step_2", "label": "Goal C — Step 2", "type": "text", "required": true},
      {"id": "goal_c_step_3", "label": "Goal C — Step 3", "type": "text", "required": true},
      {"id": "goal_c_reward", "label": "Goal C — Reward for progress", "type": "text", "required": true},
      {"id": "reward_evolution", "label": "As you progress, try to shift rewards from comfort-based (cup of tea, time off) to process-oriented (go for a swim, research a class). What process-oriented rewards appeal to you?", "type": "textarea", "required": false, "placeholder": "Process rewards contribute towards your goals while still feeling rewarding..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Breaking goals into steps makes them achievable rather than overwhelming. Remember from the Time Management module: small steps, clear timelines, built-in rewards. This exercise helps you shift from supported therapy to self-management.",
    "clinician_notes": "This exercise directly applies the step-based planning from Module 5 (Time Management, Figure 5.1) to future goals. Encourage the client to include rewards at step level, not just goal level. Highlight the shift from comfort-based rewards to process-oriented rewards as a sign of growth. This exercise is key for treatment disengagement — the client is learning to plan independently."
  }'::jsonb
),

-- ch14_item_06: Worksheet — Review of Successful Strategies (Table 14.3)
(
  '00000000-0000-4000-a000-000000140006',
  '00000000-0000-4000-8000-000000000014',
  'worksheet',
  'Review of Successful Strategies (Table 14.3)',
  'During your treatment, you have tried various strategies across different modules. For each area below, list the strategies you used and rate how useful each one was from 0 (not at all useful) to 10 (extremely useful). Leave sections blank if you did not complete that module.',
  50,
  'Table 14.3',
  '{
    "fields": [
      {"id": "attention_strategies", "label": "Attention — What strategies did you use to improve attention?", "type": "textarea", "required": false, "placeholder": "e.g. Quiet room, earplugs, phone off, cue cards, regular breaks..."},
      {"id": "attention_rating", "label": "Attention — How useful were these strategies overall? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "memory_strategies", "label": "Memory — What strategies did you use to improve memory?", "type": "textarea", "required": false, "placeholder": "e.g. To-do lists, diary, phone alarms for appointments..."},
      {"id": "memory_rating", "label": "Memory — How useful were these strategies overall? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "time_management_strategies", "label": "Time Management — What strategies did you use?", "type": "textarea", "required": false, "placeholder": "e.g. Breaking tasks into steps, diary activity planner, reward systems..."},
      {"id": "time_management_rating", "label": "Time Management — How useful? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "problem_solving_strategies", "label": "Problem Solving — What strategies did you use?", "type": "textarea", "required": false, "placeholder": "e.g. Step-by-step problem solving, pros and cons lists..."},
      {"id": "problem_solving_rating", "label": "Problem Solving — How useful? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "impulsivity_strategies", "label": "Impulsivity — What strategies did you use?", "type": "textarea", "required": false, "placeholder": "e.g. IMPULSE CONTROL method, double-check questions, counting backwards..."},
      {"id": "impulsivity_rating", "label": "Impulsivity — How useful? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "social_strategies", "label": "Social Relationships — What strategies did you use?", "type": "textarea", "required": false, "placeholder": "e.g. Active listening, perspective-taking, communication scripts..."},
      {"id": "social_rating", "label": "Social Relationships — How useful? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "anxiety_strategies", "label": "Anxiety — What strategies did you use?", "type": "textarea", "required": false, "placeholder": "e.g. Relaxation techniques, graded exposure, cognitive restructuring..."},
      {"id": "anxiety_rating", "label": "Anxiety — How useful? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "anger_strategies", "label": "Frustration and Anger — What strategies did you use?", "type": "textarea", "required": false, "placeholder": "e.g. Monitoring feelings, ADHD formula, listening to criticism, volume control..."},
      {"id": "anger_rating", "label": "Frustration and Anger — How useful? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "mood_strategies", "label": "Low Mood and Depression — What strategies did you use?", "type": "textarea", "required": false, "placeholder": "e.g. Activity scheduling, thought challenging, behavioural activation..."},
      {"id": "mood_rating", "label": "Low Mood — How useful? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "sleep_strategies", "label": "Sleep — What strategies did you use?", "type": "textarea", "required": false, "placeholder": "e.g. Regular bedtime, no TV in bed, worry list, multiple alarms, curtains open..."},
      {"id": "sleep_rating", "label": "Sleep — How useful? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "substance_strategies", "label": "Substance Misuse — What strategies did you use?", "type": "textarea", "required": false, "placeholder": "e.g. Decisional balance sheets, distraction and replacement, challenging beliefs..."},
      {"id": "substance_rating", "label": "Substance Misuse — How useful? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all useful", "10": "Extremely useful"}, "required": false},
      {"id": "own_strategies", "label": "Have you developed any strategies of your own that worked well? Describe them here.", "type": "textarea", "required": false, "placeholder": "Include anything you figured out yourself during treatment..."},
      {"id": "top_three", "label": "Looking across all areas, what are your top 3 most effective strategies?", "type": "textarea", "required": true, "placeholder": "These are the strategies to keep using after treatment ends..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Only fill in sections for modules you completed. Be honest about what worked and what did not. This list becomes your personal toolkit for after treatment ends.",
    "clinician_notes": "This is a critical relapse-prevention tool. The completed worksheet serves as the client''s personal reference guide after therapy ends. Review it together and help the client identify which strategies were most effective and why. Strategies rated below 4 may need discussion — were they poorly applied or genuinely unhelpful? Modules not completed should be left blank, but note if cross-module learning occurred. The top-three question helps prioritise what the client should maintain."
  }'::jsonb
),

-- ch14_item_07: Psychoeducation — Accessing Support After Treatment
(
  '00000000-0000-4000-a000-000000140007',
  '00000000-0000-4000-8000-000000000014',
  'psychoeducation',
  'Accessing Support After Treatment',
  'Read through this to understand the different types of support available to you after therapy ends.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Why This Matters",
        "body": "Ending the therapeutic relationship can be difficult. You may have encountered for the first time a relationship in which you felt constructively helped. It is important to prepare for the end of treatment by building a comprehensive plan for ongoing support — this is your ''relapse prevention'' plan."
      },
      {
        "heading": "Support from Family and Friends",
        "body": "By identifying specific ways family and friends can help, both you and your supporters benefit. Educate them about ADHD — not as an excuse for inappropriate behaviour, but so they understand that difficulties with organisation, lateness, or forgetfulness are not due to a lack of caring. They can remind you of strategies that worked, prompt you when you forget medication, and provide positive reinforcement."
      },
      {
        "heading": "Professional Help",
        "body": "Some individuals may need referral for more specialised treatment — such as addiction services or complex medication management. Know what services are available, how to access them, and what re-referral looks like. Be aware that waiting lists can be frustrating — your desire for immediate results may make you appear unreasonable. Use the impulse control techniques you have learned."
      },
      {
        "heading": "Support Groups",
        "body": "There are many ADHD support groups available — from face-to-face meetings to online communities. Gaining support from others with ADHD is beneficial: they understand your experience, and it is both reassuring and empowering to share strategies. Many people feel nervous about joining a group at first, but shared understanding tends to dissolve these concerns quickly."
      },
      {
        "heading": "Moving from Help-Seeking to Self-Help",
        "body": "Many adults with ADHD have become accustomed to a help-seeking model. The goal now is to transfer to a model that depends less on mental health services and more on self-help and community support. You have the tools — this module is about making sure you know how to use them independently."
      }
    ],
    "clinician_notes": "This section prepares the client for treatment termination. Be sensitive to the emotional difficulty of ending the therapeutic relationship — especially for clients who have never felt listened to before. Discuss specific local resources, support groups, and re-referral pathways. Role-play accessing services if the client is anxious about it."
  }'::jsonb
),

-- ch14_item_08: Exercise — Enlisting Support from Family and Friends
(
  '00000000-0000-4000-a000-000000140008',
  '00000000-0000-4000-8000-000000000014',
  'exercise',
  'Enlisting Support from Family and Friends',
  'Think about the people in your life who can support you after treatment ends. For each person, identify a specific way they can help and how you will explain what you need.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "supporter_1_name", "label": "Supporter 1 — Who? (first name or relationship only)", "type": "text", "required": true, "placeholder": "e.g. Partner, Mum, Best friend, Colleague..."},
      {"id": "supporter_1_help", "label": "Supporter 1 — How specifically can they help?", "type": "textarea", "required": true, "placeholder": "e.g. Remind me to take medication, help me make weekly lists, give me honest feedback about my timekeeping..."},
      {"id": "supporter_1_explain", "label": "Supporter 1 — How will you explain what you need from them?", "type": "textarea", "required": true, "placeholder": "e.g. I will tell them that because of my ADHD, I need external reminders and that it is not about being lazy..."},
      {"id": "supporter_2_name", "label": "Supporter 2 — Who?", "type": "text", "required": true},
      {"id": "supporter_2_help", "label": "Supporter 2 — How specifically can they help?", "type": "textarea", "required": true},
      {"id": "supporter_2_explain", "label": "Supporter 2 — How will you explain what you need?", "type": "textarea", "required": true},
      {"id": "supporter_3_name", "label": "Supporter 3 — Who?", "type": "text", "required": false},
      {"id": "supporter_3_help", "label": "Supporter 3 — How specifically can they help?", "type": "textarea", "required": false},
      {"id": "supporter_3_explain", "label": "Supporter 3 — How will you explain what you need?", "type": "textarea", "required": false},
      {"id": "conversation_plan", "label": "When will you have these conversations? Set a specific date or time.", "type": "textarea", "required": true, "placeholder": "e.g. This weekend, at dinner on Friday, during our next phone call..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Be specific about what you need. Vague requests like ''just support me'' are hard for others to act on. Concrete requests like ''remind me to check my planner every Sunday evening'' are much more effective.",
    "clinician_notes": "Role-play the conversation with the client in session if they are anxious about asking for help. Help them phrase requests positively rather than as complaints. Emphasise that supporters need education about ADHD — the client should explain why the support is needed, not just what is needed. Review the social relationships module techniques if relevant."
  }'::jsonb
),

-- ch14_item_09: Exercise — Relapse Prevention and Support Network Plan
(
  '00000000-0000-4000-a000-000000140009',
  '00000000-0000-4000-8000-000000000014',
  'exercise',
  'Relapse Prevention and Support Network Plan',
  'This is your comprehensive plan for maintaining progress after treatment ends. Fill in each section carefully — this document is your safety net.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "top_strategies", "label": "My top 3 strategies that work best for me (from your Review of Successful Strategies)", "type": "textarea", "required": true, "placeholder": "Copy your top 3 from the review worksheet..."},
      {"id": "warning_signs", "label": "Warning signs that things are slipping — what should I watch for?", "type": "textarea", "required": true, "placeholder": "e.g. Missing medication for 3+ days, not using my planner, isolating myself, sleep getting worse..."},
      {"id": "action_plan", "label": "If I notice warning signs, I will...", "type": "textarea", "required": true, "placeholder": "e.g. Restart my daily symptom logging, call my supporter, review my strategies worksheet, book a GP appointment..."},
      {"id": "professional_contacts", "label": "Professional contacts I can reach out to (GP, psychiatrist, counsellor, helpline)", "type": "textarea", "required": true, "placeholder": "List names, phone numbers, or services you can contact..."},
      {"id": "support_groups", "label": "Support groups or communities I will join or stay connected with", "type": "textarea", "required": false, "placeholder": "e.g. Local ADHD support group, online community, buddy system..."},
      {"id": "learning_support", "label": "Learning or workplace support I can access", "type": "textarea", "required": false, "placeholder": "e.g. Learning support services, exam dispensations, workplace adjustments, vocational counselling..."},
      {"id": "skills_inventory", "label": "My skills and strengths — what do I do well?", "type": "textarea", "required": true, "placeholder": "e.g. Creative thinking, problem-solving under pressure, connecting with people, artistic ability..."},
      {"id": "likes_dislikes", "label": "In work or study, what do I like and dislike? (to guide future career choices)", "type": "textarea", "required": false, "placeholder": "Likes: variety, creativity, hands-on work... Dislikes: repetitive tasks, open-plan offices, long meetings..."},
      {"id": "commitment", "label": "My commitment to myself — what will I keep doing every week?", "type": "textarea", "required": true, "placeholder": "e.g. Log my symptoms daily, review my planner every Sunday, take medication on time, attend my support group monthly..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Keep this plan somewhere safe and accessible. Review it monthly. Share relevant parts with your supporters. This is not a one-time exercise — update it as your life changes.",
    "clinician_notes": "This is the most important clinical document in the termination process. Review every section together. Ensure the professional contacts are accurate and the client knows how to access them. The warning signs section is critical — help the client identify early indicators specific to them. If the client has comorbid conditions requiring ongoing management, ensure appropriate referrals are included. This plan should be revisited if any follow-up sessions are scheduled."
  }'::jsonb
),

-- ch14_item_10: Diary — Looking Back and Looking Forward Reflection Diary
(
  '00000000-0000-4000-a000-000000140010',
  '00000000-0000-4000-8000-000000000014',
  'diary',
  'Looking Back and Looking Forward Reflection Diary',
  'Over the final week of treatment, complete one entry per day reflecting on your journey through the Young-Bramham Programme. Each day has a different focus.',
  60,
  NULL,
  '{
    "fields": [
      {"id": "day1_date", "label": "Day 1 — Date", "type": "date", "required": true},
      {"id": "day1_journey", "label": "Day 1 — My journey: What was it like hearing ''You have ADHD''? How has your understanding of yourself changed since then?", "type": "textarea", "required": true, "placeholder": "Reflect on the emotional journey from diagnosis to now..."},
      {"id": "day2_date", "label": "Day 2 — Date", "type": "date", "required": true},
      {"id": "day2_challenges", "label": "Day 2 — Challenges overcome: What was the hardest part of treatment? What did you push through?", "type": "textarea", "required": true, "placeholder": "Think about worksheets, exercises, or personal realisations that were difficult..."},
      {"id": "day3_date", "label": "Day 3 — Date", "type": "date", "required": true},
      {"id": "day3_strengths", "label": "Day 3 — My strengths: What positive qualities of yours became clearer during treatment?", "type": "textarea", "required": true, "placeholder": "Creativity, resilience, humour, determination, empathy..."},
      {"id": "day4_date", "label": "Day 4 — Date", "type": "date", "required": true},
      {"id": "day4_people", "label": "Day 4 — People around me: Who supported you during treatment? How will you maintain those connections?", "type": "textarea", "required": true, "placeholder": "Therapist, family, friends, support group members..."},
      {"id": "day5_date", "label": "Day 5 — Date", "type": "date", "required": true},
      {"id": "day5_tools", "label": "Day 5 — My toolkit: Which strategies and techniques will you carry forward? What will you keep doing?", "type": "textarea", "required": true, "placeholder": "The practical skills you will maintain..."},
      {"id": "day6_date", "label": "Day 6 — Date", "type": "date", "required": true},
      {"id": "day6_hopes", "label": "Day 6 — Hopes and plans: What are you most looking forward to in the next year?", "type": "textarea", "required": true, "placeholder": "Goals, dreams, things you now believe you can achieve..."},
      {"id": "day7_date", "label": "Day 7 — Date", "type": "date", "required": true},
      {"id": "day7_letter", "label": "Day 7 — Letter to myself: Write a short letter to your future self. What do you want to remember about this time? What advice would you give yourself for the tough days ahead?", "type": "textarea", "required": true, "placeholder": "Dear future me..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Complete one entry per day for 7 days. Each day has a different theme. There are no right answers — this is your personal record of the journey. The final entry, a letter to your future self, is something you can read whenever you need a reminder of how far you have come.",
    "clinician_notes": "This diary bridges the emotional and practical aspects of treatment termination. Review entries in the final session. The Day 7 letter is particularly powerful — encourage the client to keep it accessible (e.g. photographed on their phone). This exercise processes the emotional journey while reinforcing practical gains. It also serves as a therapeutic closure ritual."
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
