-- 11_seed_module_13.sql
-- Seed content items for Module 13 (Substance Misuse) into yb_content_items
-- Safe to re-run: uses ON CONFLICT DO UPDATE
--
-- Module 13 UUID: 00000000-0000-4000-8000-000000000013  (from 01_seed_modules.sql)
-- Content item UUIDs: 00000000-0000-4000-a000-000000130001 through ...130020

INSERT INTO yb_content_items (id, module_id, type, title, instructions, xp_value, companion_website_ref, schema)
VALUES

-- ch13_item_01: Psychoeducation — Substance Misuse and ADHD: Understanding the Connection
(
  '00000000-0000-4000-a000-000000130001',
  '00000000-0000-4000-8000-000000000013',
  'psychoeducation',
  'Substance Misuse and ADHD: Understanding the Connection',
  'Read through this material to understand why substance misuse is more common in adults with ADHD and how it creates a vicious cycle.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Why Substance Misuse Is More Common in ADHD",
        "body": "People with ADHD often experience a different route into substance misuse than others. Use or abuse of substances — including nicotine, alcohol, cannabis, amphetamines and cocaine — is more common in adults with ADHD because they may have been self-medicating their symptoms. For example, nicotine is a dopamine agonist that can have a similar effect to psychostimulant medication, improving ADHD symptoms. Alcohol and cannabis tend to be used to dampen feelings of agitation and help the person feel calmer."
      },
      {
        "heading": "The Vicious Cycle (Figure 13.1)",
        "body": "People who become addicted to substances find themselves going through a vicious cycle: anxiety or low mood exacerbates ADHD symptoms, which increases the risk that a person will use substances to bring temporary relief. In turn, increasing substance use may lead to financial, social, and medical problems. Such problems can overwhelm an individual who lacks adaptive coping strategies, causing further anxiety and low mood — which worsens ADHD symptoms and drives the cycle again."
      },
      {
        "heading": "Self-Medication vs. Prescribed Treatment",
        "body": "Some individuals with ADHD report having used street stimulants regularly for years before their diagnosis. Studies have suggested that treatment with prescribed stimulant medication for ADHD does not increase the likelihood of later substance misuse. If you have concerns about medication and addiction, discuss this openly with your psychiatrist."
      },
      {
        "heading": "Important Note",
        "body": "In cases of serious drug misuse or dependency, specialist rehabilitation treatment should be completed before commencing psychological treatment for ADHD. This module provides a brief intervention for individuals with intermittent substance use, not a comprehensive detox programme."
      }
    ],
    "clinician_notes": "Screen for past and current history of substance misuse during initial assessment. For patients with serious dependency, refer to specialist services before beginning YB Programme treatment. This module uses psychoeducation and motivational interviewing techniques suitable for intermittent users."
  }'::jsonb
),

-- ch13_item_02: Psychoeducation — Substances Commonly Used by Adults with ADHD
(
  '00000000-0000-4000-a000-000000130002',
  '00000000-0000-4000-8000-000000000013',
  'psychoeducation',
  'Substances Commonly Used by Adults with ADHD',
  'Read about the different substances commonly used by people with ADHD, why they use them, and the associated risks. This knowledge will help you understand your own patterns.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Nicotine",
        "body": "Nicotine is one of the most addictive substances. It is a cerebral stimulant that provides some ADHD symptom relief through its impact on the dopamine system. Many individuals with ADHD smoke over 20 cigarettes per day and find it extremely difficult to give up. Long-term health risks include cancer, lung disease, and heart disease. ADHD-specific risks include fire hazards from forgetting about lit cigarettes or leaving matches within reach of children."
      },
      {
        "heading": "Alcohol",
        "body": "Alcohol is the most commonly misused drug in the world. People with ADHD may use alcohol to calm themselves, reduce agitation and restlessness, or overcome social inhibitions. However, due to poor impulse control, they may drink quickly and to excess. When intoxicated, mood regulation worsens, increasing risk-taking behaviour. Heavy alcohol use exacerbates cognitive deficits associated with ADHD, particularly executive dysfunction and poor memory."
      },
      {
        "heading": "Tranquilizers",
        "body": "Like alcohol, tranquilizers are often used for their sedative effects. Benzodiazepines are readily available and highly addictive. ADHD individuals with sleep difficulties may be prescribed tranquilising medication. Psychological treatments for sleep problems (see Module 12) should be explored as alternatives."
      },
      {
        "heading": "Cannabis",
        "body": "Cannabis is often the illegal drug of choice. People with ADHD report it ''takes the edge'' off symptoms, particularly restlessness. They may smoke small amounts throughout the day to maintain functioning. However, the major disadvantage is that cannabis exacerbates existing ADHD cognitive deficits — it has an adverse effect on attention, working memory, and time estimation. Excessive use may induce paranoia."
      },
      {
        "heading": "Stimulants (Amphetamines, Cocaine, Crack)",
        "body": "Lower doses may ''normalise'' behaviour in people with ADHD by improving attention and reducing impulse control difficulties. However, high doses can cause anxiety, irritability, and paranoia. Street stimulants are highly addictive with rapid dependency. Withdrawal causes agitation and cravings that are especially problematic combined with ADHD impulsivity."
      },
      {
        "heading": "Hallucinogens (Ecstasy, LSD)",
        "body": "These may attract ADHD individuals through sensation seeking. Ecstasy creates euphoria and reduced need for sleep but carries risks of dehydration, depression, and rapid tolerance. LSD creates visual distortion and time disturbance but can trigger panic attacks and later flashbacks."
      },
      {
        "heading": "Opiates (Heroin, Methadone, Codeine)",
        "body": "Regular use leads to high tolerance and dependency. Withdrawal combined with ADHD impulsivity may increase risk of opportunistic theft and violence. If dependency is present, detoxification must be completed — and the person drug-free for at least six months — before psychological ADHD treatment can begin."
      }
    ],
    "clinician_notes": "Use this psychoeducation to identify which substances the client uses and open a non-judgemental discussion about their motivations. Ask which descriptions resonate with their experience. This sets up the assessment worksheets that follow."
  }'::jsonb
),

