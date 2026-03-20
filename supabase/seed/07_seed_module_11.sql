-- 07_seed_module_11.sql
-- Seed content items for Module 11 (Low Mood and Depression) into yb_content_items
-- Safe to re-run: uses ON CONFLICT DO UPDATE
--
-- Module 11 UUID: 00000000-0000-4000-8000-000000000011  (from 01_seed_modules.sql)
-- Content item UUIDs: 00000000-0000-4000-a000-000000110001 through ...110012

INSERT INTO yb_content_items (id, module_id, type, title, instructions, xp_value, companion_website_ref, schema)
VALUES

-- ch11_item_01: Psychoeducation — Understanding Low Mood and Depression in ADHD
(
  '00000000-0000-4000-a000-000000110001',
  '00000000-0000-4000-8000-000000000011',
  'psychoeducation',
  'Understanding Low Mood and Depression in ADHD',
  'Read through this psychoeducation material to understand the relationship between ADHD and depression before starting the exercises.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Depression and ADHD — How Common Is It?",
        "body": "Depression is a common comorbid condition in adults with ADHD. In clinical samples, 16-31% of adults with ADHD have major depression, and 19-37% have dysthymia — a more mild but persistent form of depression with low mood as a core feature. Dips in mood are very likely to be experienced by ADHD adults."
      },
      {
        "heading": "How Depression Feels Different with ADHD",
        "body": "When depression is comorbid with ADHD, you experience additional symptoms: greater concentration problems, feelings of lethargy, and an internal conflict between restlessness and lack of motivation. Although you feel restless inside, your lack of motivation and energy means your natural optimism and creativity is ''trapped'' in a negative cycle of depressive rumination."
      },
      {
        "heading": "Why ADHD Adults Are More Vulnerable",
        "body": "There are several reasons why ADHD increases the risk of depression: adverse childhood experiences, criticism from parents and teachers, scholastic underachievement mistaken for laziness, difficulty developing supportive relationships, low self-esteem, and the accumulation of negative life events. It is no great surprise that these experiences predispose a person to feel low."
      },
      {
        "heading": "Late Diagnosis and Depression",
        "body": "Research shows the later a person receives an ADHD diagnosis, the greater their severity of depressive symptoms. Even after diagnosis and improvement in ADHD symptoms, people may engage in depressive rumination — dwelling on what might have been different if diagnosed earlier."
      },
      {
        "heading": "Mood Lability and Emotional Regulation",
        "body": "Mood regulation is a considerable problem for adults with ADHD, and capacity to regulate mood worsens when depressed. You may become tearful quickly, ''touchy'' or ''snappy''. In ADHD, low mood is often displayed as anger and misunderstood by others as bad temperament. This may reflect a need to hide feelings of despair."
      },
      {
        "heading": "Resilience — The Protective Factor",
        "body": "There is a positive aspect to the ADHD personality that may protect against spiralling into clinical depression — resilience and the ability to bounce back and try again. Mood lability means mood changes sometimes rapidly, and these fluctuations may ''kickstart'' creativity and zest for life. However, this resilience has limits when negative experiences accumulate."
      }
    ],
    "clinician_notes": "Even mild depression should be taken seriously and treated as a priority, especially since ADHD individuals are more likely to attempt suicide in the context of a depressive illness. If comorbid with severe depression, treat the depression first with antidepressant medication and psychological interventions. Distinguish from bipolar disorder: ADHD mood swings dissipate quickly (hours to a day) whereas manic episodes increase gradually and persist for weeks or months."
  }'::jsonb
),

