-- 09_seed_module_08.sql
-- Seed content items for Module 8 (Social Relationships) into yb_content_items
-- Safe to re-run: uses ON CONFLICT DO UPDATE
--
-- Module 8 UUID: 00000000-0000-4000-8000-000000000008  (from 01_seed_modules.sql)
-- Content item UUIDs: 00000000-0000-4000-a000-000000080001 through ...080020

INSERT INTO yb_content_items (id, module_id, type, title, instructions, xp_value, companion_website_ref, schema)
VALUES

-- ch8_item_01: Psychoeducation — Why Social Relationships Are Hard with ADHD
(
  '00000000-0000-4000-a000-000000080001',
  '00000000-0000-4000-8000-000000000008',
  'psychoeducation',
  'Why Social Relationships Are Hard with ADHD',
  'Read through this before starting the exercises. Understanding how ADHD affects your social life is the first step to improving it.',
  20,
  NULL,
  '{
    "content_blocks": [
      {
        "heading": "It Is Not Just You",
        "body": "It is common for people with ADHD to feel they have difficulties in their interpersonal relationships — friendships, romantic relationships, working relationships, and family relationships. Many grow up believing they are misunderstood or ''different'' from others."
      },
      {
        "heading": "The Social Paradox of ADHD",
        "body": "People with ADHD are not naturally reclusive — they are enthusiastic, social, and friendly people. Yet the paradox is that they desire social acceptance but feel anxious in social situations and uncertain about how to behave. Some feel they need to ''play the clown'' to mask anxiety or attentional problems."
      },
      {
        "heading": "How ADHD Symptoms Are Misread",
        "body": "Inattention may be misinterpreted as lacking interest. Flitting from one person or topic to another may seem insincere. Impulsivity can lead to snap judgements and self-fulfilling prophecies — for example, assuming someone does not like you because they did not acknowledge you in the corridor, without considering they may simply have been preoccupied."
      },
      {
        "heading": "Social Skills: Micro and Macro",
        "body": "Micro-skills include specific techniques like appropriate eye contact, voice volume and tone, and body positioning. Macro-skills encompass more complex interactions such as giving compliments, constructive feedback, turn-taking, and listening skills. This module will help you develop both."
      },
      {
        "heading": "What You Will Learn in This Module",
        "body": "You will work on: identifying your own social strengths and weaknesses, improving verbal communication (conversation and listening), improving non-verbal communication (body language, gestures, posture), recognising emotions in others, and managing social behaviour across different settings — from parties to job interviews to disclosing your ADHD status."
      }
    ],
    "clinician_notes": "Normalise social difficulties before starting exercises. Many clients feel shame about social struggles — validate that these are common ADHD experiences, not personal failures. Adapt exercises to the client''s cultural context, as social norms vary."
  }'::jsonb
),

-- ch8_item_02: Worksheet — Social Skills Questionnaire (Table 8.1)
(
  '00000000-0000-4000-a000-000000080002',
  '00000000-0000-4000-8000-000000000008',
  'worksheet',
  'Social Skills Questionnaire (Table 8.1)',
  'For each social skill below, rate how good you are at it. Be honest — there are no right or wrong answers. This is your baseline. You can also ask a friend or family member to complete it about you for comparison.',
  50,
  'Table 8.1',
  '{
    "fields": [
      {"id": "q1", "label": "Interacting with friends", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q2", "label": "Interacting with strangers", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q3", "label": "Talking to strangers at parties", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q4", "label": "Going to parties", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q5", "label": "Meeting a friend in the pub", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q6", "label": "Listening to people", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q7", "label": "Starting a conversation", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q8", "label": "Asking questions", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q9", "label": "Answering questions", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q10", "label": "Admitting if something has not been understood", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q11", "label": "Looking at people when talking to them", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q12", "label": "Not fidgeting", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q13", "label": "Speaking clearly", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q14", "label": "Recognising how others are feeling", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false},
      {"id": "q15", "label": "Explaining to others about your ADHD diagnosis", "type": "likert", "required": true, "options": ["Never good", "Rarely good", "Sometimes good", "Mostly good", "Always good", "I don''t know"], "score_values": [0, 1, 2, 3, 4, null], "reverse_score": false}
    ],
    "scoring": {
      "method": "sum",
      "max_score": 60,
      "note": "Exclude ''I don''t know'' responses from scoring. A high number of ''I don''t know'' responses suggests limited self-awareness — consider asking family/friends to complete for comparison.",
      "interpretation": {
        "0-20": "Significant social skills difficulties across many areas. Prioritise the lowest-scored items as treatment targets.",
        "21-40": "Moderate difficulties. Several areas could benefit from targeted skills development.",
        "41-60": "Relatively strong social skills. Focus on the specific areas where you scored lower."
      }
    },
    "instructions_for_patient": "Rate yourself honestly. If you are unsure, select ''I don''t know'' — that is useful information too. You can ask someone who knows you well to fill this in separately and compare.",
    "clinician_notes": "Administer at baseline and repeat at module end. If the client rates many items as ''I don''t know'', this itself indicates poor self-awareness of social behaviour — consider having a family member or friend complete a copy. Use discrepancies between self and informant ratings as a basis for discussion."
  }'::jsonb
),

