-- 08_seed_module_10.sql
-- Seed content items for Module 10 (Frustration and Anger) into yb_content_items
-- Safe to re-run: uses ON CONFLICT DO UPDATE
--
-- Module 10 UUID: 00000000-0000-4000-8000-000000000010  (from 01_seed_modules.sql)
-- Content item UUIDs: 00000000-0000-4000-a000-000000100001 through ...100013

INSERT INTO yb_content_items (id, module_id, type, title, instructions, xp_value, companion_website_ref, schema)
VALUES

-- ch10_item_01: Psychoeducation — Understanding Anger and ADHD
(
  '00000000-0000-4000-a000-000000100001',
  '00000000-0000-4000-8000-000000000010',
  'psychoeducation',
  'Understanding Anger and ADHD',
  'Read through this psychoeducation material before starting the exercises. It explains why anger is a normal emotion and why people with ADHD are especially prone to frustration and anger.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Anger is Normal",
        "body": "Anger is a normal emotion experienced by everyone. The aim of treatment is not to ''stop'' anger, but to improve control and use anger adaptively. Anger can motivate change, help you problem solve, impose control, and change situations. It also has an alerting function — it signals potential danger and protects us from harm."
      },
      {
        "heading": "Why ADHD Makes Anger Harder",
        "body": "Due to their symptoms, adults with ADHD may be predisposed to a labile or explosive temperament. They may have developed maladaptive ways of coping with anger and express feelings inappropriately. Feelings of anger are more likely to be expressed outwardly than inwardly suppressed, due to the inability to inhibit a response and having a low threshold for irritability and boredom."
      },
      {
        "heading": "Frustration and ADHD",
        "body": "Tolerating frustration can be especially difficult for adults with ADHD. You may become annoyed by your lack of achievement and failure to finish tasks. You may also get annoyed when friends and family start telling you what to do, organise your life for you, or complain about lack of commitment — which feels like ''nagging''. These cycles of negativity can extend to close friendships and intimate relationships."
      },
      {
        "heading": "Consequences of Unmanaged Anger",
        "body": "Anger management difficulties can lead to breakdown in relationships, termination of employment, and involvement with the police. The good news is that anger management is a skill — and like any skill, it can be learned and improved."
      },
      {
        "heading": "What You Will Learn in This Module",
        "body": "In this module you will learn to: recognise what makes you angry, understand the physical, cognitive and behavioural signs of anger, identify the stages of anger (antecedents, behaviour, consequences), apply anger management techniques (distraction, self-talk, relaxation), use the ADHD Formula to reframe confrontations, distinguish between insults and criticisms, and develop assertiveness skills."
      }
    ],
    "clinician_notes": "Adults with ADHD may have accumulated anger towards psychiatric services for not meeting their needs. Be sensitive to this. Some individuals may blame others for not identifying the disorder earlier. Building a therapeutic alliance may require gently introducing anger management techniques early. Assess for both overt (escalating) and covert (suppressing) anger styles."
  }'::jsonb
),