-- ch11_item_02: Psychoeducation — The Cognitive Model of Depression in ADHD (Figure 11.1)
(
  '00000000-0000-4000-a000-000000110002',
  '00000000-0000-4000-8000-000000000011',
  'psychoeducation',
  'The Cognitive Model of Depression in ADHD (Figure 11.1)',
  'This model explains how depression develops and maintains itself in people with ADHD. Work through each stage with your therapist and fill in your own examples.',
  20,
  'Figure 11.1a',
  '{
    "fields": [
      {"id": "early_experience", "label": "Early Experience: What negative experiences did you have growing up? (e.g. comparison to siblings, educational underachievement, criticism from important adults, impulsive behaviour consequences)", "type": "textarea", "required": true, "placeholder": "e.g. I was always compared to my sister who did well at school..."},
      {"id": "schemas_beliefs", "label": "Schemata / Unconditional beliefs about yourself: What do you believe about yourself deep down? (e.g. ''I''m a loser'', ''I''m not good at anything'', ''I''m different from everyone else'')", "type": "textarea", "required": true, "placeholder": "e.g. I believe I am not as capable as other people..."},
      {"id": "dysfunctional_assumptions", "label": "Dysfunctional Assumptions: What ''if...then'' rules do you live by? (e.g. ''If I don''t always succeed, then I''ll be a failure'')", "type": "textarea", "required": true, "placeholder": "e.g. If I don''t do everything perfectly, people will think I''m no good..."},
      {"id": "stressful_incident", "label": "Stressful Incident: What recent event triggered or worsened your low mood? (e.g. failing exams, losing a job, being rejected in a relationship)", "type": "textarea", "required": true, "placeholder": "e.g. I lost my job last month..."},
      {"id": "activated_assumptions", "label": "Assumptions Activated: What thoughts came up after the stressful incident? (e.g. ''I''ve failed again'', ''I''m not as good as other people'')", "type": "textarea", "required": true, "placeholder": "e.g. I thought: here we go again, I always mess things up..."},
      {"id": "negative_automatic_thoughts", "label": "Negative Automatic Thoughts: What thoughts keep racing through your head? (e.g. ''I''m a failure'', ''I''m worthless'', ''Nobody likes me'', ''It''s useless even trying'')", "type": "textarea", "required": true, "placeholder": "e.g. I keep thinking I''m worthless and that nobody cares..."},
      {"id": "symptoms_affective", "label": "Emotional Symptoms: What mood symptoms do you notice? (e.g. sadness, tearfulness, mood swings)", "type": "textarea", "required": false, "placeholder": "e.g. I cry easily and feel sad most of the time..."},
      {"id": "symptoms_somatic", "label": "Physical Symptoms: What physical symptoms do you notice? (e.g. tiredness, difficulty concentrating, restlessness)", "type": "textarea", "required": false, "placeholder": "e.g. I feel exhausted but also restless inside..."},
      {"id": "symptoms_cognitive", "label": "Thinking Symptoms: What thinking patterns do you notice? (e.g. hopelessness, seeing only the negative)", "type": "textarea", "required": false, "placeholder": "e.g. I can only see the worst in every situation..."},
      {"id": "symptoms_motivational", "label": "Motivational Symptoms: How has your motivation been affected? (e.g. reduced energy, loss of enthusiasm, lack of creativity)", "type": "textarea", "required": false, "placeholder": "e.g. I have no energy to do anything and no ideas feel exciting anymore..."},
      {"id": "negative_behaviour", "label": "Negative Behaviour: What have you started doing (or stopped doing) as a result? (e.g. withdrawal, avoidance, loss of motivation)", "type": "textarea", "required": false, "placeholder": "e.g. I have been avoiding my friends and staying in bed..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "This is a personal model of how depression works in YOUR life. Fill in each box with your own examples. This will help you and your therapist understand where to intervene.",
    "clinician_notes": "Adapted from Beck (1976). Walk through each stage with the client using their own examples. Highlight how the vicious cycle maintains low mood. Emphasise that the cycle CAN be reversed — this is the basis for the interventions that follow. People with ADHD often recognise and relate strongly to this model."
  }'::jsonb
),

-- ch11_item_03: Psychoeducation — Understanding Negative Automatic Thoughts (NATs)
(
  '00000000-0000-4000-a000-000000110003',
  '00000000-0000-4000-8000-000000000011',
  'psychoeducation',
  'Understanding Negative Automatic Thoughts (NATs)',
  'Read about the characteristics of negative automatic thoughts and how they affect people with ADHD.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "What Are Negative Automatic Thoughts?",
        "body": "Negative automatic thoughts (NATs) are thoughts that just pop into your head without you choosing them. They only focus on the negative, they keep the vicious cycle of low mood going, they seem true so you don''t question them, and they are hard to switch off."
      },
      {
        "heading": "Why NATs Hit Harder with ADHD",
        "body": "The ADHD thinking style is driven by speed. You involuntarily react both behaviourally and cognitively. Thoughts ''come from nowhere'' and flit from one idea to the next. When these thoughts are negative, they are particularly distressing. Because you have difficulty evaluating thoughts and thinking about consequences, you often erroneously accept negative thoughts as the truth."
      },
      {
        "heading": "The Five Characteristics of NATs",
        "body": "1. Automatic — they just pop into your head without conscious effort.\n2. Distorted — they only take into account the negative.\n3. Unhelpful — they keep the vicious cycle of low mood going.\n4. Plausible — they are not questioned because they seem ''true''.\n5. Involuntary — they do not happen through choice and are hard to switch off."
      },
      {
        "heading": "The Cognitive Triad",
        "body": "The ''cognitive triad'' is a focus on negative aspects of: the SELF (''I am stupid and useless''), the WORLD (''others find me lazy and irritable''), and the FUTURE (''tomorrow is bleak and unchangeable''). However, people with ADHD often fundamentally believe they have untapped potential — and this belief is ''food'' for cognitive challenges."
      }
    ],
    "clinician_notes": "Psychoeducation about NATs is particularly important for ADHD clients as their familiarity with such thoughts may be exceptionally strong. People with ADHD are passionate — when they feel low, they feel passionately low. It will take extra practice and guidance to learn to identify NATs."
  }'::jsonb
),