-- ch13_item_03: Psychoeducation — The Five Stages of Substance Use (Table 13.1)
(
  '00000000-0000-4000-a000-000000130003',
  '00000000-0000-4000-8000-000000000013',
  'psychoeducation',
  'The Five Stages of Substance Use (Table 13.1)',
  'Read about the five stages of substance use to understand how drug and alcohol use can progress over time. Think about which stage best describes your current use of each substance.',
  20,
  'Table 13.1',
  '{
    "content_blocks": [
      {
        "heading": "Stage 1: Experimental",
        "body": "Motivated by curiosity, pleasure seeking, risk taking, sensation seeking, and poor impulse control. People with ADHD are unlikely to consider the risks because they do not think about potential consequences."
      },
      {
        "heading": "Stage 2: Social",
        "body": "Motivated by the need to be liked, peer group influence, social attitudes, and availability. Particularly relevant for ADHD individuals who may see substance use as a way to make friends and be accepted — a position they may have long aspired to."
      },
      {
        "heading": "Stage 3: Instrumental",
        "body": "Used purposefully to create certain behaviours such as seeking ''highs'' or coping with stress and negative feelings. The drug provides positive reinforcement — the person feels rewarded by the experience. For ADHD individuals, the reinforcement may be improved concentration or social skills."
      },
      {
        "heading": "Stage 4: Habitual",
        "body": "The ''need'' to use becomes more regular and frequent. This can be costly, and for some individuals may trigger criminal behaviour to fund the habit. Daily use to fulfill routine functions signals this stage."
      },
      {
        "heading": "Stage 5: Dependent",
        "body": "The substance is constantly ''needed'' and misuse is regarded as ''normal'' despite negative consequences. Physiological tolerance means increasing doses are needed for the same effect. Withdrawal causes undesired effects. Short-term benefits are replaced by an increasingly greater need for the drug."
      }
    ],
    "clinician_notes": "Present these stages without judgement. Help the client identify where they sit for each substance they use. Individuals may be at different stages for different substances — this is explored in the next worksheet (Table 13.3)."
  }'::jsonb
),

-- ch13_item_04: Worksheet — Problems Associated with Substance Misuse (Table 13.2)
(
  '00000000-0000-4000-a000-000000130004',
  '00000000-0000-4000-8000-000000000013',
  'worksheet',
  'Problems Associated with Substance Misuse (Table 13.2)',
  'For each item below, indicate whether you experience this problem as a result of your substance use. Be honest — endorsed items will be used as a basis for further discussion in your sessions.',
  50,
  'Table 13.2',
  '{
    "fields": [
      {"id": "substance_name", "label": "Which substance are you evaluating?", "type": "text", "required": true, "placeholder": "e.g. Alcohol, Cannabis, Nicotine..."},
      {"id": "q1", "label": "Engage in verbally aggressive behaviour", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q2", "label": "Engage in physically aggressive or violent behaviour", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q3", "label": "Often feel irritable", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q4", "label": "Often feel temperamental", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q5", "label": "Often feel frustrated", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q6", "label": "Feel depressed or unhappy", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q7", "label": "Feel anxious", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q8", "label": "Feel inadequate", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q9", "label": "Lack self-control", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q10", "label": "Have difficulty communicating with people (feel people misunderstand you)", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q11", "label": "Fall out with people", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q12", "label": "Not look after yourself well (personal hygiene, pride in appearance)", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q13", "label": "Engage in delinquent and/or criminal behaviour", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q14", "label": "Have difficulty studying or working", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q15", "label": "Engage in unsafe sex", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q16", "label": "Self-harm (ideas or behaviour)", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q17", "label": "Have greater concentration problems", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q18", "label": "Have greater memory problems", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q19", "label": "Lack motivation to do anything", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q20", "label": "Have loss of appetite", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q21", "label": "Have feelings of paranoia", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q22", "label": "Have unusual experiences (e.g. visual hallucinations, flashbacks)", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q23", "label": "Engage in reckless or risky behaviour", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q24", "label": "Experience employment problems", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q25", "label": "Lack confidence", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "q26", "label": "Feel dissatisfied with life", "type": "select", "required": true, "options": ["Yes", "No"]}
    ],
    "scoring": {
      "method": "sum",
      "score_mapping": {"Yes": 1, "No": 0},
      "max_score": 26,
      "interpretation": {
        "0-8": "Relatively few problems linked to substance use. Focus on the specific areas you endorsed.",
        "9-17": "Moderate level of problems. Substance use is significantly affecting multiple areas of your life.",
        "18-26": "High level of problems. Substance use is having a serious impact across many life domains. Prioritise this in treatment."
      }
    },
    "instructions_for_patient": "Answer honestly for the substance you use most. You can repeat this worksheet for each substance you use.",
    "clinician_notes": "Use endorsed items as a basis for further discussion and exploration. If self-harm is endorsed, conduct a risk assessment immediately. A high total score indicates the need for more intensive intervention. The checklist can be repeated for multiple substances."
  }'::jsonb
),

-- ch13_item_05: Worksheet — Substance, Stage and Motivation (Table 13.3)
(
  '00000000-0000-4000-a000-000000130005',
  '00000000-0000-4000-8000-000000000013',
  'worksheet',
  'Substance, Stage and Motivation (Table 13.3)',
  'List every substance you currently use (including nicotine and alcohol). For each one, identify your stage of use (Experimental, Social, Instrumental, Habitual, or Dependent), why you use it, and the consequences you experience.',
  50,
  'Table 13.3',
  '{
    "fields": [
      {
        "id": "substances",
        "label": "For each substance you use, fill in the details below",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "substance", "label": "Substance", "type": "text", "placeholder": "e.g. Alcohol, Nicotine, Cannabis..."},
          {"id": "stage", "label": "Stage of use", "type": "select", "options": ["Experimental", "Social", "Instrumental", "Habitual", "Dependent"]},
          {"id": "reason", "label": "Reason for use", "type": "textarea", "placeholder": "Why do you use this substance? What does it do for you?"},
          {"id": "consequence", "label": "Consequence of use", "type": "textarea", "placeholder": "What negative effects does it cause?"}
        ],
        "min_items": 1,
        "max_items": 10
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Include all substances you use, even those that feel harmless. You may be at different stages for different substances — that is normal.",
    "clinician_notes": "This is a critical assessment tool. It teases apart the function each substance serves, which informs treatment priorities. Substances at the habitual or dependent stage require the most intensive intervention. Use this table to guide which substances to focus on first."
  }'::jsonb
),