-- ch8_item_03: Psychoeducation — ADHD Speech Characteristics (Table 8.2)
(
  '00000000-0000-4000-a000-000000080003',
  '00000000-0000-4000-8000-000000000008',
  'psychoeducation',
  'ADHD Speech Characteristics and How Others Perceive Them (Table 8.2)',
  'Review this table to understand how common ADHD speech patterns are perceived by others, and what skills you can develop to improve.',
  20,
  'Table 8.2',
  '{
    "content_blocks": [
      {
        "heading": "Rate of Speech",
        "body": "ADHD characteristic: Speaking too quickly, others unable to keep up. How others perceive it: Intense personality, a person who is ''hard work''. Skill to develop: Slowing down and taking breaths between sentences. Use self-talk to remind yourself to ''slow down''. Attend to physiological changes — feeling hot or heart beating faster means you may be speaking too fast."
      },
      {
        "heading": "Clarity",
        "body": "ADHD characteristic: Mumbling. How others perceive it: Lacking in confidence. Skill to develop: Speaking clearly, articulating each word."
      },
      {
        "heading": "Intonation",
        "body": "ADHD characteristic: Speaking at a high pitch. How others perceive it: Overexcitable personality, irrational, histrionic. Skill to develop: Lowering the tone of the voice."
      },
      {
        "heading": "Fluency",
        "body": "ADHD characteristic: Becoming distracted and going off at a tangent. How others perceive it: Disinterested in others, lacking in sincerity. Skill to develop: Keeping track and structuring what is being said."
      },
      {
        "heading": "Volume",
        "body": "ADHD characteristic: Speaking loudly. How others perceive it: Aggressive and intimidating. Skill to develop: Quietening to a moderate volume."
      },
      {
        "heading": "Amount",
        "body": "ADHD characteristic: Talking too much. How others perceive it: Superficial and narcissistic. Skill to develop: Being more succinct, learning to summarise information or get to the point more quickly."
      }
    ],
    "clinician_notes": "Performance may be self-rated or informant-rated according to each variable. Recording sessions and role-play interactions are helpful to demonstrate these patterns. Playback of recordings helps the client become the observer and take an alternative perspective."
  }'::jsonb
),

-- ch8_item_04: Psychoeducation — Conversational Skills (Table 8.3)
(
  '00000000-0000-4000-a000-000000080004',
  '00000000-0000-4000-8000-000000000008',
  'psychoeducation',
  'Conversational Skills Reference (Table 8.3)',
  'Review this table to understand common ADHD conversational patterns and how to improve them.',
  20,
  'Table 8.3',
  '{
    "content_blocks": [
      {
        "heading": "Turn-Taking",
        "body": "ADHD characteristic: Not giving the other person the opportunity to talk. Skill to develop: Allowing equal talking times."
      },
      {
        "heading": "Interruptions",
        "body": "ADHD characteristic: Butting into conversations. Skill to develop: Timing speech appropriately — waiting for others to finish."
      },
      {
        "heading": "Multiple Questioning",
        "body": "ADHD characteristic: Interrogating other people. Skill to develop: Asking questions to stimulate conversation, not to bombard."
      },
      {
        "heading": "Latency",
        "body": "ADHD characteristic: Delaying after someone has asked a question. Skill to develop: Giving a prompt response."
      },
      {
        "heading": "Being Relevant",
        "body": "ADHD characteristic: Wandering off the topic and confusing people. Skill to develop: Keeping the conversation relevant and to the point."
      },
      {
        "heading": "Interesting Content",
        "body": "ADHD characteristic: Conversation is motivated by ADHD individual''s own interest. Skill to develop: Making it of interest to other people to maintain their attention."
      },
      {
        "heading": "Repairing",
        "body": "ADHD characteristic: Being offended by mistakes, e.g. if the other person calls you by the wrong name. Skill to develop: Correcting them politely."
      },
      {
        "heading": "Overenthusiasm",
        "body": "ADHD characteristic: Dominating the conversation, not asking questions or opinions of others, talking about yourself all the time. Skill to develop: Develop listening skills and ask questions."
      }
    ],
    "clinician_notes": "Improvements in these areas can be rated on a Likert scale — either by self-evaluation of progress, self-ratings of observed recordings, or informant-evaluation of progress. Recording sessions and role-play interactions are helpful for demonstrating appropriate vs inappropriate skills."
  }'::jsonb
),

-- ch8_item_05: Psychoeducation — Listening Skills (Table 8.4)
(
  '00000000-0000-4000-a000-000000080005',
  '00000000-0000-4000-8000-000000000008',
  'psychoeducation',
  'Listening Skills Reference (Table 8.4)',
  'Review this table to understand how ADHD affects your ability to listen, and specific skills you can practise.',
  20,
  'Table 8.4',
  '{
    "content_blocks": [
      {
        "heading": "Why Listening Is Hard with ADHD",
        "body": "Listening is a big problem for people with ADHD for two reasons. First, they may not give the other person an opportunity to speak — becoming overly aroused by anxiety or enthusiasm and motivated to fill the gap by talking. Second, they do not adequately attend to what the person is saying, perhaps because they are distracted by noise, activities around them, or focused on what they are going to say next."
      },
      {
        "heading": "Attending",
        "body": "ADHD characteristic: Not maintaining focus on what is being said. Skill to develop: Use attention strategies from Module 4 (Inattention and Memory)."
      },
      {
        "heading": "Acknowledgement",
        "body": "ADHD characteristic: Seeming not to listen. Skill to develop: Respond as though you have heard what has been said — say ''mm'', ''yes'', or nod your head."
      },
      {
        "heading": "Responding",
        "body": "ADHD characteristic: Not noticing a question, or saying ''I don''t know''. Skill to develop: Give acknowledgements like nodding, saying ''oh right''. Share your opinion or give question-type feedback, e.g. ''did you really?''"
      },
      {
        "heading": "Personal Self-Disclosure",
        "body": "ADHD characteristic: Fear of people prying into their private life. Skill to develop: Sharing information can put others at ease."
      },
      {
        "heading": "Reflecting",
        "body": "ADHD characteristic: Forgetting what someone has said. Skill to develop: Repeating back what they said means you have more chance of remembering, and it makes the other person feel that you are listening."
      }
    ],
    "clinician_notes": "Listening skills are a primary target for intervention. Use the Companion Website version of this table in sessions. Have the client practise each skill in role-play before attempting in real social situations."
  }'::jsonb
),