-- ch11_item_04: Worksheet — Typical Thinking Errors of People with ADHD (Table 11.1)
(
  '00000000-0000-4000-a000-000000110004',
  '00000000-0000-4000-8000-000000000011',
  'worksheet',
  'Typical Thinking Errors of People with ADHD (Table 11.1)',
  'Review each type of thinking error below. For each one, rate how often you make this error. Then write your own personal example of a time you caught yourself making this error.',
  50,
  'Table 11.1',
  '{
    "fields": [
      {"id": "error_jumping", "label": "Jumping to Conclusions — Making negative interpretations in the absence of facts. Example: Predicting the future or reading someone''s mind. How often do you do this?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"]},
      {"id": "error_jumping_example", "label": "Your personal example of jumping to conclusions", "type": "textarea", "required": false, "placeholder": "e.g. My manager asked to see me and I was sure I was going to be fired..."},
      {"id": "error_allornone", "label": "All or Nothing — There seems to be no middle ground and everything is ''black'' or ''white''. Example: ''I can''t concentrate at all.'' How often do you do this?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"]},
      {"id": "error_allornone_example", "label": "Your personal example of all-or-nothing thinking", "type": "textarea", "required": false, "placeholder": "e.g. If I can''t do it perfectly, there''s no point doing it at all..."},
      {"id": "error_overgeneralising", "label": "Overgeneralising — Drawing extreme conclusions from a single event. Example: ''I am always tactless and offend people when I speak to them.'' How often do you do this?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"]},
      {"id": "error_overgeneralising_example", "label": "Your personal example of overgeneralising", "type": "textarea", "required": false, "placeholder": "e.g. I said something awkward once and now I think I always ruin conversations..."},
      {"id": "error_catastrophising", "label": "Catastrophising — Exaggerating and overestimating outcomes. Example: ''I have missed a deadline and therefore am going to be sacked.'' How often do you do this?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"]},
      {"id": "error_catastrophising_example", "label": "Your personal example of catastrophising", "type": "textarea", "required": false, "placeholder": "e.g. I missed one bill payment and convinced myself I''d lose my house..."},
      {"id": "error_personalising", "label": "Personalising — Taking the blame for everything that goes wrong, believing everything people do or say is a personal reaction to you. Example: ''It''s all my fault.'' How often do you do this?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"]},
      {"id": "error_personalising_example", "label": "Your personal example of personalising", "type": "textarea", "required": false, "placeholder": "e.g. When my friend cancelled plans, I assumed it was because they don''t like me..."},
      {"id": "error_negative_focus", "label": "Negative Focus — Ignoring or misinterpreting positive aspects due to learned helplessness. Always assuming the worst. Example: ''The glass is half empty rather than half full.'' How often do you do this?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"]},
      {"id": "error_negative_focus_example", "label": "Your personal example of negative focus", "type": "textarea", "required": false, "placeholder": "e.g. I got good feedback on 9 things but could only think about the 1 criticism..."},
      {"id": "error_shoulds", "label": "Shoulds and Oughts — A sense of failure to meet standards or expectations, without considering whether these are reasonable. Example: ''I should always get it right.'' How often do you do this?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"]},
      {"id": "error_shoulds_example", "label": "Your personal example of shoulds and oughts", "type": "textarea", "required": false, "placeholder": "e.g. I should be able to manage my time like everyone else..."},
      {"id": "most_common_error", "label": "Which thinking error do you make most often? Why do you think that is?", "type": "textarea", "required": true}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "The most common thinking error for people with ADHD is jumping to conclusions, which stems from poor impulse control. But everyone has their own pattern. Identifying yours is the first step to catching it in the moment.",
    "clinician_notes": "The categories are not mutually exclusive — there may be more than one error present in a single thought. It does not matter if the client identifies categories perfectly. The point is to get the client to recognise they are making thinking errors so they can stop and evaluate their own thoughts."
  }'::jsonb
),