-- ch13_item_06: Exercise — Risk Domain Exercise (Table 13.4)
(
  '00000000-0000-4000-a000-000000130006',
  '00000000-0000-4000-8000-000000000013',
  'exercise',
  'Risk Domain Exercise (Table 13.4)',
  'Imagine two people: one is a dependent substance user, and the other is a successful person who does not use substances. Rate how likely each person is to experience the problems listed below on a scale of 0 to 4. Then compare the totals and reflect on what they tell you.',
  70,
  'Table 13.4',
  '{
    "fields": [
      {
        "id": "risk_domains",
        "label": "Rate each person on a scale of 0 (not at all likely) to 4 (highly likely)",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "domain", "label": "Risk domain", "type": "text"},
          {"id": "user_rating", "label": "Substance user (0-4)", "type": "scale", "scale_min": 0, "scale_max": 4, "scale_labels": {"0": "Not at all likely", "4": "Highly likely"}},
          {"id": "nonuser_rating", "label": "Non-substance user (0-4)", "type": "scale", "scale_min": 0, "scale_max": 4, "scale_labels": {"0": "Not at all likely", "4": "Highly likely"}}
        ],
        "prefill_items": [
          "Engage in verbally aggressive behaviour",
          "Engage in physically aggressive or violent behaviour",
          "Often feel irritable",
          "Often feel temperamental",
          "Often feel frustrated",
          "Feel depressed/unhappy",
          "Feel anxious",
          "Feel inadequate",
          "Lack self-control",
          "Have difficulty communicating with people",
          "Fall out with people",
          "Not look after self well",
          "Engage in delinquent and/or criminal behaviour",
          "Have difficulty studying or working",
          "Engage in unsafe sex",
          "Self-harm (ideas or behaviour)",
          "Have greater concentration problems",
          "Have greater memory problems",
          "Lack motivation to do anything",
          "Have loss of appetite",
          "Have feelings of paranoia",
          "Have unusual experiences (e.g. hallucinations, flashbacks)",
          "Engage in reckless or risky behaviour"
        ],
        "min_items": 23,
        "max_items": 23
      },
      {"id": "user_total", "label": "Total problem score for substance user", "type": "number", "required": true},
      {"id": "nonuser_total", "label": "Total problem score for non-substance user", "type": "number", "required": true},
      {"id": "reflection", "label": "Look at the ratings for each person. What does it tell you? Who would you rather be?", "type": "textarea", "required": true}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Be honest with your ratings. The bigger the gap between the two totals, the clearer the message about the impact of substance use. This is not about judgement — it is about seeing the situation clearly.",
    "clinician_notes": "This exercise externalises the problem by asking the client to rate imagined people rather than themselves directly. The gap between totals is a powerful motivational tool. Use the client''s reflection to build motivation for change. Refer back to this exercise during imagery work later in the module."
  }'::jsonb
),

-- ch13_item_07: Psychoeducation — Motivational Interviewing and the Stages of Change
(
  '00000000-0000-4000-a000-000000130007',
  '00000000-0000-4000-8000-000000000013',
  'psychoeducation',
  'Motivational Interviewing and the Stages of Change',
  'Read about the process of change and where you might be in that journey. Understanding these stages will help you and your therapist plan your next steps.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Change as a Journey",
        "body": "Encouraging change involves acknowledging dissatisfaction with aspects of your life and accepting that alternative possibilities are achievable. Think of change as a journey that requires organisation and preparation. The goal is a better quality of life."
      },
      {
        "heading": "The Transtheoretical Model of Change",
        "body": "Research shows that people with substance misuse problems move through a series of five stages: Pre-contemplation, Contemplation, Preparation (Determination), Action, and Maintenance. People may oscillate between stages — this is normal. Most people experience slips or relapses and have to go through the cycle again before successfully maintaining change."
      },
      {
        "heading": "Why Change Is Especially Hard with ADHD",
        "body": "For people with ADHD, it can be particularly difficult to move from pre-contemplation to contemplation because this involves a process of self-reflection — and racing thoughts can make it hard to stop and consider your situation. Poor impulse control adds another barrier. Being able to stop misusing substances takes time, courage, and motivation. It requires support from family, friends, and your therapist."
      }
    ],
    "clinician_notes": "Motivational interviewing is designed to help clients explore and resolve ambivalence to change. It is particularly useful for those in the contemplation stage. Engage the client in an empathetically supportive but strategically directed conversation. Expect clients to oscillate between stages — do not interpret this as failure."
  }'::jsonb
),