-- ch8_item_06: Worksheet — Verbal Communication Self-Rating (Tables 8.2-8.4)
(
  '00000000-0000-4000-a000-000000080006',
  '00000000-0000-4000-8000-000000000008',
  'worksheet',
  'Verbal Communication Self-Rating (Tables 8.2-8.4)',
  'Rate yourself on each aspect of verbal communication. You can also ask someone who knows you well to rate you separately. Repeat this at the end of the module to track your improvement.',
  50,
  'Tables 8.2, 8.3, 8.4',
  '{
    "fields": [
      {"id": "rate_of_speech", "label": "Rate of speech — Do you slow down and take breaths between sentences?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "clarity", "label": "Clarity — Do you speak clearly and articulate each word?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "intonation", "label": "Intonation — Do you keep a moderate, calm tone of voice?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "fluency", "label": "Fluency — Do you stay on topic without going off on tangents?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "volume", "label": "Volume — Do you speak at a moderate volume?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "amount", "label": "Amount — Are you succinct and get to the point?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "turn_taking", "label": "Turn-taking — Do you give the other person equal time to talk?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "interruptions", "label": "Interruptions — Do you wait for others to finish before speaking?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "listening", "label": "Listening — Do you maintain focus on what the other person is saying?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "acknowledging", "label": "Acknowledging — Do you show you are listening (nodding, ''mm'', ''yes'')?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "reflecting", "label": "Reflecting — Do you repeat back or summarise what the other person said?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false},
      {"id": "relevance", "label": "Relevance — Do you keep the conversation on topic?", "type": "likert", "required": true, "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "score_values": [0, 1, 2, 3, 4], "reverse_score": false}
    ],
    "scoring": {
      "method": "sum",
      "max_score": 48,
      "interpretation": {
        "0-16": "Significant verbal communication difficulties. Focus on 2-3 lowest-scored areas first.",
        "17-32": "Moderate skills. Targeted practice on weaker areas will make a noticeable difference.",
        "33-48": "Strong verbal communication. Fine-tune the specific skills where you scored lower."
      }
    },
    "instructions_for_patient": "Rate yourself honestly. If possible, have a friend or family member rate you on the same items so you can compare perspectives.",
    "clinician_notes": "Administer at baseline and repeat at module end. Use discrepancies between self and informant ratings to guide discussion. Recording a conversation in session and rating it together is very effective."
  }'::jsonb
),

-- ch8_item_07: Psychoeducation — Emotions and Facial Expressions (Table 8.5)
(
  '00000000-0000-4000-a000-000000080007',
  '00000000-0000-4000-8000-000000000008',
  'psychoeducation',
  'Emotions and Facial Expressions (Table 8.5)',
  'Review this list of emotions. You will use it in the emotion recognition exercises that follow.',
  20,
  'Table 8.5',
  '{
    "content_blocks": [
      {
        "heading": "Positive Emotions",
        "body": "Calm, Happy, Excited, Satisfied, Relaxed, Sexy, Loving, Proud, Attentive, Important"
      },
      {
        "heading": "Negative Emotions",
        "body": "Disappointed, Frustrated, Ashamed, Bored, Restless, Tired, Sad, Angry, Frightened, Confused"
      },
      {
        "heading": "How to Use This List",
        "body": "Use this list for the emotion role-play exercise: select an emotion and act it out using only facial expressions, then add body posture and gestures. Your therapist or a partner will try to guess the emotion. Then swap roles. This builds your ability to both express and read emotions accurately."
      }
    ],
    "clinician_notes": "Use this list with magazine photographs, TV programme observation, and role-play exercises. The therapist and client take turns selecting emotions from the list and acting them out. Start with facial expressions only, then progressively add body posture and gestures."
  }'::jsonb
),

-- ch8_item_08: Psychoeducation — How to Communicate Effectively (Figure 8.1)
(
  '00000000-0000-4000-a000-000000080008',
  '00000000-0000-4000-8000-000000000008',
  'psychoeducation',
  'How to Communicate Effectively — Do''s and Don''ts (Figure 8.1)',
  'Review these practical tips on effective social communication. Keep these in mind when practising the exercises in this module.',
  20,
  'Figure 8.1',
  '{
    "content_blocks": [
      {
        "heading": "DO: Personal Space",
        "body": "Make sure personal space is not invaded, and that the other person is not too distant. You stand closer to a friend than to a stranger."
      },
      {
        "heading": "DO: Confident Posture",
        "body": "Stand upright with head held high and self-belief. An upright body posture informs others that attention is being paid."
      },
      {
        "heading": "DO: Establish Eye Contact",
        "body": "Look at the other person in the eye regularly — not avoiding their gaze, and not fixing a stare. Intermittent eye contact shows interest."
      },
      {
        "heading": "DO: Facial Expression and Gestures",
        "body": "Avoid fidgeting. Use appropriate body language and gestures. Nod your head when someone is talking to show understanding and support. Do not forget to smile!"
      },
      {
        "heading": "DON''T: Wrong Volume",
        "body": "Shouting can seem aggressive. Mumbling can seem too passive. Find a balance — speak at a moderate volume."
      },
      {
        "heading": "DON''T: Wrong Pace",
        "body": "Speaking too quickly can make others feel agitated or lose track. Slowing down will be more relaxing for both of you."
      }
    ],
    "clinician_notes": "This figure is available on the Companion Website in handout format. Provide to client as a quick-reference sheet they can review before social events."
  }'::jsonb
),