-- ch11_item_05: Exercise — Thinking Errors Exercise (Table 11.2)
(
  '00000000-0000-4000-a000-000000110005',
  '00000000-0000-4000-8000-000000000011',
  'exercise',
  'Thinking Errors Exercise (Table 11.2)',
  'Read each statement below and try to identify what type of thinking error is being made. This exercise is done jointly with your therapist first, then you can practise identifying thinking errors in your own thoughts.',
  70,
  'Table 11.2',
  '{
    "fields": [
      {"id": "q1_statement", "label": "Statement 1: ''I did that badly and have completely ruined it all.''", "type": "text", "required": false, "placeholder": "(For reference only — do not edit)"},
      {"id": "q1_answer", "label": "What thinking error is this?", "type": "select", "required": true, "options": ["Jumping to conclusions", "All or nothing", "Overgeneralising", "Catastrophising", "Personalising", "Negative focus", "Shoulds and oughts"]},
      {"id": "q2_statement", "label": "Statement 2: ''I upset her by blurting out gossip. I''m a terrible person.''", "type": "text", "required": false, "placeholder": "(For reference only — do not edit)"},
      {"id": "q2_answer", "label": "What thinking error is this?", "type": "select", "required": true, "options": ["Jumping to conclusions", "All or nothing", "Overgeneralising", "Catastrophising", "Personalising", "Negative focus", "Shoulds and oughts"]},
      {"id": "q3_statement", "label": "Statement 3: ''I should have finished everything I planned to do.''", "type": "text", "required": false, "placeholder": "(For reference only — do not edit)"},
      {"id": "q3_answer", "label": "What thinking error is this?", "type": "select", "required": true, "options": ["Jumping to conclusions", "All or nothing", "Overgeneralising", "Catastrophising", "Personalising", "Negative focus", "Shoulds and oughts"]},
      {"id": "q4_statement", "label": "Statement 4: ''Everything goes wrong.''", "type": "text", "required": false, "placeholder": "(For reference only — do not edit)"},
      {"id": "q4_answer", "label": "What thinking error is this?", "type": "select", "required": true, "options": ["Jumping to conclusions", "All or nothing", "Overgeneralising", "Catastrophising", "Personalising", "Negative focus", "Shoulds and oughts"]},
      {"id": "q5_statement", "label": "Statement 5: ''He didn''t shake my hand. I definitely won''t get the job.''", "type": "text", "required": false, "placeholder": "(For reference only — do not edit)"},
      {"id": "q5_answer", "label": "What thinking error is this?", "type": "select", "required": true, "options": ["Jumping to conclusions", "All or nothing", "Overgeneralising", "Catastrophising", "Personalising", "Negative focus", "Shoulds and oughts"]},
      {"id": "q6_statement", "label": "Statement 6: ''She didn''t return my call. All women find me unattractive.''", "type": "text", "required": false, "placeholder": "(For reference only — do not edit)"},
      {"id": "q6_answer", "label": "What thinking error is this?", "type": "select", "required": true, "options": ["Jumping to conclusions", "All or nothing", "Overgeneralising", "Catastrophising", "Personalising", "Negative focus", "Shoulds and oughts"]},
      {"id": "own_example", "label": "Now write one of your own negative thoughts and identify the thinking error", "type": "textarea", "required": false, "placeholder": "e.g. ''My colleague didn''t say hello this morning — she must hate me.'' → Jumping to conclusions"}
    ],
    "scoring": {
      "method": "custom",
      "answer_key": {
        "q1_answer": "Catastrophising",
        "q2_answer": "Personalising",
        "q3_answer": "Shoulds and oughts",
        "q4_answer": "All or nothing",
        "q5_answer": "Jumping to conclusions",
        "q6_answer": "Overgeneralising"
      }
    },
    "instructions_for_patient": "There are no trick questions. If you are not sure, take your best guess — the point is to start noticing thinking errors, not to get perfect scores.",
    "clinician_notes": "Perform this exercise jointly first to teach the client how to identify and evaluate thinking errors. The categories are not mutually exclusive. It does not really matter if the client identifies them correctly — the point is recognition that thinking errors are happening. Once they can spot errors, they are less likely to make them."
  }'::jsonb
),