-- ch13_item_08: Worksheet — Five Stages of Seeking Help (Table 13.5)
(
  '00000000-0000-4000-a000-000000130008',
  '00000000-0000-4000-8000-000000000013',
  'worksheet',
  'Five Stages of Seeking Help (Table 13.5)',
  'Read through the five stages below. For each stage, reflect on whether you recognise yourself. Mark which stage you think you are currently at for each substance you use.',
  50,
  'Table 13.5',
  '{
    "fields": [
      {
        "id": "stage1_precontemplative",
        "label": "Stage 1 — Pre-contemplative: ''I do not have a problem.'' The problem is not acknowledged; using feels more important than any problems it causes. Do you recognise this?",
        "type": "select",
        "required": true,
        "options": ["This is where I am now", "I have been here before but moved past it", "I have never been in this stage"]
      },
      {
        "id": "stage2_contemplative",
        "label": "Stage 2 — Contemplative: ''I know I have a problem but I am not sure I can change.'' You begin to acknowledge the problem but find reasons to justify continued use. This stage is characterised by ambivalence. Do you recognise this?",
        "type": "select",
        "required": true,
        "options": ["This is where I am now", "I have been here before but moved past it", "I have never been in this stage"]
      },
      {
        "id": "stage3_determination",
        "label": "Stage 3 — Determination: ''I have decided to change but I am not sure how.'' You have made a decision to change but may be uncertain about how to follow through. Do you recognise this?",
        "type": "select",
        "required": true,
        "options": ["This is where I am now", "I have been here before but moved past it", "I have never been in this stage"]
      },
      {
        "id": "stage4_action",
        "label": "Stage 4 — Action: ''I am actively stopping.'' You stop substance misuse and exhibit a change in your belief system. You begin to modify the problem behaviour. Do you recognise this?",
        "type": "select",
        "required": true,
        "options": ["This is where I am now", "I have been here before but moved past it", "I have never been in this stage"]
      },
      {
        "id": "stage5_maintenance",
        "label": "Stage 5 — Maintenance: ''I have stopped and I am working to stay stopped.'' You are actively working to continue avoiding substance use over months and years. Do you recognise this?",
        "type": "select",
        "required": true,
        "options": ["This is where I am now", "I have been here before but moved past it", "I have never been in this stage"]
      },
      {
        "id": "stuck_stage",
        "label": "Which stage do you tend to get ''stuck'' in? What prevents you from moving forward?",
        "type": "textarea",
        "required": true,
        "placeholder": "Describe where you get stuck and what holds you back..."
      },
      {
        "id": "current_substances",
        "label": "For each substance, which stage are you at right now?",
        "type": "repeating_group",
        "required": false,
        "sub_fields": [
          {"id": "substance", "label": "Substance", "type": "text"},
          {"id": "current_stage", "label": "Current stage (1-5)", "type": "scale", "scale_min": 1, "scale_max": 5, "scale_labels": {"1": "Pre-contemplative", "2": "Contemplative", "3": "Determination", "4": "Action", "5": "Maintenance"}}
        ],
        "min_items": 1,
        "max_items": 8
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "There is no wrong answer. Most people oscillate between stages for some time before making lasting change. Knowing where you are helps us plan the right next step.",
    "clinician_notes": "Use this to determine obstacles to progression. Clients in the pre-contemplative stage need more psychoeducation; those in contemplation need help tipping the balance towards change; those in determination need concrete action plans. Expect cycling between stages — frame this as normal, not failure."
  }'::jsonb
),

-- ch13_item_09: Worksheet — The Problem of Change (Table 13.6)
(
  '00000000-0000-4000-a000-000000130009',
  '00000000-0000-4000-8000-000000000013',
  'worksheet',
  'The Problem of Change (Table 13.6)',
  'Work through this worksheet to identify why you want to stop, what your goals are, what actions you will take, who can help, what obstacles you might face, and how you will know your plan is working.',
  50,
  'Table 13.6',
  '{
    "fields": [
      {
        "id": "why_stop",
        "label": "Why do you want to stop? I want to stop using because:",
        "type": "textarea",
        "required": true,
        "placeholder": "List your reasons for wanting to stop..."
      },
      {
        "id": "main_goals",
        "label": "What do you want? My main goals for making this change are:",
        "type": "textarea",
        "required": true,
        "placeholder": "What do you want to achieve by stopping?"
      },
      {
        "id": "action_plan",
        "label": "What can you do about it? Actions I plan to take:",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "action", "label": "Action", "type": "text", "placeholder": "e.g. Register with local estate agents"},
          {"id": "when", "label": "When?", "type": "text", "placeholder": "e.g. Saturday"}
        ],
        "min_items": 2,
        "max_items": 10
      },
      {
        "id": "support_people",
        "label": "Who can you get to help you? Other people who could help me with change:",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "person", "label": "Person", "type": "text", "placeholder": "e.g. Mum, Partner, Friend..."},
          {"id": "how_help", "label": "Possible ways they can help", "type": "textarea", "placeholder": "e.g. Doing things together away from places where there are drugs"}
        ],
        "min_items": 1,
        "max_items": 8
      },
      {
        "id": "obstacles",
        "label": "What might stop you succeeding? Possible obstacles to change:",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "obstacle", "label": "Possible obstacle", "type": "text", "placeholder": "e.g. Going to a party where there are drugs"},
          {"id": "response", "label": "How to respond", "type": "textarea", "placeholder": "e.g. Leave. Tell a friend how I feel."}
        ],
        "min_items": 1,
        "max_items": 8
      },
      {
        "id": "success_signs",
        "label": "I will know that my plan is working when I see these results:",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. No rent arrears, better relationship, manage my money..."
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Complete this with your therapist. Break down goals into smaller achievable steps. Think about not just what you will do, but how you will do it without using alcohol or drugs.",
    "clinician_notes": "Work with the client to improve self-efficacy and raise self-esteem. Determine social support structures, including undesirable ones. Identify realistic obstacles and concrete responses. Refer to Chapter 11 for goal-setting techniques. The substance-misusing client must determine how to achieve goals without substances."
  }'::jsonb
),