-- ch10_item_02: Psychoeducation — Thirteen Reasons People with ADHD Get Angry
(
  '00000000-0000-4000-a000-000000100002',
  '00000000-0000-4000-8000-000000000010',
  'psychoeducation',
  'Thirteen Reasons People with ADHD Get Angry',
  'Read through these 13 common anger triggers for adults with ADHD. As you read, notice which ones feel familiar to you. This awareness is the first step to managing anger better.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "1. Taking Things Personally",
        "body": "People with ADHD may be more likely to interpret any threat or blame as a personal slight. For example, if a family member asks whether you have seen a missing item, you might feel accused of stealing it — even though no accusation was made."
      },
      {
        "heading": "2. Losing Control of a Situation",
        "body": "If you feel like you are not succeeding, you tend to give up easily. It feels better to give up than struggle and feel hopeless. But the inability to achieve makes you angry inside, and giving up compounds frustration. Feeling angry also serves as a distraction — you focus on your feelings and escape the unfinished task."
      },
      {
        "heading": "3. Feeling Threatened",
        "body": "People with ADHD are more likely to catastrophise and overreact to criticism, even constructive criticism, due to a learned sense of underachievement. In provocative situations, you may act on impulse and respond aggressively without thinking about the consequences."
      },
      {
        "heading": "4. Learned Behaviour",
        "body": "You may have developed maladaptive response patterns over years. You may not be particularly angry, but behave in a way that suggests you are, because this is how you have learnt to behave. This gives the wrong impression — people may see you as ''prickly'' and overly sensitive."
      },
      {
        "heading": "5. Poor Impulse Control",
        "body": "This core ADHD symptom can lead to escalation of anger. You may be more likely to act out aggressively — either towards others, yourself, or property. You are less likely to walk away from a confrontation and more likely to respond physically."
      },
      {
        "heading": "6. Feeling Resentful",
        "body": "Angry feelings may build up slowly, especially if you feel judged or stigmatised by others. You may feel resentful of people who seem to have an easier life."
      },
      {
        "heading": "7. Frustration with Attentional Difficulties",
        "body": "You become angry when you make mistakes, forget instructions, or are slow to finish. You have insight into your difficulties and notice your errors. But anger compounds attentional problems — you get distracted by angry thoughts and lose focus."
      },
      {
        "heading": "8. Frustration with Lack of Services",
        "body": "Adults with ADHD often have a long history of presenting to services and being dismissed or misunderstood. Having told your story over and over without getting appropriate support can leave lasting frustration."
      },
      {
        "heading": "9. Anger as Avoidance of Other Emotions",
        "body": "Feelings of anger may be expressed instead of other emotions such as distress or sadness, in order to avoid showing what might be perceived as ''weaker'' emotions."
      },
      {
        "heading": "10. Stimuli for Excitement",
        "body": "Moving into high arousal provides a state of high stimulus and, for some, excitement. An aggressive argument with shouting, gesticulating, and slamming doors provides an adrenalin rush — which acts as positive reinforcement, increasing the likelihood of repeating the behaviour."
      },
      {
        "heading": "11. A Source of Communication",
        "body": "Many individuals have poor social skills and difficulty expressing thoughts and feelings. You may respond with anger because you misread social situations (social skills deficit) and/or because you feel resentment towards people in a world that feels harsh and biased against you."
      },
      {
        "heading": "12. Establishment of Superiority",
        "body": "People with ADHD commonly develop low self-esteem. In order to defend against feelings of vulnerability, you may use aggression to convey the message ''I am better than you''. Even engaging in this process without actually feeling angry can produce real feelings of anger."
      },
      {
        "heading": "13. Road Rage",
        "body": "There is an increased risk that people with ADHD will experience road rage and road traffic accidents. You may become wound up in common driving situations but be unable to self-regulate your anger and inhibit your responses. People with ADHD are more likely to act provocatively on the roads."
      }
    ],
    "clinician_notes": "Use this list as a basis for discussion. Ask the client which reasons resonate most. This will guide which exercises to prioritise. The 13 reasons map to different treatment approaches — impulse-driven anger needs distraction and self-talk, resentment-based anger needs cognitive reframing, and communication-based anger needs assertiveness training."
  }'::jsonb
),

-- ch10_item_03: Worksheet — My Anger Triggers Checklist
(
  '00000000-0000-4000-a000-000000100003',
  '00000000-0000-4000-8000-000000000010',
  'worksheet',
  'My Anger Triggers Checklist',
  'Review the 13 reasons people with ADHD get angry. For each one, rate how much it applies to you. This helps you and your therapist understand your personal anger profile.',
  50,
  NULL,
  '{
    "fields": [
      {"id": "q1", "label": "Taking things personally — I interpret neutral comments as personal attacks", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q2", "label": "Losing control — I get angry when I feel I am failing at a task", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q3", "label": "Feeling threatened — I overreact to criticism even when it is constructive", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q4", "label": "Learned behaviour — People describe me as prickly or overly sensitive", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q5", "label": "Poor impulse control — I act out my anger physically (hitting, throwing, slamming)", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q6", "label": "Feeling resentful — I feel angry towards people who seem to have an easier life", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q7", "label": "Attentional frustration — I get angry at myself for making mistakes or forgetting things", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q8", "label": "Service frustration — I feel angry about being misunderstood or dismissed by professionals", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q9", "label": "Avoiding emotions — I express anger instead of sadness or fear because anger feels stronger", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q10", "label": "Excitement-seeking — Arguments or confrontations give me a rush of energy", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q11", "label": "Communication difficulty — I use anger because I do not know how else to express myself", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q12", "label": "Superiority — I use aggression to cover up feelings of vulnerability or low self-esteem", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "q13", "label": "Road rage — I lose my temper while driving or in traffic situations", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false}
    ],
    "scoring": {
      "method": "sum",
      "max_score": 52,
      "interpretation": {
        "0-17": "Low anger trigger profile. You have some frustration triggers but overall manage well. Focus on the items you scored highest.",
        "18-35": "Moderate anger trigger profile. Several triggers are active for you. Targeted anger management strategies will help.",
        "36-52": "High anger trigger profile. Anger is significantly impacting your daily life. This module will be especially valuable — work closely with your therapist."
      }
    },
    "instructions_for_patient": "Rate each item honestly. There is no judgement here — this helps us build your personal anger management plan.",
    "clinician_notes": "Use the highest-scored items to prioritise which exercises to focus on. Items 1-3 respond well to cognitive reframing. Items 4-5 need behavioural strategies and distraction. Items 6-8 benefit from psychoeducation and acceptance work. Items 9-12 need assertiveness and communication skills training. Item 13 may need specific safety planning."
  }'::jsonb
),