-- ch8_item_09: Psychoeducation — Emotion Recognition Cues (Table 8.6)
(
  '00000000-0000-4000-a000-000000080009',
  '00000000-0000-4000-8000-000000000008',
  'psychoeducation',
  'Emotion Recognition Cues (Table 8.6)',
  'Learn to read emotional cues from four sources: facial expressions, posture, gestures, and voice quality. This will help you respond more accurately in social situations.',
  20,
  'Table 8.6',
  '{
    "content_blocks": [
      {
        "heading": "Facial Expressions",
        "body": "Happy: eyebrows neutral, eyes screwed up, mouth elongated and corners up. Sad: eyebrows down, eyes lower, corners of mouth down. Angry: eyebrows lowered, eyes wide open, mouth tense, nostrils flaring. Focus on the different movements and patterns of a person''s eyebrows, eyes, and mouth for cues on how someone is feeling."
      },
      {
        "heading": "Posture",
        "body": "Happy: hands in the air, waving, hands outspread — ''open'' presentation. Sad: body bent up, head down, hands to face — ''closed'' presentation. Angry: fist up and clenched, leaning forward. People with ADHD can often forget that their own posture can be read, and may enter situations with an anxious, tense posture."
      },
      {
        "heading": "Gestures",
        "body": "Happy: waving arms about, clapping hands together. Sad: restricted, hands in pocket, shoulders slumped. Angry: fist shaking, finger wagging, pointing, foot stamping. Since people with ADHD tend to fidget and make rapid movements, this can be misinterpreted by others as threatening or distracting."
      },
      {
        "heading": "Voice Quality",
        "body": "Happy: loud, high and variable pitch, fast. Sad: soft, slow, low. Angry: loud, high, harsh. If you have become distracted, establishing the tone of the conversation before jumping back in can prevent you from saying something inappropriate — like making a cheery remark when someone is explaining how unhappy they are."
      }
    ],
    "clinician_notes": "Use this as a reference in sessions. Practise with TV programmes (sound off for facial/posture cues, then with sound for voice quality). Pause videos to discuss what emotion is being displayed and predict how the other person will respond."
  }'::jsonb
),

-- ch8_item_10: Exercise — Non-Verbal Communication TV Exercise
(
  '00000000-0000-4000-a000-000000080010',
  '00000000-0000-4000-8000-000000000008',
  'exercise',
  'Non-Verbal Communication: TV Observation Exercise',
  'Watch a television programme with the sound turned down. Try to work out what is being said and how the speakers feel, based only on their body language, facial expressions, and gestures.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "programme_name", "label": "What programme or clip did you watch?", "type": "text", "required": true, "placeholder": "e.g. a soap opera scene, a talk show interview..."},
      {
        "id": "observations",
        "label": "Describe what you observed",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "character", "label": "Who were you watching?", "type": "text", "placeholder": "e.g. Person A, the woman on the left..."},
          {"id": "emotion_guess", "label": "What emotion do you think they were feeling?", "type": "text", "placeholder": "e.g. angry, nervous, happy..."},
          {"id": "clues", "label": "What non-verbal clues did you pick up on?", "type": "textarea", "placeholder": "e.g. clenched fists, avoiding eye contact, slouched posture..."},
          {"id": "verified", "label": "Did you turn the sound on to check? Were you right?", "type": "textarea", "required": false}
        ],
        "min_items": 2,
        "max_items": 6
      },
      {"id": "reflection", "label": "What did you learn about reading body language from this exercise?", "type": "textarea", "required": true}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Pick a show with lots of conversation — soap operas and reality shows work well. Watch for 5-10 minutes with the sound off, then replay with sound to check your guesses.",
    "clinician_notes": "This can be done in session with a video clip or as homework. Soap operas are recommended as they feature exaggerated emotional expressions. Discuss accuracy and what cues were missed. This builds non-verbal reading skills that are essential for social interaction."
  }'::jsonb
),