-- ch13_item_10: Worksheet — Decisional Balance Sheet (Table 13.7)
(
  '00000000-0000-4000-a000-000000130010',
  '00000000-0000-4000-8000-000000000013',
  'worksheet',
  'Decisional Balance Sheet (Table 13.7)',
  'For the substance you most want to address, list the benefits and costs of continuing to use it, and the benefits and costs of giving it up. This helps you see the full picture clearly.',
  50,
  'Table 13.7',
  '{
    "fields": [
      {"id": "substance_name", "label": "Which substance are you evaluating?", "type": "text", "required": true, "placeholder": "e.g. Amphetamines, Alcohol, Cannabis..."},
      {
        "id": "continue_benefits",
        "label": "Benefits of continuing to use this substance",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "benefit", "label": "Benefit", "type": "text", "placeholder": "e.g. It makes me feel relaxed"}
        ],
        "min_items": 1,
        "max_items": 10
      },
      {
        "id": "continue_costs",
        "label": "Costs of continuing to use this substance",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "cost", "label": "Cost", "type": "text", "placeholder": "e.g. I feel uptight and anxious afterwards"}
        ],
        "min_items": 1,
        "max_items": 10
      },
      {
        "id": "change_benefits",
        "label": "Benefits of making a change and giving up this substance",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "benefit", "label": "Benefit", "type": "text", "placeholder": "e.g. I will save money"}
        ],
        "min_items": 1,
        "max_items": 10
      },
      {
        "id": "change_costs",
        "label": "Costs of making a change and giving up this substance",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "cost", "label": "Cost", "type": "text", "placeholder": "e.g. I might lose certain friends"}
        ],
        "min_items": 1,
        "max_items": 10
      },
      {
        "id": "reflection",
        "label": "Looking at the full picture — what stands out to you?",
        "type": "textarea",
        "required": true,
        "placeholder": "Which side has more items? Which items feel most important?"
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Think carefully about the impact on your health, personal functioning, relationships, ability to study or work, and behaviour. The therapist will help ensure you recognise that costs often outweigh benefits.",
    "clinician_notes": "Guide the client to recognise that costs often outweigh benefits. If the client insists on emphasising positives, move to the weighted version (Table 13.8). Repetition of advantages for change is an important positive reinforcer. This technique may seem repetitive but serves a therapeutic purpose."
  }'::jsonb
),

-- ch13_item_11: Worksheet — Weighted Advantages and Disadvantages (Table 13.8)
(
  '00000000-0000-4000-a000-000000130011',
  '00000000-0000-4000-8000-000000000013',
  'worksheet',
  'Weighted Advantages and Disadvantages (Table 13.8)',
  'If your decisional balance sheet felt unclear, this weighted version adds importance scores. For each benefit and cost you listed, rate its importance from 0 (not important at all) to 5 (extremely important). Then compare the total weighted scores.',
  50,
  'Table 13.8',
  '{
    "fields": [
      {"id": "substance_name", "label": "Which substance are you evaluating?", "type": "text", "required": true, "placeholder": "e.g. Amphetamines, Alcohol, Cannabis..."},
      {
        "id": "continue_benefits_weighted",
        "label": "Benefits of continuing to use — with importance weight",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "benefit", "label": "Benefit", "type": "text"},
          {"id": "weight", "label": "Importance (0-5)", "type": "scale", "scale_min": 0, "scale_max": 5, "scale_labels": {"0": "Not important at all", "5": "Extremely important"}}
        ],
        "min_items": 1,
        "max_items": 10
      },
      {"id": "continue_benefits_total", "label": "Total weighted score for benefits of continuing", "type": "number", "required": true},
      {
        "id": "continue_costs_weighted",
        "label": "Costs of continuing to use — with importance weight",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "cost", "label": "Cost", "type": "text"},
          {"id": "weight", "label": "Importance (0-5)", "type": "scale", "scale_min": 0, "scale_max": 5, "scale_labels": {"0": "Not important at all", "5": "Extremely important"}}
        ],
        "min_items": 1,
        "max_items": 10
      },
      {"id": "continue_costs_total", "label": "Total weighted score for costs of continuing", "type": "number", "required": true},
      {
        "id": "change_benefits_weighted",
        "label": "Benefits of giving up — with importance weight",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "benefit", "label": "Benefit", "type": "text"},
          {"id": "weight", "label": "Importance (0-5)", "type": "scale", "scale_min": 0, "scale_max": 5, "scale_labels": {"0": "Not important at all", "5": "Extremely important"}}
        ],
        "min_items": 1,
        "max_items": 10
      },
      {"id": "change_benefits_total", "label": "Total weighted score for benefits of giving up", "type": "number", "required": true},
      {
        "id": "change_costs_weighted",
        "label": "Costs of giving up — with importance weight",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "cost", "label": "Cost", "type": "text"},
          {"id": "weight", "label": "Importance (0-5)", "type": "scale", "scale_min": 0, "scale_max": 5, "scale_labels": {"0": "Not important at all", "5": "Extremely important"}}
        ],
        "min_items": 1,
        "max_items": 10
      },
      {"id": "change_costs_total", "label": "Total weighted score for costs of giving up", "type": "number", "required": true},
      {
        "id": "reflection",
        "label": "Compare the four totals. What does the weighting reveal that the simple list did not?",
        "type": "textarea",
        "required": true
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Transfer your items from the Decisional Balance Sheet and add importance weights. It is not just the number of pros and cons that matters — it is how important each one is to you.",
    "clinician_notes": "Use this when the client identifies similar numbers of reasons for and against. The weighted scores typically make the case for change much clearer. Highlight the disparity between weighted totals. This was a turning point for the case example (Craig) in the original text."
  }'::jsonb
),

-- ch13_item_12: Psychoeducation — Management Strategies for Substance Misuse
(
  '00000000-0000-4000-a000-000000130012',
  '00000000-0000-4000-8000-000000000013',
  'psychoeducation',
  'Management Strategies for Substance Misuse',
  'Read about the practical strategies you can use to manage cravings, challenge unhelpful beliefs, and maintain your progress.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Behavioural Skills for Refusing Substances",
        "body": "Once you are engaged in treatment, you should learn simple behavioural skills for refusing substances: make eye contact, do not smile, and say ''no'' clearly. Practise these through role-play with your therapist. The aim is to have a few specific skills that become automatic, minimising the mental effort required during stressful moments."
      },
      {
        "heading": "Controlling Physical Cravings and Urges",
        "body": "A craving is when you really ''want'' something; an urge is where you feel you ''must'' have it. Physical cravings and urges are linked with negative mood and low self-esteem. Distraction techniques (talking to someone, listening to music, exercise) help manage cravings. Urges can be relieved by replacing the substance with something less harmful — nicotine patches instead of cigarettes, caffeinated drinks instead of stimulants."
      },
      {
        "heading": "Activity Scheduling",
        "body": "Activity scheduling involves making a structured plan to fill risk periods when you might be vulnerable to substance misuse. Pay particular attention to times when you are most likely to experience cravings, urges, and withdrawal symptoms."
      },
      {
        "heading": "Social Support",
        "body": "Do not go it alone. Engage the help of friends and family. There are also services that provide support and formal treatment. You will need ongoing support not only during treatment but also afterwards, in order to plan and prevent relapse."
      },
      {
        "heading": "Rewards and Positive Feedback",
        "body": "Immediate rewards for success are crucial for people with ADHD. Give yourself a pat on the back, self-praise, or a tangible reward for periods where you have succeeded. Inform others about your progress so they can give support and encouragement. This boosts confidence and self-esteem."
      }
    ],
    "clinician_notes": "Teach refusal skills through role-play in sessions. Help the client identify their personal risk periods for activity scheduling (see Chapters 4 and 11). Emphasise the importance of social support networks and reward systems — both are critical for ADHD clients."
  }'::jsonb
),