-- ch10_item_04: Psychoeducation — Physical, Cognitive and Behavioural Signs of Anger (Figure 10.1)
(
  '00000000-0000-4000-a000-000000100004',
  '00000000-0000-4000-8000-000000000010',
  'psychoeducation',
  'Physical, Cognitive and Behavioural Signs of Anger (Figure 10.1)',
  'Anger has three interrelated components. Learning to recognise them in yourself is the foundation of anger management.',
  20,
  'Figure 10.1',
  '{
    "content_blocks": [
      {
        "heading": "Physical Signs",
        "body": "When you become angry, your body prepares to face a threat by releasing adrenaline. You may notice: increased heart rate, muscle tension, sweating, increase in pitch and volume of voice, face feeling hot, clenched jaw or fists, and shallow or rapid breathing."
      },
      {
        "heading": "Cognitive Signs",
        "body": "After the physical symptoms, negative or aggressive thoughts occur automatically and can increase the physical anger symptoms. These thoughts happen very rapidly. Examples include: ''I am getting mad'', ''I am furious'', ''I will kill him!'', ''How dare she!'', ''This is not fair'', ''They are doing this on purpose''."
      },
      {
        "heading": "Behavioural Signs",
        "body": "Angry behaviour often goes unnoticed by the angry person but is very visible to others. Examples include: finger pointing, staring or glaring, standing up and standing too close, storming off, raising voice, clenching fists, squaring up, and invading personal space."
      },
      {
        "heading": "The Key Insight",
        "body": "These three components feed into each other in a cycle. Physical arousal triggers angry thoughts, which trigger angry behaviour, which increases physical arousal. The good news is that interrupting any one component can break the whole cycle. In this module, you will learn to interrupt at each level."
      }
    ],
    "clinician_notes": "Ask the client to think about the last time they were angry and identify which physical, cognitive and behavioural signs they noticed. Many clients are unaware of their body language. If available, video recording of role-plays can help identify behaviours needing intervention."
  }'::jsonb
),

-- ch10_item_05: Psychoeducation — Dysfunctional Anger Styles: Escalation vs Suppression
(
  '00000000-0000-4000-a000-000000100005',
  '00000000-0000-4000-8000-000000000010',
  'psychoeducation',
  'Dysfunctional Anger Styles — Escalation vs Suppression',
  'Read about the two main dysfunctional ways people with ADHD manage anger. Identify which style is more like you — most people have a primary style.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "Escalation Style",
        "body": "A person who escalates is likely to explicitly express feelings of anger and make them well known. Their threshold for revealing annoyance is much lower and they may be labile in temperament. They are more likely to respond explosively in stressful situations — for example, if someone pushes in front of them in a queue, they cannot inhibit the impulse to respond aggressively. Some people feel a sense of power and excitement by deliberately provoking others, which provides an immediate reward. Long-term consequences include: losing friendships, destroying objects, physical injury, and criminal convictions."
      },
      {
        "heading": "Suppression Style",
        "body": "A person who suppresses anger often denies feeling angry. They may be passive-aggressive and compliant, appearing to cope well while feelings of resentment slowly build up inside. Then they suddenly explode — the trigger being seemingly innocent. Others may see their response as disproportionate and call them ''unpredictable'' or a ''loose cannon''. Suppressed anger can also surface in unrelated situations that remind them of the earlier experience, causing misplaced anger and great confusion to those around them."
      },
      {
        "heading": "Why This Matters",
        "body": "Understanding your anger style helps you choose the right management strategies. Escalators need to learn to pause before acting — distraction and self-talk techniques are critical. Suppressors need to learn to express their feelings assertively before resentment builds up — assertiveness skills and the ADHD Formula will be most helpful."
      }
    ],
    "clinician_notes": "Assess the client for their primary anger style. Many ADHD adults oscillate between styles depending on context (e.g. suppress at work, escalate at home). Suppressors may need assertiveness training before anger management, as they first need to learn to express anger at all before they can learn to express it appropriately."
  }'::jsonb
),