-- ch11_item_06: Exercise — Challenging Negative Thinking (Table 11.3)
(
  '00000000-0000-4000-a000-000000110006',
  '00000000-0000-4000-8000-000000000011',
  'exercise',
  'Challenging Negative Thinking (Table 11.3)',
  'Use these three questions to challenge your negative thoughts whenever you notice them. Practise this in your session first, then use these questions daily when you catch yourself thinking negatively.',
  70,
  'Table 11.3',
  '{
    "fields": [
      {"id": "negative_thought", "label": "What is the negative thought you want to challenge?", "type": "textarea", "required": true, "placeholder": "e.g. I can''t cope with this..."},
      {"id": "q1_evidence", "label": "Question 1: What is the evidence that you can''t cope? Write down times when you have successfully coped in the past.", "type": "textarea", "required": true, "placeholder": "e.g. Last month I managed to finish the project even though it felt overwhelming at first..."},
      {"id": "q2_friend", "label": "Question 2: Imagine your friend came to you with this problem — what would you tell them? Would you believe there are no solutions?", "type": "textarea", "required": true, "placeholder": "e.g. I would tell my friend that one setback doesn''t define them..."},
      {"id": "q3_worst_case", "label": "Question 3: What is the worst that could happen? Am I overestimating the likelihood of this happening?", "type": "textarea", "required": true, "placeholder": "e.g. The worst case is I need to ask for an extension — which is inconvenient but not a disaster..."},
      {"id": "revised_thought", "label": "After answering these questions, can you revise your original negative thought into something more balanced?", "type": "textarea", "required": true, "placeholder": "e.g. This is difficult, but I can manage if I take it a step at a time..."},
      {"id": "mood_before", "label": "Rate your mood before this exercise (0 = very low, 10 = very good)", "type": "scale", "required": false, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Very low", "5": "Neutral", "10": "Very good"}},
      {"id": "mood_after", "label": "Rate your mood after this exercise (0 = very low, 10 = very good)", "type": "scale", "required": false, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Very low", "5": "Neutral", "10": "Very good"}}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Write these three questions on a card and carry it with you. When you catch a negative thought, pull out the card and work through the questions. You can also use a visual ''stop sign'' image to interrupt automatic negative thinking.",
    "clinician_notes": "ADHD individuals need greater practice and rehearsal due to attentional problems and difficulty grasping concepts. They are more likely to give up impulsively. Make homework very manageable — early failure will reinforce the negative schema. Adaptations: get them to quickly telephone an answerphone to record the thought, or say it into a recording device on their phone."
  }'::jsonb
),

-- ch11_item_07: Exercise — Replacing Negative Thoughts (Table 11.4)
(
  '00000000-0000-4000-a000-000000110007',
  '00000000-0000-4000-8000-000000000011',
  'exercise',
  'Replacing Negative Thoughts (Table 11.4)',
  'This exercise teaches you to counteract a negative thought with a positive self-statement. Divide your thinking into two columns: negative thoughts on one side, positive replacements on the other.',
  70,
  'Table 11.4',
  '{
    "fields": [
      {
        "id": "thought_pairs",
        "label": "For each negative thought, write a positive counter-statement",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "negative_thought", "label": "Negative Thought", "type": "textarea", "placeholder": "e.g. I cannot complete this form — it''s too difficult and long."},
          {"id": "positive_replacement", "label": "Positive Self-Statement", "type": "textarea", "placeholder": "e.g. I have managed to finish many more forms in the past and some were even longer."}
        ],
        "min_items": 3,
        "max_items": 10,
        "prefill_example": {
          "negative_thought": "I cannot complete this form — it''s too difficult and long.",
          "positive_replacement": "I have managed to finish many more forms in the past and some were even longer."
        }
      },
      {"id": "reflection", "label": "When you look at just the positive column, how does it make you feel?", "type": "textarea", "required": false, "placeholder": "Fold the paper to show only the positive side and read through your self-generated positive statements..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Make sure your positive thoughts are specific to that moment — not global or abstract. Once done, fold the page so only the positive column is visible. Keep this list and read through it when you feel low. These are YOUR words, not someone else''s.",
    "clinician_notes": "Ensure positive thoughts are not global abstract statements or schemas but refer to specific moments in time. With careful prompting, ensure positive outcomes far outweigh negative ones. Once ADHD clients learn brainstorming and perspective-taking skills, they tend to quickly adopt them — these techniques tap into their natural creativity and ingenuity."
  }'::jsonb
),

-- ch11_item_08: Worksheet — Examples of Negative Thoughts and Challenges (Table 11.5)
(
  '00000000-0000-4000-a000-000000110008',
  '00000000-0000-4000-8000-000000000011',
  'worksheet',
  'Examples of Negative Thoughts and Challenges (Table 11.5)',
  'Review each common negative thought below and its challenge. Then rate how much you relate to each one and add your own personalised challenge if you can improve on the example given.',
  50,
  'Table 11.5',
  '{
    "fields": [
      {"id": "ex1_relate", "label": "Negative thought: ''I am not as capable as other people.'' Challenge: ''I am not good at everything. Like everybody I am good at some things and not so good at others.'' How much do you relate to this thought? (0-10)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all", "10": "Completely"}},
      {"id": "ex1_own_challenge", "label": "Can you write your own personalised challenge to this thought?", "type": "textarea", "required": false, "placeholder": "Write a challenge in your own words..."},
      {"id": "ex2_relate", "label": "Negative thought: ''There is no way I can complete that task. What is the point in trying?'' Challenge: ''If I don''t try, I won''t know. If I break it down into smaller sections I will be able to complete it. Trying in itself will broaden my experience and skill.'' How much do you relate? (0-10)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all", "10": "Completely"}},
      {"id": "ex2_own_challenge", "label": "Can you write your own personalised challenge to this thought?", "type": "textarea", "required": false},
      {"id": "ex3_relate", "label": "Negative thought: ''I''m bound to miss something out or make a mistake.'' Challenge: ''Everybody makes mistakes, even people without ADHD. I know how to check what I have done for mistakes and I can ask others to help me. Sometimes it is good to make mistakes because that is the best way to learn.'' How much do you relate? (0-10)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all", "10": "Completely"}},
      {"id": "ex3_own_challenge", "label": "Can you write your own personalised challenge to this thought?", "type": "textarea", "required": false},
      {"id": "ex4_relate", "label": "Negative thought: ''I end up talking about rubbish and nobody wants to listen to me.'' Challenge: ''I have opinions, thoughts and feelings. A lot of people find it very difficult to talk in public and I may put them at their ease. I can make sure I talk about things which interest them.'' How much do you relate? (0-10)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all", "10": "Completely"}},
      {"id": "ex4_own_challenge", "label": "Can you write your own personalised challenge to this thought?", "type": "textarea", "required": false},
      {"id": "ex5_relate", "label": "Negative thought: ''Everybody hates me and thinks I''m a moody person.'' Challenge: ''There are people who like me for who I am. Everyone is allowed to have their down moments.'' How much do you relate? (0-10)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all", "10": "Completely"}},
      {"id": "ex5_own_challenge", "label": "Can you write your own personalised challenge to this thought?", "type": "textarea", "required": false},
      {"id": "ex6_relate", "label": "Negative thought: ''People without ADHD are happier than me.'' Challenge: ''I don''t know this for a fact. Some people may be and others may be very unhappy. Just because somebody appears to be in control, doesn''t mean they are more satisfied.'' How much do you relate? (0-10)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all", "10": "Completely"}},
      {"id": "ex6_own_challenge", "label": "Can you write your own personalised challenge to this thought?", "type": "textarea", "required": false},
      {"id": "ex7_relate", "label": "Negative thought: ''It would be best if I avoided people, because I end up being rude and offending people.'' Challenge: ''If I stay away I don''t give myself a chance. There are many more occasions when I get on well with people than occasions when I offend them.'' How much do you relate? (0-10)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all", "10": "Completely"}},
      {"id": "ex7_own_challenge", "label": "Can you write your own personalised challenge to this thought?", "type": "textarea", "required": false},
      {"id": "ex8_relate", "label": "Negative thought: ''My mood swings around so much — I may start crying in front of everyone.'' Challenge: ''It is acceptable to be upset sometimes. When I see others crying, I am understanding and do not think any worse of the person. What is wrong with showing emotion?'' How much do you relate? (0-10)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all", "10": "Completely"}},
      {"id": "ex8_own_challenge", "label": "Can you write your own personalised challenge to this thought?", "type": "textarea", "required": false},
      {"id": "ex9_relate", "label": "Negative thought: ''I''m hopeless at everything and always have been. I''ve been trying all my life to sort myself out and have got nowhere.'' Challenge: ''There are many things that I can do very well. I have made great improvements in many areas of my life and this aspect is not any more important.'' How much do you relate? (0-10)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all", "10": "Completely"}},
      {"id": "ex9_own_challenge", "label": "Can you write your own personalised challenge to this thought?", "type": "textarea", "required": false},
      {"id": "top3", "label": "Which 3 negative thoughts do you relate to most? What does that tell you about your thinking patterns?", "type": "textarea", "required": true}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Be honest about which thoughts you relate to. The ones that score highest are the ones to focus on challenging first. Writing your own personalised challenges is more powerful than using the examples.",
    "clinician_notes": "Use the highest-rated items to guide therapeutic focus. Encourage the client to develop personalised challenges rather than relying on the provided examples. The client''s own words will be more convincing and memorable to them."
  }'::jsonb
),