-- ch13_item_13: Worksheet — Distraction and Replacement Techniques (Table 13.9)
(
  '00000000-0000-4000-a000-000000130013',
  '00000000-0000-4000-8000-000000000013',
  'worksheet',
  'Distraction and Replacement Techniques (Table 13.9)',
  'List distraction techniques that help you take your mind off cravings, and replacement techniques that can substitute for the substance when you feel urges. Include things that have worked before and new ideas to try.',
  50,
  'Table 13.9',
  '{
    "fields": [
      {"id": "target_substance", "label": "Which substance are these techniques for?", "type": "text", "required": true, "placeholder": "e.g. Amphetamines, Alcohol, Cannabis..."},
      {
        "id": "distraction_techniques",
        "label": "Distraction techniques that work for you (things that take your mind off cravings)",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "technique", "label": "Technique", "type": "text", "placeholder": "e.g. Go to the gym, Play guitar, Call a friend..."}
        ],
        "min_items": 2,
        "max_items": 10
      },
      {
        "id": "replacement_techniques",
        "label": "Replacement techniques to manage urges (less harmful substitutes)",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "technique", "label": "Technique", "type": "text", "placeholder": "e.g. Caffeinated tea/coffee, Nicotine gum, Energy drink, Chewing gum..."}
        ],
        "min_items": 2,
        "max_items": 10
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Think about what has helped you before, even a little bit. Also add new ideas you are willing to try. Keep this list accessible — you will need it during vulnerable moments.",
    "clinician_notes": "Help the client identify techniques they have already used successfully, then expand the list. The replacement techniques should be specific and practical. This worksheet feeds into the flashcard exercise (Table 13.12)."
  }'::jsonb
),

-- ch13_item_14: Psychoeducation — Distraction Techniques Reference Card (Table 13.10)
(
  '00000000-0000-4000-a000-000000130014',
  '00000000-0000-4000-8000-000000000013',
  'psychoeducation',
  'Distraction Techniques Reference Card (Table 13.10)',
  'Keep this list of distraction techniques handy. Use it as a quick reference when you feel a craving coming on.',
  20,
  'Table 13.10',
  '{
    "content_blocks": [
      {
        "heading": "External Focus",
        "body": "Focus on the external environment to distract thoughts from internal cravings — concentrate on the trees, the grass, the people, the shops, etc."
      },
      {
        "heading": "Mental Activity",
        "body": "Engage in some form of mental activity — mental arithmetic, crossword puzzles, reading, sudoku."
      },
      {
        "heading": "Talk to Someone",
        "body": "Talk to someone who is unconnected to the substance. Call a friend, family member, or support person."
      },
      {
        "heading": "Physical Exercise",
        "body": "Get out and about — take a brisk walk, visit a friend, go for a drive, go to the gym."
      },
      {
        "heading": "Household Tasks",
        "body": "Perform household tasks to keep busy — cleaning, organising, cooking."
      },
      {
        "heading": "Games and Entertainment",
        "body": "Spend time playing games — cards, computer games, board games, or anything that occupies your attention."
      },
      {
        "heading": "The STOP Technique",
        "body": "Say to yourself ''STOP!'' Imagine a stop sign or a brick wall. Then focus on your surroundings and describe items in the room in minute detail. Once you feel calmer, imagine a positive place where you felt safe and happy — focus on small details like sounds, textures, and colours. Alternatively, imagine the negative consequences of using — losing your home, family, health."
      }
    ],
    "clinician_notes": "This is designed as a flashcard the client can keep in their wallet or save on their phone. Train the STOP technique through guided imagery in session. Refer back to Table 13.4 (Risk Domain Exercise) for the negative imagery component."
  }'::jsonb
),