-- ch10_item_06: Exercise — Anger ABC Analysis (Antecedents, Behaviour, Consequences)
(
  '00000000-0000-4000-a000-000000100006',
  '00000000-0000-4000-8000-000000000010',
  'exercise',
  'Anger ABC Analysis (Antecedents, Behaviour, Consequences)',
  'Anger follows a three-stage process: Antecedents (what triggers it), Behaviour (what you do when angry), and Consequences (what happens as a result). This exercise helps you map your personal anger pattern. Start by thinking of a recent anger episode — or, if it feels safer, think of someone else whose anger you recently observed.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "situation_description", "label": "Briefly describe the anger episode", "type": "textarea", "required": true, "placeholder": "What happened? Where were you? Who was involved?"},
      {"id": "antecedents", "label": "A — Antecedents: What triggered your anger?", "type": "textarea", "required": true, "placeholder": "e.g. Being interrupted while concentrating, a family member criticising me, being stuck in traffic..."},
      {"id": "antecedent_commonalities", "label": "Is this a common trigger for you? Does it involve specific people, places, or situations?", "type": "textarea", "required": true, "placeholder": "e.g. I notice I get angrier at work than at home, or I get angrier with my partner than with friends..."},
      {"id": "physical_signs", "label": "What physical signs of anger did you notice?", "type": "checkbox", "required": false, "options": ["Heart racing", "Face feeling hot", "Muscle tension", "Sweating", "Voice getting louder", "Clenched fists or jaw", "Shallow breathing", "Stomach churning", "Other"]},
      {"id": "physical_signs_other", "label": "If ''Other'', describe", "type": "text", "required": false},
      {"id": "thoughts", "label": "What thoughts went through your mind?", "type": "textarea", "required": true, "placeholder": "e.g. ''This is not fair'', ''They are doing this on purpose'', ''I cannot take this anymore''..."},
      {"id": "behaviour", "label": "B — Behaviour: What did you actually do?", "type": "textarea", "required": true, "placeholder": "e.g. Shouted, slammed a door, walked away, went silent, said something hurtful..."},
      {"id": "consequences_positive", "label": "C — Consequences (positive): Was there anything good that came from how you responded?", "type": "textarea", "required": false, "placeholder": "e.g. I felt relieved, the other person stopped, I avoided a worse situation..."},
      {"id": "consequences_negative", "label": "C — Consequences (negative): What were the downsides of how you responded?", "type": "textarea", "required": true, "placeholder": "e.g. I hurt someone''s feelings, I felt guilty afterwards, I damaged something, the situation got worse..."},
      {"id": "alternative_response", "label": "Looking back, what could you have done differently?", "type": "textarea", "required": true, "placeholder": "e.g. Walked away before reacting, used a self-talk statement, paused and counted to 10..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Complete this for one recent anger episode first. You can repeat this exercise for different episodes to build a clearer picture of your anger patterns.",
    "clinician_notes": "If the client finds it too threatening to examine their own anger, start with a third-party example (someone they observed, or even a TV confrontation). Then move to their own experiences. Look for commonalities in triggers — these inform the prevention strategies. Emphasise that examining consequences is not about blame but about understanding patterns."
  }'::jsonb
),