-- ch11_item_09: Psychoeducation — Understanding Activity Scheduling
(
  '00000000-0000-4000-a000-000000110009',
  '00000000-0000-4000-8000-000000000011',
  'psychoeducation',
  'Understanding Activity Scheduling',
  'Read about how activity scheduling works and why it is particularly effective for people with ADHD who are experiencing low mood.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Why Activity Helps Low Mood",
        "body": "People with ADHD often feel overwhelmed by what seem to be insurmountable problems and therefore give up very early. When motivation is low and the task is not interesting, it can be impossible to know where to start. But activity makes people feel better and more alert, and motivates further activity — the more you do, the more you feel like doing."
      },
      {
        "heading": "The Behaviour-Motivation Lag",
        "body": "Many people wait until they ''feel like'' doing something before they start. This is counterintuitive — starting an activity (even when you don''t want to at first) can make you feel like doing it once you''ve begun. You do not need to feel motivated to start; motivation follows action."
      },
      {
        "heading": "Breaking Tasks into Smaller Steps",
        "body": "An attention deficit means you have difficulty finishing tasks at the best of times, let alone when feeling low. So tasks need to be broken down into smaller stages. Aim to start at a pre-determined point and finish that small section. Over time, you may develop motivation to complete more parts or even the whole task."
      },
      {
        "heading": "The Importance of Rewards",
        "body": "People with ADHD have difficulty with ''delayed gratification'' — you find it hard to wait for a reward. So long periods should not be scheduled between rewards. Completion of tasks must be paired with reward. Rewards that involve activity can be particularly stimulating (e.g. physical exercise) as this helps alleviate restlessness."
      },
      {
        "heading": "Reversing the Vicious Cycle",
        "body": "By being more active, the thoughts-feelings-behaviour cycle can be reversed — using positive behaviour to improve mood. This also increases your sense of control over your life and what you can achieve. The aim is to reduce an insurmountable mass of unstarted or half-finished tasks into a prioritised, manageable list with an end point."
      }
    ],
    "clinician_notes": "Activity scheduling is unlikely to be rejected by ADHD clients as they are generally active people. However, because they can be chaotic and disorganised, using structured plans will be unusual. If they have tried and failed before, this is probably because: (1) they did not break tasks down into sufficiently small steps, or (2) they did not incorporate a reward system."
  }'::jsonb
),

-- ch11_item_10: Worksheet — Making a Task List (Table 11.6)
(
  '00000000-0000-4000-a000-000000110010',
  '00000000-0000-4000-8000-000000000011',
  'worksheet',
  'Making a Task List (Table 11.6)',
  'Categorise everything you need or want to do into three groups: things you MUST do, things you WANT to do, and REWARDS. This is the foundation for your activity plan.',
  50,
  'Table 11.6',
  '{
    "fields": [
      {
        "id": "must_do",
        "label": "1. Tasks that MUST be done (compulsory, important, necessary)",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "task", "label": "Task", "type": "text", "placeholder": "e.g. Grocery shopping, paying bills, picking up kids..."}
        ],
        "min_items": 3,
        "max_items": 12
      },
      {
        "id": "want_to_do",
        "label": "2. Tasks that you WANT to do (desirable but not urgent)",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "task", "label": "Task", "type": "text", "placeholder": "e.g. Watch a film, meet a friend, finish reading a book..."}
        ],
        "min_items": 2,
        "max_items": 10
      },
      {
        "id": "rewards",
        "label": "3. Rewards (things that give you pleasure and lift your mood)",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "reward", "label": "Reward", "type": "text", "placeholder": "e.g. Going for a run, reading a magazine, watching TV, having a bath..."}
        ],
        "min_items": 3,
        "max_items": 12
      },
      {"id": "reward_difficulty", "label": "If you found it hard to think of rewards, what activities or treats used to give you pleasure in the past?", "type": "textarea", "required": false, "placeholder": "Think about things you would suggest to a friend who needed cheering up..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Include small rewards as well as large ones. A reward could be taking a bath, watching a show, going for a walk, listening to music, having a piece of cake — there are endless possibilities. If you feel too low to think of rewards, imagine what you would suggest to a friend.",
    "clinician_notes": "If the client is very depressed, their avoidance of tasks or social withdrawal may feel like a ''reward'' — guide them to select rewards that act as positive reinforcers instead. Ensure the rewards list includes both small quick rewards (for between tasks) and larger rewards (for end of day). Identify rewards involving physical activity as these help with restlessness."
  }'::jsonb
),