-- ch13_item_15: Exercise — Craving Thoughts and Beliefs Sequence (Figure 13.2)
(
  '00000000-0000-4000-a000-000000130015',
  '00000000-0000-4000-8000-000000000013',
  'exercise',
  'Craving Thoughts and Beliefs Sequence (Figure 13.2)',
  'When a craving occurs, it follows a predictable sequence of thoughts and beliefs. Map out your own sequence by filling in each step below. This helps you identify where to intervene and break the cycle.',
  70,
  'Figure 13.2',
  '{
    "fields": [
      {
        "id": "activating_situation",
        "label": "Activating situation: What situation or feeling triggers the craving?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Feeling sad, lonely, restless, and bored"
      },
      {
        "id": "addictive_belief",
        "label": "Addictive belief: What belief kicks in about the substance?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. ''If I have a joint I will feel better''"
      },
      {
        "id": "automatic_thought",
        "label": "Automatic thought: What thought follows immediately?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. ''Why not? I cannot wait, I need it now''"
      },
      {
        "id": "cravings_urges",
        "label": "Cravings and urges: Describe the physical and psychological craving you experience",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Strong urge in my stomach, restlessness, cannot think about anything else"
      },
      {
        "id": "facilitating_beliefs",
        "label": "Facilitating beliefs (permission): What thought gives you ''permission'' to use?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. ''A few drags will not hurt''"
      },
      {
        "id": "instrumental_strategies",
        "label": "Focus on instrumental strategies (action): What do you actually do to obtain the substance?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Look around for some cannabis, call a dealer"
      },
      {
        "id": "continued_use",
        "label": "Continued use or relapse: What happens once you start?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Smoke several joints, use more than intended"
      },
      {
        "id": "intervention_point",
        "label": "Where in this sequence could you intervene to break the cycle? What could you do differently?",
        "type": "textarea",
        "required": true,
        "placeholder": "Think about which step you could interrupt..."
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Think of a recent craving episode and trace it through each step. Being able to see the sequence clearly helps you spot where to break the chain.",
    "clinician_notes": "This exercise identifies thoughts and beliefs that can be cognitively challenged at relevant intervention points. The facilitating beliefs (permission-giving thoughts) are often the most accessible target. Use this to plan specific cognitive challenges for each step."
  }'::jsonb
),

-- ch13_item_16: Exercise — Dysfunctional Beliefs and Addictive Behaviour (Figure 13.3)
(
  '00000000-0000-4000-a000-000000130016',
  '00000000-0000-4000-8000-000000000013',
  'exercise',
  'Dysfunctional Beliefs and Addictive Behaviour (Figure 13.3)',
  'Map out the connection between your underlying dysfunctional beliefs, the emotions they create, and how these link to addictive beliefs and substance use behaviour.',
  70,
  'Figure 13.3',
  '{
    "fields": [
      {
        "id": "dysfunctional_belief",
        "label": "Dysfunctional belief: What negative belief do you hold about yourself?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. ''I am not liked'', ''People only like me if I entertain them''"
      },
      {
        "id": "emotion",
        "label": "Emotion: What emotion does this belief create?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Sad, Anxious, Lonely, Ashamed"
      },
      {
        "id": "addictive_belief",
        "label": "Addictive belief: How does this connect to substance use?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. ''Alcohol will make me more likeable''"
      },
      {
        "id": "addictive_behaviour",
        "label": "Addictive behaviour: What do you end up doing?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Drink more alcohol before social events"
      },
      {
        "id": "challenge",
        "label": "Challenge: How could you challenge the dysfunctional belief? What evidence is there against it?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. ''My partner likes me sober. My colleagues respect my work. I have friends who do not drink.''"
      },
      {
        "id": "alternative_belief",
        "label": "Alternative belief: What is a more balanced and realistic belief?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. ''I can be liked for who I am. I do not need alcohol to be interesting.''"
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Think about a recurring situation where you turn to substances. Trace back to the underlying belief about yourself that drives it. Then challenge that belief with evidence.",
    "clinician_notes": "Dysfunctional beliefs play a key role in maintaining substance misuse. This exercise extends CBT thought challenging to the addictive behaviour cycle. The client may need help generating evidence against their dysfunctional belief — draw on specific examples from their life. Multiple cycles can be mapped for different situations."
  }'::jsonb
),

-- ch13_item_17: Psychoeducation — Common Addictive Beliefs in ADHD (Table 13.11)
(
  '00000000-0000-4000-a000-000000130017',
  '00000000-0000-4000-8000-000000000013',
  'psychoeducation',
  'Common Addictive Beliefs in ADHD (Table 13.11)',
  'Read through these common addictive beliefs. Recognising them is the first step to challenging them. Mark any that you identify with.',
  20,
  'Table 13.11',
  '{
    "content_blocks": [
      {
        "heading": "Beliefs About What Substances Do",
        "body": "People with ADHD commonly form addictive beliefs linking substance use to specific benefits. These beliefs feel true but are thinking errors that maintain the addiction."
      },
      {
        "heading": "Improves Concentration",
        "body": "Addictive belief: ''I cannot focus without it.''"
      },
      {
        "heading": "Reduces Inner Restlessness",
        "body": "Addictive belief: ''I cannot feel calm without it.''"
      },
      {
        "heading": "Improves Confidence",
        "body": "Addictive belief: ''I cannot perform without it.''"
      },
      {
        "heading": "Increases Social Functioning",
        "body": "Addictive belief: ''I will be witty and seem dull without it.''"
      },
      {
        "heading": "Improves Self-Efficacy",
        "body": "Addictive belief: ''I cannot achieve without it.''"
      },
      {
        "heading": "Increases Pleasure and Excitement",
        "body": "Addictive belief: ''Life is boring without it.''"
      },
      {
        "heading": "Increases Energy and Motivation",
        "body": "Addictive belief: ''It is the only thing that motivates me.''"
      },
      {
        "heading": "Relieves Boredom",
        "body": "Addictive belief: ''The situation will not be so bad if I have it beforehand.''"
      },
      {
        "heading": "Relieves Tension, Anxiety, and Depression",
        "body": "Addictive belief: ''I cannot cope without it — it is the only thing that makes me feel better about myself.''"
      },
      {
        "heading": "Maintains Psychological and Emotional Balance",
        "body": "Addictive belief: ''I will go to pieces without it.''"
      },
      {
        "heading": "Improves Social Skills",
        "body": "Addictive belief: ''I communicate better and become more extroverted.''"
      },
      {
        "heading": "Relieves Craving",
        "body": "Addictive belief: ''If craving is not appeased it will get worse.''"
      },
      {
        "heading": "Justifies Dependency",
        "body": "Addictive belief: ''I am addicted so I have no option.''"
      },
      {
        "heading": "The Truth About These Beliefs",
        "body": "Each of these beliefs contains a thinking error. The substance may provide short-term relief, but at the cost of worsening the underlying problem. ADHD medication prescribed by your psychiatrist, combined with the skills taught in this programme, can address these needs without the harmful cycle of substance misuse."
      }
    ],
    "clinician_notes": "Use this as a reference during cognitive challenging exercises. When the client expresses an addictive belief in session, refer them back to this list to help them recognise the pattern. Particularly relevant for ADHD clients who believe substances improve their concentration or social skills — prescribed medication is the appropriate alternative."
  }'::jsonb
),

-- ch13_item_18: Exercise — Choice and Self-Esteem Reflection
(
  '00000000-0000-4000-a000-000000130018',
  '00000000-0000-4000-8000-000000000013',
  'exercise',
  'Choice and Self-Esteem Reflection',
  'People with ADHD who struggle with substance misuse often lose sight of the concept of choice. This exercise helps you reconnect with times when you chose not to use — and felt good about it.',
  70,
  NULL,
  '{
    "fields": [
      {
        "id": "time_chose_not_to_use",
        "label": "Think back to a time when you made the choice NOT to use a substance and had a positive outcome. Describe what happened.",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. I went to a party and stayed sober. I woke up feeling great the next day."
      },
      {
        "id": "how_felt",
        "label": "How did you feel about yourself in that moment?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Proud, in control, positive, strong..."
      },
      {
        "id": "positive_qualities",
        "label": "What positive qualities, feelings, experiences, and behaviours have occurred during your effort to stop misusing substances?",
        "type": "textarea",
        "required": true,
        "placeholder": "List everything positive, however small..."
      },
      {
        "id": "get_back",
        "label": "What can you do to help yourself get back to feeling this way again?",
        "type": "textarea",
        "required": true,
        "placeholder": "What specific steps could you take?"
      },
      {
        "id": "thinking_error",
        "label": "The belief ''I have no self-control so I have no choice'' is a thinking error. What evidence from your own life proves that you DO have choice?",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. The time I described above proves I can choose..."
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "This exercise can be particularly empowering. People with ADHD who feel at the mercy of their impulses often incorrectly believe their lack of self-control means they lack choice. You have made good choices before — and you can again.",
    "clinician_notes": "This technique is particularly empowering for ADHD clients who equate impulsivity with absence of choice. Challenge the thinking error directly. Draw on specific examples from the client''s life. Connect this to the concept of self-efficacy — small successful choices build momentum for larger ones."
  }'::jsonb
),

-- ch13_item_19: Exercise — Self-Reinforcement Flashcard (Table 13.12)
(
  '00000000-0000-4000-a000-000000130019',
  '00000000-0000-4000-8000-000000000013',
  'exercise',
  'Self-Reinforcement Flashcard (Table 13.12)',
  'Create a personal flashcard with your top reasons for stopping substance use. Keep this in your wallet or save it on your phone. Read it whenever you feel weak or vulnerable.',
  70,
  'Table 13.12',
  '{
    "fields": [
      {
        "id": "reasons_to_stop",
        "label": "My top reasons for stopping (write statements that are personal and powerful to you)",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "reason", "label": "Reason", "type": "text", "placeholder": "e.g. I am in more control without it"}
        ],
        "prefill_suggestions": [
          "I am in more control without it",
          "I am less aggressive without it",
          "I do not want to hurt my family or friends",
          "I look healthier without it",
          "I do not want it — I want it to stop NOW"
        ],
        "min_items": 3,
        "max_items": 10
      },
      {
        "id": "coping_strategies",
        "label": "On the back of the card: My coping strategies for when I feel vulnerable",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "strategy", "label": "Strategy", "type": "text", "placeholder": "e.g. Call Sarah, Go to the gym, Use the STOP technique"}
        ],
        "min_items": 2,
        "max_items": 10
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Carry this card at all times. Read it when you feel weak and vulnerable. The front reminds you WHY you are stopping. The back reminds you HOW to get through the tough moment.",
    "clinician_notes": "The flashcard combines reasons from the decisional balance sheet with coping strategies from earlier exercises. Help the client make the statements personal and emotionally resonant. Suggest they photograph the card for their phone as a backup. This is a concrete self-reinforcement tool for use between sessions."
  }'::jsonb
),