-- ch10_item_07: Diary — Anger Diary
(
  '00000000-0000-4000-a000-000000100007',
  '00000000-0000-4000-8000-000000000010',
  'diary',
  'Anger Diary',
  'For the next two weeks, log each time you feel angry or frustrated. This does not need to be a big episode — even mild irritation counts. Recording anger as it happens helps you spot patterns and gives you and your therapist real data to work with.',
  60,
  NULL,
  '{
    "fields": [
      {"id": "log_date", "label": "Date", "type": "date", "required": true},
      {"id": "log_time", "label": "Approximate time", "type": "time", "required": false},
      {"id": "trigger", "label": "What triggered your anger or frustration?", "type": "textarea", "required": true, "placeholder": "e.g. Partner criticised my driving, forgot an important deadline at work, someone pushed in front of me..."},
      {"id": "anger_intensity", "label": "How intense was your anger? (0 = no anger, 10 = most angry you have ever felt)", "type": "scale", "required": true, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "No anger", "5": "Moderate", "10": "Extreme"}},
      {"id": "physical_signs", "label": "Which physical signs did you notice?", "type": "checkbox", "required": false, "options": ["Heart racing", "Face hot", "Tense muscles", "Sweating", "Louder voice", "Clenched fists/jaw", "Rapid breathing", "None noticed"]},
      {"id": "what_did_you_do", "label": "What did you do?", "type": "textarea", "required": true, "placeholder": "e.g. Shouted, went quiet, walked away, used a technique from therapy..."},
      {"id": "technique_used", "label": "Did you try any anger management technique?", "type": "select", "required": false, "options": ["No", "Distraction (walked away)", "Self-talk (calming statements)", "Relaxation (breathing)", "ADHD Formula", "Paused before reacting", "Other"]},
      {"id": "technique_helpful", "label": "If you used a technique, how helpful was it? (0 = not at all, 10 = completely defused my anger)", "type": "scale", "required": false, "scale_min": 0, "scale_max": 10, "scale_labels": {"0": "Not at all helpful", "10": "Completely helpful"}},
      {"id": "outcome", "label": "What was the outcome?", "type": "textarea", "required": false, "placeholder": "e.g. Situation resolved, argument continued, I calmed down after 10 minutes..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Try to log each anger episode as soon as possible after it happens. If you cannot log immediately, do it at the end of the day. Even one entry per day is useful.",
    "clinician_notes": "Review the diary weekly in session. Look for: common triggers, time-of-day patterns, escalation vs suppression patterns, whether techniques are being used and their effectiveness, and whether anger intensity is changing over time. The diary also helps build awareness — the act of logging itself can reduce reactivity."
  }'::jsonb
),

-- ch10_item_08: Exercise — Anger Management Techniques: Distraction, Self-Talk, and Relaxation
(
  '00000000-0000-4000-a000-000000100008',
  '00000000-0000-4000-8000-000000000010',
  'exercise',
  'Anger Management Techniques — Distraction, Self-Talk, and Relaxation',
  'There are three core techniques for managing anger in the moment. Work through each one with your therapist and practise them before you need them. Like any skill, they work best when rehearsed.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "distraction_understanding", "label": "Distraction: When you notice early signs of anger, you can walk away and occupy yourself with a neutral, unrelated task. Important — walking away and then ranting to friends is NOT distraction. It fuels your anger further. What neutral activities could you use to distract yourself?", "type": "textarea", "required": true, "placeholder": "e.g. Go for a walk, listen to music, wash dishes, step outside for fresh air, count backwards from 100..."},
      {"id": "distraction_plan", "label": "Think of a situation where you often get angry. Write a distraction plan: what will you do to remove yourself?", "type": "textarea", "required": true, "placeholder": "e.g. When I feel my face getting hot during an argument with my partner, I will say ''I need 10 minutes'' and go to the balcony..."},
      {"id": "selftalk_understanding", "label": "Self-Talk: This is about deliberately rehearsing calming statements when you feel anger building. It is not just ''positive thinking'' — it is a cognitive rehearsal that reaffirms your ability to get through the situation. Write 3-5 self-talk statements that would work for you.", "type": "textarea", "required": true, "placeholder": "e.g. ''I can get through this'', ''I am not going to show this person I am angry'', ''I am better than this'', ''This feeling will pass'', ''Reacting will make things worse''..."},
      {"id": "selftalk_practice", "label": "Imagine a past situation that made you angry. Now imagine yourself in that situation using your self-talk statements. Describe what happens differently.", "type": "textarea", "required": true, "placeholder": "e.g. Instead of shouting back, I told myself ''I can get through this'' and took three deep breaths. I felt my heart rate slow down..."},
      {"id": "relaxation_understanding", "label": "Relaxation: Breathing exercises and muscle relaxation help you focus on your internal state and distance yourself from external triggers. This works best for generalised anger — the resentment and dissatisfaction that bubbles under the surface. Describe a relaxation technique you will commit to practising regularly.", "type": "textarea", "required": true, "placeholder": "e.g. 4-7-8 breathing (inhale 4 seconds, hold 7, exhale 8), progressive muscle relaxation, listening to calming music..."},
      {"id": "preferred_technique", "label": "Which technique do you think will be most useful for you, and why?", "type": "textarea", "required": true, "placeholder": "Think about your anger style — do you escalate quickly (distraction may help most) or build up slowly (relaxation may help most)?"}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Practise these techniques when you are calm so they become automatic. If you only try them for the first time when you are angry, they are unlikely to work.",
    "clinician_notes": "Demonstrate all three techniques in session. For distraction, emphasise the difference between constructive distraction (neutral activity) and destructive distraction (ranting to friends, substance use). For self-talk, have the client rehearse statements aloud — not just write them. For relaxation, refer to Chapter 9 techniques if needed. Consider demonstrating the anger induction exercise: have the client re-live an anger episode in imagination, then apply each technique."
  }'::jsonb
),