-- ch11_item_11: Worksheet — Task List for Activity Scheduling (Table 11.7)
(
  '00000000-0000-4000-a000-000000110011',
  '00000000-0000-4000-8000-000000000011',
  'worksheet',
  'Task List for Activity Scheduling (Table 11.7)',
  'Now break down your tasks from the previous exercise into specific, concrete actions. Some tasks from your ''must do'' list may need to be split into multiple smaller steps. Add time estimates to each.',
  50,
  'Table 11.7',
  '{
    "fields": [
      {
        "id": "must_do_detailed",
        "label": "Tasks you MUST do — broken down into specific actions",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "task", "label": "Specific task or sub-task", "type": "text", "placeholder": "e.g. Phone the bank, vacuum the living room..."},
          {"id": "time_estimate", "label": "Estimated time", "type": "text", "placeholder": "e.g. 30 mins"}
        ],
        "min_items": 5,
        "max_items": 20
      },
      {
        "id": "want_to_do_detailed",
        "label": "Tasks you WANT to do — with time estimates",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "task", "label": "Task", "type": "text", "placeholder": "e.g. Go to the cinema, visit a friend..."},
          {"id": "time_estimate", "label": "Estimated time", "type": "text", "placeholder": "e.g. 2 hours"}
        ],
        "min_items": 2,
        "max_items": 10
      },
      {
        "id": "rewards_detailed",
        "label": "Rewards — with time needed",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "reward", "label": "Reward", "type": "text", "placeholder": "e.g. Go for a run, read the newspaper..."},
          {"id": "time_estimate", "label": "Time needed", "type": "text", "placeholder": "e.g. 30 mins"},
          {"id": "size", "label": "Size of reward", "type": "select", "options": ["Small (5-15 min break)", "Medium (30-60 min activity)", "Large (evening reward)"]}
        ],
        "min_items": 3,
        "max_items": 10
      },
      {"id": "concentration_span", "label": "How long can you typically concentrate before needing a break?", "type": "select", "required": true, "options": ["15 minutes", "30 minutes", "45 minutes", "1 hour", "1.5 hours", "2 hours", "More than 2 hours"]}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Some items from your earlier task list may need to be broken into sub-tasks. For example, ''household chores'' becomes: vacuuming, tidying up, washing, ironing. Some tasks may require phone calls or travel — list these separately. Your concentration span answer will help determine how to space breaks in your diary plan.",
    "clinician_notes": "Help the client break down vague tasks into concrete actions. Ensure they identify which tasks require phone calls, travel, or preparation steps. The concentration span estimate will be used to structure the Diary Activity Plan. This may need to be determined by trial and error."
  }'::jsonb
),