-- ch13_item_20: Diary — Substance Use and Craving Diary
(
  '00000000-0000-4000-a000-000000130020',
  '00000000-0000-4000-8000-000000000013',
  'diary',
  'Substance Use and Craving Diary',
  'Track your substance use and cravings daily. For each day, log any cravings, whether you used, what triggered it, and what coping strategies you tried. This diary helps you and your therapist spot patterns and track progress.',
  60,
  NULL,
  '{
    "fields": [
      {"id": "log_date", "label": "Date", "type": "date", "required": true},
      {"id": "craving_occurred", "label": "Did you experience a craving today?", "type": "select", "required": true, "options": ["Yes", "No"]},
      {"id": "craving_intensity", "label": "If yes, how intense was the strongest craving? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "No craving", "5": "Moderate", "10": "Overwhelming"}, "required": false},
      {"id": "craving_trigger", "label": "What triggered the craving?", "type": "textarea", "required": false, "placeholder": "e.g. Feeling bored, Saw old friends, Stressful day at work..."},
      {"id": "substance_used", "label": "Did you use any substance today?", "type": "select", "required": true, "options": ["No — stayed clean", "Yes — used"]},
      {"id": "substance_details", "label": "If yes, what did you use and how much?", "type": "textarea", "required": false, "placeholder": "e.g. 3 beers, 2 joints, 1 cigarette..."},
      {"id": "coping_strategy_used", "label": "What coping strategy did you try?", "type": "textarea", "required": false, "placeholder": "e.g. Used STOP technique, Called a friend, Went to gym..."},
      {"id": "coping_effectiveness", "label": "How effective was the coping strategy? (0-10)", "type": "scale", "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all", "5": "Somewhat", "10": "Completely effective"}, "required": false},
      {"id": "mood_score", "label": "Overall mood today (1-10)", "type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "Very low", "5": "Neutral", "10": "Very good"}, "required": true},
      {"id": "notes", "label": "Any other notes about today?", "type": "textarea", "required": false}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Fill this in at the end of each day. It only takes 2-3 minutes. Even on days with no cravings, log your mood — it helps us see the bigger picture.",
    "clinician_notes": "Review the diary weekly in sessions. Look for patterns: which triggers recur, which coping strategies work best, and the relationship between mood and cravings. Track clean days as a concrete measure of progress. Use craving intensity trends to gauge treatment effectiveness."
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