-- ch10_item_09: Exercise — The ADHD Formula for Reframing Confrontations (Table 10.1)
(
  '00000000-0000-4000-a000-000000100009',
  '00000000-0000-4000-8000-000000000010',
  'exercise',
  'The ADHD Formula for Reframing Confrontations (Table 10.1)',
  'The ADHD Formula is a structured way to express your frustration without escalating a situation. Each letter stands for a step. Practise this with your therapist using a real example from your life.',
  70,
  'Table 10.1',
  '{
    "fields": [
      {"id": "situation", "label": "Describe a recent situation where you felt frustrated or angry with someone", "type": "textarea", "required": true, "placeholder": "e.g. My flatmate keeps leaving dirty dishes in the sink and I end up cleaning them..."},
      {"id": "step_a", "label": "A — Address the situation: State the facts briefly and neutrally. No blaming, no ''you always'' statements.", "type": "textarea", "required": true, "placeholder": "e.g. ''When I came home today, the dishes from this morning were still in the sink.''"},
      {"id": "step_d1", "label": "D — Describe your feelings: Use ''I feel...'' statements, not ''You made me feel...'' statements.", "type": "textarea", "required": true, "placeholder": "e.g. ''I feel frustrated when I see this because I end up doing the cleaning myself.''"},
      {"id": "step_h", "label": "H — Help them understand: Tell the person what you would like them to do differently. Be specific — they are not mind readers.", "type": "textarea", "required": true, "placeholder": "e.g. ''I would appreciate it if you could wash your dishes before you leave for work.''"},
      {"id": "step_d2", "label": "D — Define the consequence: State what will happen if the behaviour continues. Be pragmatic and explicit.", "type": "textarea", "required": true, "placeholder": "e.g. ''If we cannot agree on this, I will only wash my own dishes going forward.''"},
      {"id": "reflection", "label": "How does this feel compared to how you would normally handle this situation?", "type": "textarea", "required": true, "placeholder": "e.g. Normally I would bottle it up until I explode, or I would shout about it. This feels calmer and clearer."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "The ADHD Formula works because it is explicit — the other person learns how you feel, what you want, and what will happen. Practise this in therapy first, then try it in a low-stakes real situation.",
    "clinician_notes": "Role-play the ADHD Formula in session. The therapist should play the ''target person'' and respond in different ways (agreeing, pushing back, getting defensive) so the client can practise maintaining the formula under pressure. Emphasise that the formula prevents the buildup of resentment by addressing issues early and explicitly."
  }'::jsonb
),

-- ch10_item_10: Worksheet — Dealing with Insults and Criticisms (Figure 10.2)
(
  '00000000-0000-4000-a000-000000100010',
  '00000000-0000-4000-8000-000000000010',
  'worksheet',
  'Dealing with Insults and Criticisms (Figure 10.2)',
  'People with ADHD are especially sensitive to insults and criticisms due to a lifetime of negative feedback. This worksheet helps you distinguish between insults (designed to hurt) and constructive criticism (designed to help), and respond appropriately to each.',
  50,
  'Figure 10.2',
  '{
    "fields": [
      {"id": "worst_insult", "label": "Think of the worst insult someone has said to you. What was it?", "type": "textarea", "required": true, "placeholder": "Describe the insult and the context in which it was said..."},
      {"id": "why_bad", "label": "Why did this make you feel bad? (e.g. was it threatening to your family, identity, self-image?)", "type": "textarea", "required": true},
      {"id": "what_upset", "label": "What specifically upset you? Was it the words, the tone, the body language, or all of these?", "type": "textarea", "required": true},
      {"id": "motivation", "label": "Why do you think the person said it? What was their motivation?", "type": "textarea", "required": true, "placeholder": "e.g. They were trying to hurt me, they were frustrated themselves, they wanted to feel superior..."},
      {"id": "insult_selftalk", "label": "Write 2-3 self-talk statements you could use next time someone insults you", "type": "textarea", "required": true, "placeholder": "e.g. ''He is only saying this to wind me up — I will not give him the pleasure'', ''I know I am a decent person and that is what matters'', ''What do they know about me anyway''"},
      {"id": "criticism_example", "label": "Now think of a recent criticism you received. Describe it.", "type": "textarea", "required": true, "placeholder": "e.g. My manager told me my report was hard to follow..."},
      {"id": "criticism_truth", "label": "Is there any truth in the criticism?", "type": "select", "required": true, "options": ["Yes, fully", "Partly true", "No, not at all"]},
      {"id": "criticism_response_yes", "label": "If YES or PARTLY: What can you acknowledge, and what could you do to improve?", "type": "textarea", "required": false, "placeholder": "e.g. I can acknowledge my report lacked structure. I could ask for an example of a good report to follow."},
      {"id": "criticism_response_no", "label": "If NO: Was it actually an insult? If so, use self-talk. If not, how could you calmly explain your point of view?", "type": "textarea", "required": false, "placeholder": "e.g. I could say ''I understand your concern, but here is why I did it this way...''"}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Learning to tell the difference between insults and criticisms is one of the most useful skills in this module. Insults deserve self-talk. Criticisms deserve careful listening.",
    "clinician_notes": "People with ADHD often miss the constructive opening of criticism due to attentional deficits, hearing only the negative part. Teach the client to ask the other person to repeat or explain in more detail — this buys time and allows them to hear the full message. Role-play both giving and receiving constructive criticism in sessions."
  }'::jsonb
),

-- ch10_item_11: Worksheet — Measure of Assertion (Table 10.2)
(
  '00000000-0000-4000-a000-000000100011',
  '00000000-0000-4000-8000-000000000010',
  'worksheet',
  'Measure of Assertion (Table 10.2)',
  'This self-report measure helps you understand how assertive you currently are. Rate each item honestly. You will complete this again later in the module to track your progress.',
  50,
  'Table 10.2',
  '{
    "fields": [
      {"id": "q1", "label": "Stand up for yourself if you feel someone is taking advantage of you", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Mostly", "Always", "Don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q2", "label": "Make alternative suggestions to the ideas of others", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Mostly", "Always", "Don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q3", "label": "Say ''No'' to other people", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Mostly", "Always", "Don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q4", "label": "Tell someone you disagree with them", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Mostly", "Always", "Don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q5", "label": "Resist being pressured into going along with something you do not want to", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Mostly", "Always", "Don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q6", "label": "Request an explanation if someone is not being clear", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Mostly", "Always", "Don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q7", "label": "Express your feelings of dissatisfaction", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Mostly", "Always", "Don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q8", "label": "Tell someone they have made a mistake", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Mostly", "Always", "Don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q9", "label": "Face up to difficult or challenging situations", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Mostly", "Always", "Don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false}
    ],
    "scoring": {
      "method": "sum",
      "max_score": 36,
      "interpretation": {
        "0-12": "Low assertiveness. You tend to go along with others and suppress your needs. Assertiveness training will be a priority.",
        "13-24": "Moderate assertiveness. You can assert yourself in some situations but not others. Focus on the areas where you scored lowest.",
        "25-36": "Good assertiveness. You generally express your needs well. Fine-tune the specific situations that remain challenging."
      }
    },
    "instructions_for_patient": "Answer ''How well can you...'' for each item. Be honest — this is about finding areas to develop, not judging yourself.",
    "clinician_notes": "Administer pre-treatment and post-treatment to measure change. Use low-scored items to prioritise assertiveness role-plays. Note that high assertiveness scores do not rule out aggression — some clients are assertive in some contexts and aggressive in others. Cross-reference with the anger diary."
  }'::jsonb
),