-- ch8_item_11: Exercise — Emotion Role-Play Exercise
(
  '00000000-0000-4000-a000-000000080011',
  '00000000-0000-4000-8000-000000000008',
  'exercise',
  'Emotion Role-Play Exercise',
  'Practise expressing and reading emotions with your therapist or a trusted person. Take turns selecting an emotion from the list and acting it out. The other person has to guess the emotion.',
  70,
  'Table 8.5',
  '{
    "fields": [
      {
        "id": "rounds",
        "label": "Record each round of the role-play",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "emotion_acted", "label": "Emotion acted out", "type": "select", "options": ["Calm", "Happy", "Excited", "Satisfied", "Relaxed", "Loving", "Proud", "Attentive", "Disappointed", "Frustrated", "Ashamed", "Bored", "Restless", "Tired", "Sad", "Angry", "Frightened", "Confused"]},
          {"id": "who_acted", "label": "Who acted it out?", "type": "select", "options": ["Me", "Therapist/Partner"]},
          {"id": "guessed_correctly", "label": "Was the guess correct?", "type": "select", "options": ["Yes", "No", "Partially"]},
          {"id": "method_used", "label": "What was used?", "type": "select", "options": ["Facial expression only", "Facial expression + posture", "Facial expression + posture + gestures", "All including voice"]},
          {"id": "notes", "label": "What made it easy or hard to guess?", "type": "textarea", "required": false}
        ],
        "min_items": 4,
        "max_items": 12
      },
      {"id": "reflection", "label": "Which emotions were hardest to express or read? What will you practise more?", "type": "textarea", "required": true}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Start with facial expressions only. Then add body posture. Then add gestures. This progression helps you build up your repertoire of social cues step by step.",
    "clinician_notes": "Start simple (facial expressions only) and progressively add posture, then gestures, then voice. Use the emotion list from Table 8.5. This is meant to be a fun exercise — positive reinforcement of the client''s judgements will build confidence in interpreting social situations."
  }'::jsonb
),

-- ch8_item_12: Exercise — Making and Maintaining Friends
(
  '00000000-0000-4000-a000-000000080012',
  '00000000-0000-4000-8000-000000000008',
  'exercise',
  'Making and Maintaining Friends — Action Plan',
  'Meaningful friendships require mutual effort. People with ADHD often struggle to maintain friendships due to forgetting arrangements, impulsively ending relationships, or not keeping in touch. This exercise helps you create a concrete plan.',
  70,
  NULL,
  '{
    "fields": [
      {
        "id": "current_friendships",
        "label": "List 2-3 friendships you value and want to maintain or improve",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "friend_initial", "label": "Friend (first name or initial)", "type": "text"},
          {"id": "strength", "label": "What is good about this friendship?", "type": "textarea"},
          {"id": "difficulty", "label": "What has been difficult?", "type": "textarea", "placeholder": "e.g. I forget to reply, I cancel plans, I talk about myself too much..."},
          {"id": "action", "label": "One specific thing you will do this week to invest in this friendship", "type": "textarea", "placeholder": "e.g. Send a message asking how they are, set a reminder for their birthday..."}
        ],
        "min_items": 1,
        "max_items": 5
      },
      {"id": "reminder_strategy", "label": "What tools will you use to remember important dates and plans? (phone reminders, calendar, notes app, etc.)", "type": "textarea", "required": true, "placeholder": "e.g. Set birthday reminders in my phone, use a shared calendar for meetups..."},
      {"id": "impulse_pattern", "label": "Have you ever impulsively ended a friendship? What triggered it? What could you do differently next time?", "type": "textarea", "required": false}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Relationships require persistence and flexibility. Use time management strategies from Module 5 to plan meetups and remember important dates.",
    "clinician_notes": "Reinforce that relationships require persistence and flexibility. Link to time management strategies from Module 5. Help the client develop strategies using phone reminders, text messages, and calendar apps. Address any patterns of impulsively ending relationships when feeling let down."
  }'::jsonb
),

-- ch8_item_13: Exercise — Preparing for Social Events with Unfamiliar People
(
  '00000000-0000-4000-a000-000000080013',
  '00000000-0000-4000-8000-000000000008',
  'exercise',
  'Preparing for Social Events with Unfamiliar People',
  'Many people with ADHD feel acutely anxious about entering social situations where they do not know anyone. This exercise helps you prepare conversation topics and strategies in advance so you feel more confident.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "upcoming_event", "label": "Describe an upcoming social event or situation you are nervous about", "type": "textarea", "required": true, "placeholder": "e.g. a work party, a friend''s birthday where I won''t know many people..."},
      {
        "id": "conversation_topics",
        "label": "Prepare 3 conversation topics you can use",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "topic", "label": "Topic", "type": "text", "placeholder": "e.g. a recent news item, a personal anecdote, a question to ask others..."},
          {"id": "type", "label": "Type", "type": "select", "options": ["Current news item", "Personal anecdote", "Question to ask others", "Shared interest", "Other"]}
        ],
        "min_items": 3,
        "max_items": 5
      },
      {
        "id": "negative_thoughts",
        "label": "What negative thoughts do you have about this event? Challenge each one.",
        "type": "repeating_group",
        "required": false,
        "sub_fields": [
          {"id": "thought", "label": "Negative thought", "type": "textarea", "placeholder": "e.g. I will say something stupid and look foolish..."},
          {"id": "challenge", "label": "Challenge to this thought", "type": "textarea", "placeholder": "e.g. One awkward comment does not define me. Most people are focused on themselves."}
        ],
        "min_items": 1,
        "max_items": 5
      },
      {"id": "interaction_rules", "label": "Which ''rules'' of interaction will you focus on? (e.g. turn-taking, body posture, asking questions, not monopolising)", "type": "textarea", "required": true},
      {"id": "key_technique", "label": "Key technique: Get the other person to talk about themselves. What questions will you ask?", "type": "textarea", "required": true, "placeholder": "e.g. What do you do for work? Have you been here before? How do you know the host?"}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Complete this before attending the social event. Having prepared topics and questions will reduce anxiety and give you something to fall back on if you feel stuck.",
    "clinician_notes": "Review strategies the client has found helpful in the past. Rehearse conversation topics in session through role-play. The key technique to teach is getting the other person to talk about themselves by asking questions and listening. Discourage monopolising conversation or talking about themselves all the time."
  }'::jsonb
),