-- ch11_item_12: Diary — Diary Activity Plan (Table 11.8)
(
  '00000000-0000-4000-a000-000000110012',
  '00000000-0000-4000-8000-000000000011',
  'diary',
  'Diary Activity Plan (Table 11.8)',
  'Using your task list, plan out your week hour by hour. Schedule ''must do'' tasks, ''want to do'' tasks, rewards, and regular breaks. Your therapist will help you with the first plan.',
  60,
  'Table 11.8',
  '{
    "fields": [
      {"id": "week_beginning", "label": "Week beginning", "type": "date", "required": true},
      {
        "id": "monday",
        "label": "Monday",
        "type": "repeating_group",
        "required": false,
        "sub_fields": [
          {"id": "time_slot", "label": "Time slot", "type": "text", "placeholder": "e.g. 9-10am"},
          {"id": "planned_activity", "label": "Planned activity", "type": "text", "placeholder": "e.g. Work on report"},
          {"id": "is_reward", "label": "Is this a break/reward?", "type": "select", "options": ["Task", "Break", "Reward"]},
          {"id": "completed", "label": "Done?", "type": "select", "options": ["Yes", "Partially", "No", "Not yet"]},
          {"id": "notes", "label": "Notes (what went wrong/right?)", "type": "text", "required": false}
        ],
        "min_items": 1,
        "max_items": 12
      },
      {
        "id": "tuesday",
        "label": "Tuesday",
        "type": "repeating_group",
        "required": false,
        "sub_fields": [
          {"id": "time_slot", "label": "Time slot", "type": "text", "placeholder": "e.g. 9-10am"},
          {"id": "planned_activity", "label": "Planned activity", "type": "text"},
          {"id": "is_reward", "label": "Is this a break/reward?", "type": "select", "options": ["Task", "Break", "Reward"]},
          {"id": "completed", "label": "Done?", "type": "select", "options": ["Yes", "Partially", "No", "Not yet"]},
          {"id": "notes", "label": "Notes", "type": "text", "required": false}
        ],
        "min_items": 1,
        "max_items": 12
      },
      {
        "id": "wednesday",
        "label": "Wednesday",
        "type": "repeating_group",
        "required": false,
        "sub_fields": [
          {"id": "time_slot", "label": "Time slot", "type": "text", "placeholder": "e.g. 9-10am"},
          {"id": "planned_activity", "label": "Planned activity", "type": "text"},
          {"id": "is_reward", "label": "Is this a break/reward?", "type": "select", "options": ["Task", "Break", "Reward"]},
          {"id": "completed", "label": "Done?", "type": "select", "options": ["Yes", "Partially", "No", "Not yet"]},
          {"id": "notes", "label": "Notes", "type": "text", "required": false}
        ],
        "min_items": 1,
        "max_items": 12
      },
      {
        "id": "thursday",
        "label": "Thursday",
        "type": "repeating_group",
        "required": false,
        "sub_fields": [
          {"id": "time_slot", "label": "Time slot", "type": "text", "placeholder": "e.g. 9-10am"},
          {"id": "planned_activity", "label": "Planned activity", "type": "text"},
          {"id": "is_reward", "label": "Is this a break/reward?", "type": "select", "options": ["Task", "Break", "Reward"]},
          {"id": "completed", "label": "Done?", "type": "select", "options": ["Yes", "Partially", "No", "Not yet"]},
          {"id": "notes", "label": "Notes", "type": "text", "required": false}
        ],
        "min_items": 1,
        "max_items": 12
      },
      {
        "id": "friday",
        "label": "Friday",
        "type": "repeating_group",
        "required": false,
        "sub_fields": [
          {"id": "time_slot", "label": "Time slot", "type": "text", "placeholder": "e.g. 9-10am"},
          {"id": "planned_activity", "label": "Planned activity", "type": "text"},
          {"id": "is_reward", "label": "Is this a break/reward?", "type": "select", "options": ["Task", "Break", "Reward"]},
          {"id": "completed", "label": "Done?", "type": "select", "options": ["Yes", "Partially", "No", "Not yet"]},
          {"id": "notes", "label": "Notes", "type": "text", "required": false}
        ],
        "min_items": 1,
        "max_items": 12
      },
      {
        "id": "saturday",
        "label": "Saturday",
        "type": "repeating_group",
        "required": false,
        "sub_fields": [
          {"id": "time_slot", "label": "Time slot", "type": "text", "placeholder": "e.g. 9-10am"},
          {"id": "planned_activity", "label": "Planned activity", "type": "text"},
          {"id": "is_reward", "label": "Is this a break/reward?", "type": "select", "options": ["Task", "Break", "Reward"]},
          {"id": "completed", "label": "Done?", "type": "select", "options": ["Yes", "Partially", "No", "Not yet"]},
          {"id": "notes", "label": "Notes", "type": "text", "required": false}
        ],
        "min_items": 1,
        "max_items": 12
      },
      {
        "id": "sunday",
        "label": "Sunday",
        "type": "repeating_group",
        "required": false,
        "sub_fields": [
          {"id": "time_slot", "label": "Time slot", "type": "text", "placeholder": "e.g. 9-10am"},
          {"id": "planned_activity", "label": "Planned activity", "type": "text"},
          {"id": "is_reward", "label": "Is this a break/reward?", "type": "select", "options": ["Task", "Break", "Reward"]},
          {"id": "completed", "label": "Done?", "type": "select", "options": ["Yes", "Partially", "No", "Not yet"]},
          {"id": "notes", "label": "Notes", "type": "text", "required": false}
        ],
        "min_items": 1,
        "max_items": 12
      },
      {"id": "weekly_review_achieved", "label": "End-of-week review: What did you manage to achieve this week?", "type": "textarea", "required": false, "placeholder": "Focus on what you DID do, not what you didn''t..."},
      {"id": "weekly_review_adjustments", "label": "What adjustments do you need to make for next week? (e.g. Was the morning or afternoon harder? Did you overestimate or underestimate task times?)", "type": "textarea", "required": false, "placeholder": "e.g. I stuck to the plan in the morning but lost focus after lunch..."},
      {"id": "weekly_review_mood", "label": "Overall, did being more active this week affect your mood?", "type": "scale", "required": false, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Mood much worse", "5": "No change", "10": "Mood much better"}}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Avoid the temptation of scheduling too much in one go. Schedule activities in small amounts so they become manageable. Include regular breaks determined by your concentration span. Do not schedule long periods between rewards. Tick off or highlight completed tasks — seeing your achievement visually is rewarding in itself. Focus on what you managed to do, not what you didn''t.",
    "clinician_notes": "Review what was achieved at the end of each week. If the plan was not adhered to, identify what went wrong and at what time. If the client managed mornings but not afternoons, adapt by starting the afternoon with a desirable activity. In initial stages, schedule very short tasks into longer periods to maximise likelihood of success. Ensure the schedule is not all reward for little achievement, but also not all chores with no pleasure. Match rewards to task demand — frequent short breaks for high-concentration tasks, larger rewards for completing big items."
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