-- ch10_item_12: Exercise — Assertiveness vs Aggression Practice
(
  '00000000-0000-4000-a000-000000100012',
  '00000000-0000-4000-8000-000000000010',
  'exercise',
  'Assertiveness vs Aggression — Practice Exercise',
  'Being assertive is different from being aggressive or passive. This exercise helps you practise the difference using real scenarios from your life. Assertiveness means expressing how you feel directly and honestly, without hurting others or yourself.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "scenario", "label": "Describe a situation where you need to assert yourself but find it difficult", "type": "textarea", "required": true, "placeholder": "e.g. Asking my boss for time off, telling a friend I cannot lend them money, disagreeing with my partner about plans..."},
      {"id": "passive_response", "label": "What would a PASSIVE response look like? (going along with it, suppressing your feelings)", "type": "textarea", "required": true, "placeholder": "e.g. I would say nothing and feel resentful inside..."},
      {"id": "aggressive_response", "label": "What would an AGGRESSIVE response look like? (forceful, blaming, threatening)", "type": "textarea", "required": true, "placeholder": "e.g. I would shout and say ''You always take advantage of me!''..."},
      {"id": "assertive_response", "label": "What would an ASSERTIVE response look like? (direct, honest, calm, using ''I'' statements)", "type": "textarea", "required": true, "placeholder": "e.g. ''I feel uncomfortable lending money right now. I hope you understand.''"},
      {"id": "desired_outcome", "label": "What outcome do you actually want from this interaction?", "type": "textarea", "required": true, "placeholder": "Be specific about what you want to happen..."},
      {"id": "body_language", "label": "Assertive body language checklist — which of these can you practise?", "type": "checkbox", "required": false, "options": ["Take a step back — do not invade personal space", "Maintain steady eye contact", "Keep a firm but not menacing facial expression", "Speak at a steady volume — no shouting or whispering", "Speak at a steady pace — not too fast", "Use ''I feel...'' statements instead of ''You make me...''"]},
      {"id": "adhd_formula_applied", "label": "Now apply the ADHD Formula to this scenario. Write out what you would say for each step (A-D-H-D).", "type": "textarea", "required": true, "placeholder": "A (Address): ...\nD (Describe feelings): ...\nH (Help understand): ...\nD (Define consequence): ..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Role-play the assertive response with your therapist. Pay attention to your tone, volume, pace, and body language. Practise in front of a mirror at home.",
    "clinician_notes": "Role-play all three response styles (passive, aggressive, assertive) so the client can feel the difference. Point out functional characteristics of speech and body language that distinguish assertion from aggression. Look for opportunities during therapy to positively reinforce assertive behaviour when it occurs naturally. Use the ADHD formula as a scaffold for the assertive response."
  }'::jsonb
),