-- ch8_item_14: Exercise — Formal Conversation and Interview Preparation
(
  '00000000-0000-4000-a000-000000080014',
  '00000000-0000-4000-8000-000000000008',
  'exercise',
  'Formal Conversation and Interview Preparation',
  'People with ADHD sometimes appear overly familiar or informal in situations that require formality. This exercise helps you prepare for formal interactions like job interviews, meetings with authority figures, or important conversations.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "upcoming_situation", "label": "Describe the formal situation you need to prepare for", "type": "textarea", "required": true, "placeholder": "e.g. a job interview, a meeting with my manager, a conversation with a doctor..."},
      {
        "id": "impression_management",
        "label": "Impression management checklist",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "area", "label": "Area", "type": "select", "options": ["How to address them (title, formal name)", "Words to avoid (slang, swear words)", "Pace of speech (slow down for serious topics)", "Body language (upright, eye contact, minimal fidgeting)", "Arriving on time (route planned, buffer time)", "Asking for questions to be repeated if needed", "Other"]},
          {"id": "plan", "label": "Your plan for this area", "type": "textarea"}
        ],
        "min_items": 3,
        "max_items": 7
      },
      {"id": "route_and_time", "label": "If you need to travel there: What is your route? What time will you leave? (Include buffer time)", "type": "textarea", "required": false, "placeholder": "Arriving late, hot and flushed is not a good start and will increase anxiety unnecessarily!"},
      {"id": "anxiety_techniques", "label": "What anxiety management techniques will you use before and during the event?", "type": "textarea", "required": false, "placeholder": "e.g. deep breathing, positive self-talk, grounding techniques..."},
      {"id": "rehearsal_notes", "label": "Notes from role-play rehearsal in session", "type": "textarea", "required": false}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Preparation is especially important for people with ADHD because anxiety can make ADHD symptoms worse during formal situations. Practise with your therapist through role-play.",
    "clinician_notes": "ADHD symptoms are exacerbated in formal settings by anxiety — causing distraction, impulsive responses, and fidgeting. Practise asking for questions to be repeated or rephrased. Role-play the scenario in session. For job interviews, work out a route with a time plan. Link to anxiety management techniques from Module 9 if applicable."
  }'::jsonb
),

-- ch8_item_15: Exercise — Refusing Unreasonable Requests
(
  '00000000-0000-4000-a000-000000080015',
  '00000000-0000-4000-8000-000000000008',
  'exercise',
  'Refusing Unreasonable Requests — Advantages and Disadvantages',
  'People with ADHD are often motivated by a need to be liked, which can make them vulnerable to unreasonable demands or exploitation. This exercise helps you evaluate requests before agreeing to them.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "scenario", "label": "Describe a recent situation where someone asked you to do something unreasonable, or where you felt pressured to comply", "type": "textarea", "required": true, "placeholder": "e.g. a friend who always asks me for money, a colleague who dumps their work on me..."},
      {
        "id": "advantages",
        "label": "Advantages of complying with the request",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "advantage", "label": "Advantage", "type": "textarea"}
        ],
        "min_items": 1,
        "max_items": 5
      },
      {
        "id": "disadvantages",
        "label": "Disadvantages of complying with the request",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "disadvantage", "label": "Disadvantage", "type": "textarea"}
        ],
        "min_items": 1,
        "max_items": 5
      },
      {
        "id": "postpone_phrases",
        "label": "Practise postponement phrases — write 2-3 phrases you could use to buy time before deciding",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "phrase", "label": "Phrase", "type": "text", "placeholder": "e.g. ''I''ll give it some thought and come back to you''"}
        ],
        "prefill_suggestions": [
          "OK, I''ll give it some thought and come back to you.",
          "I can''t talk about this right now, but I''ll phone you about it later.",
          "Let me check my schedule and get back to you.",
          "I need some time to think about that."
        ],
        "min_items": 2,
        "max_items": 5
      },
      {"id": "saying_no", "label": "Practise saying ''no'' — write out exactly what you would say to decline this request", "type": "textarea", "required": true},
      {
        "id": "dissenter_thoughts",
        "label": "What negative thoughts do you have about saying no? Challenge them.",
        "type": "repeating_group",
        "required": false,
        "sub_fields": [
          {"id": "thought", "label": "Negative thought (e.g. ''They won''t like me anymore'')", "type": "textarea"},
          {"id": "challenge", "label": "Challenge to this thought", "type": "textarea"}
        ],
        "min_items": 1,
        "max_items": 4
      }
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Important choices should always be made by writing down advantages and disadvantages. If someone pressures you for an immediate answer, use a postponement phrase to buy time.",
    "clinician_notes": "Help the client recognise patterns of people-pleasing and vulnerability to exploitation. Role-play scenarios where the client rehearses saying no. Link to assertiveness techniques in Module 10. For clients who may be pressured into illegal activities, address this directly and challenge negative thoughts about what it means to be a ''dissenter''."
  }'::jsonb
),