-- ch10_item_13: Worksheet — My Anger Management Plan
(
  '00000000-0000-4000-a000-000000100013',
  '00000000-0000-4000-8000-000000000010',
  'worksheet',
  'My Anger Management Plan',
  'Now that you have learned about your anger triggers, anger style, and management techniques, create a personal anger management plan. This is your quick-reference guide for when you feel anger building.',
  50,
  NULL,
  '{
    "fields": [
      {"id": "my_top_triggers", "label": "My top 3 anger triggers (from the checklist)", "type": "textarea", "required": true, "placeholder": "e.g. 1. Being interrupted while concentrating 2. Feeling criticised by my partner 3. Frustration with my own mistakes"},
      {"id": "my_anger_style", "label": "My primary anger style", "type": "select", "required": true, "options": ["Escalator (I express anger openly and quickly)", "Suppressor (I bottle it up until I explode)", "Both (depends on the situation)"]},
      {"id": "my_early_warning_signs", "label": "My early warning signs (physical and cognitive)", "type": "textarea", "required": true, "placeholder": "e.g. My face gets hot, I start swearing in my head, my voice gets louder, I feel tension in my shoulders..."},
      {"id": "my_distraction_plan", "label": "My distraction plan — what will I do to walk away constructively?", "type": "textarea", "required": true, "placeholder": "e.g. Say ''I need 10 minutes'', go outside, listen to music on headphones..."},
      {"id": "my_selftalk_statements", "label": "My self-talk statements (write 3-5)", "type": "textarea", "required": true, "placeholder": "e.g. ''I can handle this'', ''Reacting will make things worse'', ''This feeling will pass in 10 minutes''..."},
      {"id": "my_relaxation_method", "label": "My relaxation method", "type": "textarea", "required": true, "placeholder": "e.g. 4-7-8 breathing, progressive muscle relaxation, calming music playlist..."},
      {"id": "my_adhd_formula_template", "label": "My ADHD Formula template — a go-to script I can adapt to different situations", "type": "textarea", "required": true, "placeholder": "A: ''When [specific behaviour happens]...''\nD: ''I feel [emotion]...''\nH: ''It would help if you could [specific request]...''\nD: ''If that does not work, I will [specific consequence]...''"},
      {"id": "emergency_contact", "label": "If I feel anger is becoming dangerous, I will:", "type": "textarea", "required": true, "placeholder": "e.g. Leave the room immediately, call my therapist, call a trusted friend, go for a walk..."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Keep this plan somewhere accessible — on your phone, printed on a card, wherever you can reach it quickly. Review it with your therapist regularly and update it as you learn what works best for you.",
    "clinician_notes": "This is the capstone worksheet for the module. It synthesises all the techniques into a personal action plan. Review and update this plan in subsequent sessions as the client gains experience with the techniques. Ensure the safety plan section is completed — if a client has a history of violence or self-harm, involve the full care team."
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