-- ch8_item_16: Exercise — Dealing with Criticism
(
  '00000000-0000-4000-a000-000000080016',
  '00000000-0000-4000-8000-000000000008',
  'exercise',
  'Dealing with Criticism — Breaking the Negativity Cycle',
  'People with ADHD are used to being criticised from a young age. Over time, a defensive front develops that can block helpful feedback too. This exercise helps you understand the cycle and learn to separate constructive feedback from hurtful criticism.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "criticism_history", "label": "Think back to your childhood. What labels or criticisms were you given? (e.g. lazy, disruptive, rude, disobedient)", "type": "textarea", "required": true, "placeholder": "List the words that were used about you growing up..."},
      {"id": "defensive_front", "label": "What ''front'' or defence have you developed to protect yourself from criticism?", "type": "textarea", "required": true, "placeholder": "e.g. I act like I don''t care, I get angry, I shut down, I make jokes..."},
      {"id": "negativity_cycle", "label": "The negativity cycle: How does your defensive attitude lead to more negative feedback from others?", "type": "textarea", "required": true, "placeholder": "e.g. When I act like I don''t care, people think I''m lazy, which leads to more criticism, which makes me shut down more..."},
      {"id": "recent_criticism", "label": "Describe a recent piece of criticism you received", "type": "textarea", "required": true},
      {"id": "constructive_part", "label": "What was the constructive part of the feedback? Was there useful advice hidden in the criticism?", "type": "textarea", "required": true},
      {"id": "emotional_reaction", "label": "What was your emotional reaction? What did you actually do?", "type": "textarea", "required": true},
      {"id": "alternative_response", "label": "What could you do differently next time to hear the constructive part without being overwhelmed by the negative feeling?", "type": "textarea", "required": true}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "This is not about accepting unfair criticism. It is about learning to listen to the useful part of feedback so you can grow, while recognising that your defensive reaction is a pattern from childhood that may no longer serve you.",
    "clinician_notes": "This is emotionally sensitive material. Validate the client''s history of criticism. Help them see the negativity cycle: criticism leads to defensive front, which leads to perceived lack of interest, which leads to more criticism. The goal is not to stop all defensiveness but to help the client hear the constructive part of feedback. Link to anger management techniques in Module 10 for specific strategies."
  }'::jsonb
),

-- ch8_item_17: Exercise — Apologising and Admitting Mistakes
(
  '00000000-0000-4000-a000-000000080017',
  '00000000-0000-4000-8000-000000000008',
  'exercise',
  'Apologising and Admitting Mistakes — Perspective-Taking Exercise',
  'Saying sorry is hard because it means admitting an error. People with ADHD have often been blamed or held responsible for things unfairly, which makes apologising even harder. This exercise helps you practise perspective-taking and find common ground.',
  70,
  NULL,
  '{
    "fields": [
      {"id": "recent_conflict", "label": "Describe a recent situation where you said or did something hurtful, or where a disagreement escalated", "type": "textarea", "required": true},
      {"id": "your_perspective", "label": "Your perspective — What were you thinking and feeling? What was your intention?", "type": "textarea", "required": true},
      {"id": "other_perspective", "label": "The other person''s perspective — What do you think they were thinking and feeling? How did your behaviour affect them?", "type": "textarea", "required": true},
      {"id": "common_ground", "label": "Is there common ground? Can you acknowledge their point even if you disagree?", "type": "textarea", "required": true},
      {"id": "apology_script", "label": "Write out what you could say to acknowledge your part and apologise", "type": "textarea", "required": true, "placeholder": "e.g. ''I''m sorry I was late — I know it made you feel like I don''t value your time. I should have called to let you know.''"},
      {"id": "pattern_recognition", "label": "Do you notice a pattern in your conflicts? (e.g. always needing to be right, getting defensive, not seeing the other person''s view)", "type": "textarea", "required": false}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "It is not possible to be right all the time. The ability to compromise is important in relationships. This does not mean you are weak — it means you are mature enough to see both sides.",
    "clinician_notes": "Address the pattern of pedantic argumentation and needing to be ''right''. Use moments in therapy (e.g. arriving late, forgetting homework) as in-vivo opportunities to model expressing feelings and practising apology. The therapist should model expressing their own thoughts and feelings about the client''s behaviour."
  }'::jsonb
),

-- ch8_item_18: Worksheet — ADHD Disclosure Decision-Making
(
  '00000000-0000-4000-a000-000000080018',
  '00000000-0000-4000-8000-000000000008',
  'worksheet',
  'ADHD Disclosure Decision-Making Worksheet',
  'One of the most challenging social issues for people with ADHD is whether to reveal their diagnosis. This worksheet helps you think through the decision carefully for different people in your life.',
  50,
  NULL,
  '{
    "fields": [
      {
        "id": "disclosure_people",
        "label": "For each person or group you are considering telling, work through the questions below",
        "type": "repeating_group",
        "required": true,
        "sub_fields": [
          {"id": "who", "label": "Who are you considering telling?", "type": "text", "placeholder": "e.g. my boss, my partner, my close friend, my parents..."},
          {"id": "relationship_stage", "label": "How well do they know you? What stage is the relationship?", "type": "textarea"},
          {"id": "reasons_for", "label": "Reasons for disclosing", "type": "textarea", "placeholder": "e.g. they could support me, it would explain my behaviour..."},
          {"id": "reasons_against", "label": "Reasons against disclosing", "type": "textarea", "placeholder": "e.g. fear of stigma, worry about discrimination at work..."},
          {"id": "anticipated_reaction", "label": "How do you think they will react?", "type": "textarea"},
          {"id": "timing", "label": "When would be the right time and place to tell them?", "type": "textarea", "required": false},
          {"id": "decision", "label": "Your decision for now", "type": "select", "options": ["Will disclose", "Will not disclose", "Undecided — need more time"]}
        ],
        "min_items": 1,
        "max_items": 5
      },
      {"id": "what_to_say", "label": "For anyone you decide to tell: What will you actually say? How will you explain ADHD in a way they can understand?", "type": "textarea", "required": false, "placeholder": "e.g. ''I was recently diagnosed with ADHD. It affects my concentration and time management, but I''m getting help and learning strategies to manage it.''"},
      {"id": "practical_help", "label": "What practical changes could this person make to help you? (e.g. being precise in instructions, giving written notes, feeding back constructively)", "type": "textarea", "required": false},
      {"id": "support_services", "label": "If you prefer not to disclose publicly, have you considered connecting with ADHD support groups or online communities?", "type": "select", "options": ["Yes, already connected", "Yes, interested", "No, not interested", "I didn''t know these existed"], "required": false}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "There is no right or wrong answer here. Some people tell everyone, some people tell no one, and most are somewhere in between. This is about making a thoughtful decision rather than an impulsive one.",
    "clinician_notes": "This is one of the most hotly debated issues in group treatment sessions. Address anxiety about stigma and misconceptions. Help clients separate ''what is me'' from ''what is ADHD''. Some clients may benefit from the self-description exercise (next item). For clients who disclose indiscriminately, discuss boundaries and appropriate timing. Link to problem-solving techniques from Module 6."
  }'::jsonb
),

-- ch8_item_19: Worksheet — Self-Description: What Is Me vs What Is ADHD
(
  '00000000-0000-4000-a000-000000080019',
  '00000000-0000-4000-8000-000000000008',
  'worksheet',
  'Self-Description: What Is Me vs What Is ADHD',
  'People with ADHD often spend a lot of time trying to separate ''what is me'' from ''what is ADHD''. This exercise helps you build a clearer picture of who you are as a whole person — including your strengths.',
  50,
  NULL,
  '{
    "fields": [
      {"id": "positive_traits", "label": "List as many positive things about yourself as you can — personality traits, talents, things others appreciate about you", "type": "textarea", "required": true, "placeholder": "e.g. creative, loyal, funny, good in a crisis, passionate, kind..."},
      {"id": "adhd_traits", "label": "Which of your traits do you think are connected to ADHD? (These can be positive or negative)", "type": "textarea", "required": true, "placeholder": "e.g. my creativity might be linked to ADHD, my impatience probably is, my energy..."},
      {"id": "personal_traits", "label": "Which traits feel like they are truly ''you'' — not ADHD?", "type": "textarea", "required": true, "placeholder": "e.g. my sense of humour, my values, my love of cooking..."},
      {"id": "desert_island", "label": "Imagine you spend 6 months on a desert island. What would the people in your life miss about you during that time?", "type": "textarea", "required": true, "placeholder": "Think about friends, family, work colleagues, your partner — what would each of them miss?"},
      {"id": "integration", "label": "Looking at all of the above: Can you write a short description of who you are as a whole person? (Include both ADHD-related and personal traits)", "type": "textarea", "required": true, "placeholder": "Write 3-5 sentences about yourself that feel honest and complete."}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Include as many positive aspects about yourself as possible. ADHD is part of who you are, but it does not define you. This exercise will also help you feel more confident about explaining ADHD to others.",
    "clinician_notes": "This exercise is particularly useful after diagnosis and medication treatment, when clients often become preoccupied with separating self from disorder. The goal is integration, not separation — help the client see that ADHD characteristics are part of their whole self, not a foreign entity. The desert island question is powerful for building self-worth through others'' eyes."
  }'::jsonb
),

-- ch8_item_20: Diary — Social Interaction Diary
(
  '00000000-0000-4000-a000-000000080020',
  '00000000-0000-4000-8000-000000000008',
  'diary',
  'Social Interaction Diary',
  'For the next week, log one social interaction per day. Note what went well, what was difficult, and which skills you used. This helps you track your progress and identify patterns.',
  60,
  NULL,
  '{
    "fields": [
      {"id": "log_date", "label": "Date", "type": "date", "required": true},
      {"id": "situation", "label": "Describe the social situation", "type": "textarea", "required": true, "placeholder": "e.g. Had lunch with a colleague, went to a family gathering, met a friend for coffee..."},
      {"id": "who_with", "label": "Who were you with?", "type": "text", "required": true, "placeholder": "e.g. work colleagues, close friend, strangers at a party..."},
      {"id": "skills_used", "label": "Which social skills did you consciously practise?", "type": "checkbox", "required": false, "options": ["Eye contact", "Moderate volume", "Slowed down speech", "Turn-taking", "Active listening", "Asking questions", "Not interrupting", "Reading body language", "Managing fidgeting", "Appropriate formality", "Staying on topic", "Other"]},
      {"id": "went_well", "label": "What went well?", "type": "textarea", "required": true},
      {"id": "was_difficult", "label": "What was difficult?", "type": "textarea", "required": false},
      {"id": "mood_before", "label": "How did you feel before the interaction?", "type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "Very anxious", "5": "Neutral", "10": "Very confident"}, "required": true},
      {"id": "mood_after", "label": "How did you feel after the interaction?", "type": "scale", "scale_min": 1, "scale_max": 10, "scale_labels": {"1": "Very negative", "5": "Neutral", "10": "Very positive"}, "required": true},
      {"id": "one_thing_to_improve", "label": "One thing you will do differently next time", "type": "textarea", "required": false}
    ],
    "scoring": {"method": "none"},
    "instructions_for_patient": "Log one interaction per day for 7 days. It only takes 3-5 minutes. Look for patterns in what situations are easiest and hardest for you.",
    "clinician_notes": "Review the completed diary in session. Look for patterns: which social contexts are most difficult, which skills are being used, mood trends before and after interactions. Use specific entries as starting points for role-play and skills practice."
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
