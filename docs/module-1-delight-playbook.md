# Module 1 Delight Playbook
## "Introduction to ADHD in Adults"

**Target audience**: Adults 25-40, recently diagnosed with ADHD, India-based
**Emotional context**: This is their FIRST module. They may feel relief, confusion, or vulnerability. Every delight choice must honor that.

---

## 1. Fay Personality Moments

New `FayMessageContext` values needed for Module 1 flow. These extend the existing message pool in `packages/yb-engine/src/fay.ts`.

### 1A. Module Start (first time opening Module 1)

**Context**: `module_start`
**Trigger**: Patient opens Module 1 for the first time (no existing `patient_content_responses` for any `ch1_item_*`)
**Emotional tone**: Warm, grounding, zero pressure

| Variant | Copy |
|---------|------|
| 1 | "First module. No rush -- just read what feels right." |
| 2 | "Starting here is the whole point. Take it slow." |
| 3 | "Module 1. We'll go at your pace." |

**Visual**: Fay transitions from `present` to `attentive`. Glow warms slightly (glowAnim to 0.35 over 800ms).

**Priority**: MUST-HAVE v1

---

### 1B. Between Psychoeducation Readings

**Context**: `between_readings`
**Trigger**: Patient completes one psychoeducation item and the next one is visible/unlocked
**Emotional tone**: Light acknowledgment, no pressure to continue

| After Item | Copy |
|------------|------|
| After "What is ADHD in Adults?" | "Good foundation. The next one connects some dots." |
| After "CBT Model" | "That model comes back later. It'll start to click." |
| After "Six Adjustment Stages" (see 1C) | _(special handling below)_ |

**Visual**: Fay does a single gentle pulse (scale 1.0 -> 1.2 -> 1.0, 600ms, easeInOut). No sparkle. Understated.

**Priority**: MUST-HAVE v1

---

### 1C. Six Adjustment Stages Section

**Context**: `adjustment_stages_reading`
**Trigger**: Patient opens "The Six Stages of Psychological Adjustment After Diagnosis" (ch1_item_03)
**Emotional tone**: Acknowledging, validating, giving space

| Moment | Copy |
|--------|------|
| On opening | "This one's personal. Take the time you need." |
| After completing it | "Heavy reading. Whatever you felt -- that's yours to sit with." |

**What Fay does NOT do here**:
- Does not name which stage the patient might be in
- Does not say "it gets better"
- Does not minimize ("it's totally normal")

**Visual**: Fay dims to 55% opacity and moves to the furthest ambient position (giving emotional space). Glow shifts to warmest/softest setting (glowAnim to 0.15). This is the "I'm here but not in your face" state.

**Priority**: MUST-HAVE v1

---

### 1D. Worksheet Start

**Context**: `worksheet_start`
**Trigger**: Patient opens either worksheet (ch1_item_04 or ch1_item_05)
**Emotional tone**: Framing, practical, removes intimidation

| Worksheet | Copy |
|-----------|------|
| Table 1.1 (relevance ratings) | "No right answers. Just what feels true for you." |
| CBT Model (personal mapping) | "This is your map. Rough is fine -- it's a first draft." |

**Visual**: Fay transitions to `attentive` state (corner position, steady warm light, no animation beyond slow pulse). Standard behavior per the design doc.

**Priority**: MUST-HAVE v1

---

### 1E. After Each Worksheet Completion

**Context**: Uses existing `post_worksheet` context, but with Module 1-specific variants added to the pool.
**Trigger**: `onSubmit` fires successfully from `SteppedWorksheetRenderer`
**Emotional tone**: Proportional celebration. Worksheet 1 (relevance ratings) is lighter work; Worksheet 2 (personal CBT model) is emotionally heavier.

| Worksheet | Copy | Celebration Tier |
|-----------|------|-----------------|
| Table 1.1 | "Rated. Your psychologist will use this to plan ahead." | Tier 1 (acknowledgment + XP) |
| CBT Model | "That took something. Your own map, in your words." | Tier 2 (extended acknowledgment, warm glow) |

**Visual**:
- Tier 1: Standard `celebrating` state (golden flash, 3s). XP counter animation (see Section 2E).
- Tier 2: `celebrating` state held for 4s. Glow radius expands 20% beyond normal celebrating range. Single sparkle trail. Fay moves slightly closer before returning.

**Priority**: MUST-HAVE v1

---

### 1F. Module 1 Completion

**Context**: `module_complete`
**Trigger**: All 5 content items in Module 1 have responses (3 psychoeducation read, 2 worksheets submitted)
**Emotional tone**: Meaningful but not over-the-top. This is the first module -- they have 13 more. Acknowledge without inflating.

| Variant | Copy |
|---------|------|
| 1 | "Module 1, done. You know more about your own brain now." |
| 2 | "First module behind you. That's a real start." |
| 3 | "Done. Everything from here builds on what you just learned." |

**Visual**: Extended celebration sequence (5s total):
1. Fay moves to center-ish position (not full-screen takeover -- that's reserved for evolution)
2. Glow intensifies to `celebrating` peak
3. Brief sparkle trail (if evolution stage supports particles)
4. Returns to ambient position
5. Module completion card appears below with XP summary

**Sound**: Optional subtle chime (only if user has not muted). See Sound section.

**Priority**: MUST-HAVE v1

---

## 2. Micro-Interactions

All animations use React Native's `Animated` API with `useNativeDriver: true` where possible. No Reanimated dependency required for v1 (keeping bundle lean). Upgrade path to Reanimated 3 for Phase 2 if frame-rate issues emerge.

### 2A. Reading Completion (Marking Psychoeducation as Read)

**Trigger**: User taps "Mark as Read" / scrolls to bottom and the `useMarkPsychoeducationRead` mutation fires
**Animation spec**:
- The content card's checkmark/completion indicator fades in (opacity 0 -> 1, 300ms, easeOut)
- Simultaneously, the card border shifts from `Colors.border` to `Colors.success` (spring, 400ms)
- A warm amber highlight washes across the card background (left-to-right gradient sweep, 500ms)
- The "+20 XP" text fades in below the card and floats up 12dp over 800ms while fading out

```
Animated.parallel([
  // Checkmark fade-in
  Animated.timing(checkOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.ease) }),
  // Border color transition (non-native, borderColor not animatable -- use opacity crossfade of overlay)
  Animated.timing(borderHighlight, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease) }),
  // XP float
  Animated.sequence([
    Animated.delay(200),
    Animated.parallel([
      Animated.timing(xpTranslateY, { toValue: -12, duration: 800, easing: Easing.out(Easing.cubic) }),
      Animated.timing(xpOpacity, { toValue: 0, duration: 800, easing: Easing.in(Easing.ease) }),
    ]),
  ]),
])
```

**Duration**: 800ms total
**Sound**: None (too frequent -- 3 readings per module)
**Accessibility**: `accessibilityLiveRegion="polite"` on the "+20 XP" element. Screen readers announce "20 experience points earned" via `accessibilityLabel`.
**Reduced motion**: If `AccessibilityInfo.isReduceMotionEnabled`, skip all animation -- instantly show checkmark and XP text (no float).

**Priority**: MUST-HAVE v1

---

### 2B. Progress Advancement (Moving Between Content Items)

**Trigger**: User navigates from item N to item N+1 in the module detail view
**Animation spec**:
- Current content slides out left (translateX 0 -> -screenWidth * 0.3, opacity 1 -> 0, 250ms, easeIn)
- Next content slides in from right (translateX screenWidth * 0.3 -> 0, opacity 0 -> 1, 300ms, easeOut)
- Progress indicator (the module content list) updates: completed item's circle fills with `Colors.success`, smooth fill animation (scale from center, 200ms)
- Fay does a single micro-bob (translateY 0 -> -2 -> 0, 400ms) to acknowledge forward movement

```
// Content transition
Animated.parallel([
  Animated.timing(outgoingTranslateX, { toValue: -100, duration: 250 }),
  Animated.timing(outgoingOpacity, { toValue: 0, duration: 250 }),
  Animated.timing(incomingTranslateX, { toValue: 0, duration: 300 }),
  Animated.timing(incomingOpacity, { toValue: 1, duration: 300 }),
])
```

**Duration**: 300ms for content swap
**Reduced motion**: Instant content swap, no slide. Progress indicator still updates visually (instant fill, no animation).

**Priority**: NICE-TO-HAVE v1 (functional navigation works without animation)

---

### 2C. Worksheet Field Completion

**Trigger**: User fills in a field and moves focus to the next field (onBlur of a non-empty field)
**Animation spec**:
- Field border briefly pulses with a warm amber tint (borderColor transitions to `FayColors.glow` then back to `Colors.border`, 400ms total)
- A tiny checkmark icon appears at the trailing edge of the field, fading in (opacity 0 -> 0.6, 200ms)
- The progress count in the step header ("3/7 answered") increments with a subtle scale bounce (1.0 -> 1.15 -> 1.0, 300ms)

**What NOT to do**:
- No confetti per field (exhausting on a 7-field worksheet)
- No sound per field (cognitive overload for ADHD users)
- No shake/vibration (associated with errors)

**Duration**: 400ms
**Sound**: None
**Reduced motion**: Checkmark appears instantly. No border pulse. Counter updates without bounce.

**Priority**: NICE-TO-HAVE v1

---

### 2D. Step Transition in Worksheets

**Trigger**: User taps "Next" in the `SteppedWorksheetRenderer` and validation passes
**Current behavior**: Fields simply swap (no transition)
**Enhanced behavior**:

- Current fields fade out slightly and shift left (translateX 0 -> -20, opacity 1 -> 0, 200ms)
- New fields fade in from the right (translateX 20 -> 0, opacity 0 -> 1, 250ms)
- The progress dots animate: current dot scales down (1.3 -> 1.0) while next dot scales up (1.0 -> 1.3), 200ms
- Progress bar fill extends smoothly (width transition over 300ms, easeInOut)
- Fay's glow "fills up" incrementally -- at each step, `glowAnim` increases slightly toward the celebrating threshold. At step 1/3: 0.25, step 2/3: 0.35, step 3/3 (submit): 0.45. This creates the "Fay filling with color" effect described in the companion design doc.

```
// Step transition
Animated.sequence([
  Animated.parallel([
    Animated.timing(currentFieldsX, { toValue: -20, duration: 200 }),
    Animated.timing(currentFieldsOpacity, { toValue: 0, duration: 200 }),
  ]),
  Animated.parallel([
    Animated.timing(nextFieldsX, { toValue: 0, duration: 250 }),
    Animated.timing(nextFieldsOpacity, { toValue: 1, duration: 250 }),
    Animated.spring(activeDotScale, { toValue: 1.3, friction: 6 }),
    Animated.timing(progressBarWidth, { toValue: newWidth, duration: 300 }),
  ]),
])
```

**Duration**: 450ms total
**Sound**: None
**Reduced motion**: Instant field swap. Progress bar jumps. Dot highlights without scale animation.

**Priority**: MUST-HAVE v1 (significantly improves worksheet UX for ADHD users who lose context during abrupt transitions)

---

### 2E. XP Earning Animation

**Trigger**: XP is awarded (after marking psychoeducation read or submitting worksheet)
**Animation spec**:

1. The "+N XP" text appears at the source action's position
2. Text floats upward 20dp while scaling up (1.0 -> 1.2 -> 1.0), 600ms
3. Text fades out during the float
4. If there is a persistent XP counter visible on screen, the counter value does a "count-up" animation from old value to new value (each intermediate number shown for ~50ms)
5. The XP counter briefly glows amber (matching Fay's palette) during the count-up

```
// Float animation
Animated.parallel([
  Animated.timing(xpY, { toValue: -20, duration: 600, easing: Easing.out(Easing.cubic) }),
  Animated.sequence([
    Animated.timing(xpScale, { toValue: 1.2, duration: 200 }),
    Animated.timing(xpScale, { toValue: 1.0, duration: 400 }),
  ]),
  Animated.timing(xpOpacity, { toValue: 0, duration: 600, easing: Easing.in(Easing.quad) }),
])
```

**Duration**: 600ms for float, 400ms for count-up
**Sound**: Subtle "ting" (see Sound section) -- only on worksheet completion (50 XP), not on reading (20 XP)
**Typography**: XP text uses Fay's amber color (`FayColors.glow`), weight 700, size 16dp
**Accessibility**: `accessibilityLiveRegion="assertive"` with label "Earned N experience points"

**Priority**: MUST-HAVE v1

---

## 3. Copy That Sparks Recognition

These are moments where the content can make ADHD adults feel *seen*. The goal is the "finally someone gets it" reaction.

### 3A. Pull-Quotes from Psychoeducation Content

Highlight these phrases within the reading content (visually distinct -- amber left border, slightly larger font, background tint). These already exist in `module_01_seed.json` but need visual treatment:

| Source Block | Pull-Quote | Why It Resonates |
|-------------|------------|-----------------|
| "ADHD Persists into Adulthood" | "Adults are more likely to describe internal restlessness and ceaseless mental activity rather than the physical hyperactivity seen in children." | Most adults don't connect their racing mind to ADHD. This names what they live with daily. |
| "The Three Core Symptoms" | "In adults, these often show up as procrastination, disorganisation, mood lability, low frustration tolerance, and ceaseless mental energy." | The word "procrastination" in a clinical context removes shame. It's a symptom, not a character flaw. |
| "Genetics and Neurobiology" | "ADHD is a neurobiological condition -- it is not caused by laziness, poor parenting, or lack of willpower." | This sentence alone can change a patient's self-narrative. Many have been told exactly these things their entire lives. |
| "The Resilience Factor" | "Adults with ADHD have a remarkable aptitude for cognitive reframing -- reappraising stressful situations positively." | Reframes ADHD as including genuine cognitive strengths, not just deficits. |
| "Stage 3: Anger" | "'Why wasn't I diagnosed sooner?'" | The most common reaction for late-diagnosed adults. Seeing it named in the programme validates years of frustration. |

**Implementation**: Create a `PullQuote` component that wraps these strings with:
- Left border: 3dp, `FayColors.glow` (amber)
- Background: `FayColors.halo` at 15% opacity
- Font size: 1.1x base reading size
- Padding: 16dp vertical, 20dp horizontal
- Corner radius: 0 left, `Radii.md` right

**Priority**: MUST-HAVE v1

---

### 3B. Fay Comments That Name Common Experiences

These are optional Fay messages that can appear as part of the `between_readings` context (tapping Fay during or after specific readings). Not intrusive -- only shown if the user taps Fay.

| During/After | Fay Says (on tap) |
|-------------|-------------------|
| "ADHD Persists" reading | "The 'internal restlessness' part -- a lot of people say that's the one that clicks." |
| "Three Core Symptoms" | "Procrastination isn't laziness. That distinction matters." |
| "Genetics" | "Not willpower. Not parenting. Brain wiring. Worth sitting with that." |
| "CBT Model - Negative Cycle" | "That cycle probably looks familiar. Naming it is the first crack in it." |
| "Resilience Factor" | "You've been reframing without knowing it had a name." |
| "Stage 1: Relief" | "If you feel relieved right now, that's not denial. It's valid." |

**Priority**: NICE-TO-HAVE v1

---

### 3C. Worksheet Placeholder Text

The existing `module_01_seed.json` already has good placeholders. Enhance these to feel more like a warm prompt from someone who understands:

| Field | Current Placeholder | Enhanced Placeholder |
|-------|-------------------|---------------------|
| `neuropsych_deficits` | "List the ones that affect your daily life most..." | "The ones you notice daily -- the keys you can't find, the task you started three times..." |
| `life_events` | "Be honest -- this is about understanding patterns, not blame..." | "No blame here. Just patterns -- things that went sideways because of how your brain works." |
| `negative_thoughts` | "Write the thoughts that come up most often..." | "The thoughts on repeat -- the ones that show up uninvited at 2am..." |
| `negative_behaviours` | "e.g. I avoid opening bills, I drink to calm down, I shut people out..." | _(keep as-is -- already specific and non-judgmental)_ |
| `positive_reappraisal` | "e.g. I never give up, I always find a new way, I'm good at thinking on my feet..." | "What people who know you well would say. The strengths that survive bad days." |
| `positive_thoughts` | "Write thoughts that feel true and motivating to you..." | "Not affirmations -- thoughts that feel actually true, even on a rough day." |
| `top_priorities` | "e.g. Time management and anxiety are my biggest daily struggles..." | "The two or three things that, if they got better, would change your week." |

**Priority**: MUST-HAVE v1 (these placeholders guide vulnerable self-reflection -- quality matters immensely)

---

## 4. Easter Eggs and Personality

### 4A. Tapping Fay Multiple Times Quickly

**Trigger**: 5+ taps on Fay within 2 seconds
**Response**: Fay does a quick dizzy wobble animation (rotate -5deg -> 5deg -> -3deg -> 3deg -> 0, 500ms) and shows a message from a special pool:

| Variant | Copy |
|---------|------|
| 1 | "I'm a firefly, not a piano." |
| 2 | "Still here. Still glowing. Still one tap." |
| 3 | "That's the ADHD curiosity. I respect it." |

**Visual**: After the wobble, Fay's glow briefly intensifies then returns to normal. No XP awarded. No achievement unlocked. Just a personality moment.
**Accessibility**: Screen reader announces "Fay is dizzy" or equivalent playful label.
**Reduced motion**: Skip wobble, still show the message.

**Implementation**: Track tap timestamps in a ref array. Filter to last 2 seconds. If >= 5, fire the easter egg and clear the array. Debounce: don't re-trigger for 10 seconds.

**Priority**: NICE-TO-HAVE v1

---

### 4B. Completing All 5 Items in One Session

**Trigger**: All 5 Module 1 items completed within a single app session (measured by session start timestamp, not calendar day)
**Response**: After the Module 1 completion message, Fay shows an additional message:

> "All of Module 1 in one go. That focus showed up today."

**Visual**: Fay's glow extends slightly beyond normal celebrating radius for 3 extra seconds. Subtle particle burst if at a stage that supports particles.

**Important constraints**:
- This is NOT an "achievement" or "badge" -- no persistent unlock, no gamification layer
- Never shame users who do NOT complete in one session
- Never reference this feat if the user completed across multiple sessions
- If the anti-hyperfocus system would trigger (daily actions already complete), the anti-hyperfocus message takes priority. Do not celebrate binge-completing.

**Priority**: NICE-TO-HAVE v2

---

### 4C. Revisiting Content

**Trigger**: User opens a psychoeducation item they have already marked as read
**Response**: Fay shows a special message on tap:

| Variant | Copy |
|---------|------|
| 1 | "Coming back to this. Smart -- things land differently the second time." |
| 2 | "Re-reading. Good instinct." |
| 3 | "Back here again. Something's clicking." |

**Visual**: No special animation. Standard `present` state. The message itself is the reward.
**Important**: Never track or display "times revisited." The behavior should feel natural, not monitored.

**Priority**: NICE-TO-HAVE v1

---

### 4D. Time-of-Day Variations

**Trigger**: Based on device local time when Module 1 content is opened
**Response**: Fay's messages gain subtle time-awareness (already established in the companion design doc, extending to Module 1 specifically):

| Time | Module 1 Start Message Variant |
|------|-------------------------------|
| Before 10am | "Morning read. Good time for this -- brain's fresh." |
| 10am - 5pm | _(standard variants from 1A)_ |
| 5pm - 9pm | "Evening. Cozy time for Module 1." |
| After 9pm | "Late session. Go at whatever pace feels right." |
| After 11pm | "Late night. We can keep this short. Take what you need." |

**Implementation**: Add a `timeOfDay` field to the `FayContext` interface. The `selectMessage` function filters variants tagged with time windows. Falls back to untagged variants if no time-specific one matches.

**Priority**: NICE-TO-HAVE v2

---

### 4E. First-Time Fay Tap in Module 1

**Trigger**: The very first time a user taps Fay anywhere in Module 1 (tracked via AsyncStorage flag)
**Response**: Instead of the standard contextual message, Fay says:

> "Hey. I'm Fay. I'll be around -- not watching, just here."

This is the only time Fay self-introduces. It establishes the relationship without a tutorial screen.

**Priority**: MUST-HAVE v1

---

## 5. Anti-Patterns: What We Must NOT Do

These are specific delight and gamification patterns that are harmful or counterproductive for adults with ADHD. Each entry includes the pattern, why it's harmful for this audience, and what to do instead.

### 5A. Countdown Timers

**Pattern**: "Complete this worksheet in 10 minutes for bonus XP"
**Why harmful**: Creates time anxiety, which is already elevated in ADHD adults. Rushes reflective work. Punishes slower processing speed, which is a core ADHD feature.
**Instead**: No time references at all. "Take your time" is the implicit design principle.

### 5B. Leaderboards / Social Comparison

**Pattern**: "You're in the top 20% of patients this week"
**Why harmful**: ADHD adults have often spent decades being compared unfavorably. Comparison triggers RSD (Rejection Sensitive Dysphoria). Even "positive" comparison ("you're ahead") creates anxiety about maintaining position.
**Instead**: All progress is measured against self only. No visibility into other patients' data.

### 5C. Loss Aversion / Streak Punishment

**Pattern**: "You'll lose your 7-day streak if you don't log today"
**Why harmful**: Exploits loss aversion, which is amplified in ADHD. Missed days become shame triggers rather than neutral events. Breaks the "Fay never guilt-trips" principle.
**Instead**: Streaks only exist as positive reflection. Missing a day resets the counter silently. Fay never mentions broken streaks. The Resting state is warm, not diminished.

### 5D. Notification Escalation

**Pattern**: "You haven't logged today (sent at 9am, 12pm, 3pm, 6pm)"
**Why harmful**: Multiple reminders about the same missed action create a shame spiral. Each notification is a reminder of "failure." ADHD adults often have complex relationships with authority and obligation.
**Instead**: Maximum one prompt per missed action. If ignored, frequency decreases. See design doc Section 5 rules.

### 5E. Progress Loss / Content Gating by Streak

**Pattern**: "Complete 7 consecutive days to unlock Module 2"
**Why harmful**: Creates artificial barriers that punish executive function difficulties -- the exact symptom being treated. A patient having a bad week loses access to the tool that could help.
**Instead**: Module unlocking is based on completion, not consistency. Gating is sequential (finish Module 1 to unlock Module 2), never streak-based.

### 5F. Excessive Celebration / Toxic Positivity

**Pattern**: "AMAZING!! You're a SUPERSTAR!! Keep CRUSHING it!!"
**Why harmful**: Patronizing for adults. Feels performative and disconnected from the emotional weight of therapeutic work. Especially jarring after a worksheet about grief or anger.
**Instead**: Fay's understated warmth. "Done. That one had some weight to it." Celebration proportional to effort and emotional gravity.

### 5G. Daily Login Bonuses

**Pattern**: "Log in today for 50 bonus XP. Tomorrow: 100 XP"
**Why harmful**: Trains compulsive app-opening rather than meaningful engagement. For dopamine-seeking ADHD brains, this creates the exact addictive pattern we should be counteracting. Turns a therapeutic tool into a mobile game.
**Instead**: XP is earned through meaningful actions (completing worksheets, logging symptoms). Opening the app earns nothing. Value comes from engagement, not presence.

### 5H. Animated Distractions During Input

**Pattern**: Confetti, fireworks, or complex animations while the user is typing in a worksheet field
**Why harmful**: ADHD = distractibility. Animations during focused input pull attention away from reflective work. The worksheet is therapeutic -- the animation competes with it.
**Instead**: All celebration happens AFTER task completion, never during. Fay dims and stills during active input (attentive state).

### 5I. "Share Your Progress" Social Prompts

**Pattern**: "Share your Module 1 completion on WhatsApp"
**Why harmful**: ADHD diagnosis is private medical information. Many Indian adults have not disclosed their diagnosis. A share prompt risks accidental disclosure and creates social pressure.
**Instead**: No share prompts. Ever. If sharing features exist in future phases, they must be deeply buried in settings, never prompted.

### 5J. Variable Punishment Ratios

**Pattern**: Randomly withholding expected XP ("Oops, no XP this time -- try again")
**Why harmful**: Variable punishment creates anxiety and distrust. ADHD adults often have history of unpredictable negative feedback. The reward system must be 100% predictable for base rewards.
**Instead**: Base XP is always awarded for completed actions, every time, no exceptions. Variable rewards are strictly additive surprises on top of the reliable base.

### 5K. Forced Completion / No Partial Credit

**Pattern**: "You must complete all fields to submit this worksheet"
**Why harmful**: Perfectionism and all-or-nothing thinking are common ADHD comorbidities. Requiring 100% completion before any credit creates abandonment risk -- "I can't finish the last field so I'll close the app."
**Instead**: Allow partial saves. "Save and finish later" is always available. Partial completion still shows progress. XP is awarded on final submit, but the data is preserved.

### 5L. Red Error States for Validation

**Pattern**: Aggressive red borders, shake animations, and "REQUIRED" labels on empty fields
**Why harmful**: Shame trigger. Feels like being told off. ADHD adults have extensive history of being corrected and criticized.
**Instead**: Gentle amber highlight (matching Fay's palette) on required fields. Copy reads "This one helps your therapist -- worth filling in" rather than "Required field." Validation appears on attempted navigation, not on blur.

---

## 6. Sound Design Notes

Sounds are optional and respect device mute/vibration settings. All sounds are ambient and warm, never sharp or alarming.

| Moment | Sound | Duration | Notes |
|--------|-------|----------|-------|
| Worksheet completion (50 XP) | Soft chime -- two ascending notes (C5, E5), sine wave, gentle reverb | 600ms | Similar to a singing bowl tap. Warm, not digital. |
| Module completion | Same chime with a third note added (C5, E5, G5 -- a major chord) | 900ms | Feels like a resolution. |
| Reading completion (20 XP) | No sound | -- | Too frequent. Silence is fine here. |
| Fay easter egg (rapid tap) | Very soft "boop" -- single low note (G3) | 200ms | Playful but not loud. |
| All other interactions | No sound | -- | Animations provide sufficient feedback. |

**Implementation**: Use `expo-av` for short audio playback. Preload sounds at module mount. Respect `AccessibilityInfo` for reduced-motion preferences (if reduced motion is on, also skip non-essential sounds).

**Global mute**: Add a "Sounds" toggle in Settings alongside existing Fay preferences. Default: ON for chimes, OFF for notification sounds (those use device notification settings).

**Priority**: NICE-TO-HAVE v2 (v1 ships silent -- animations carry the feedback)

---

## 7. Implementation Priority Matrix

### MUST-HAVE for v1

| Item | Section | Effort Estimate | Dependencies |
|------|---------|----------------|--------------|
| Fay Module Start message | 1A | Low | Add `module_start` to FayMessageContext type, add messages to pool |
| Fay Between Readings messages | 1B | Low | Add `between_readings` context |
| Fay Adjustment Stages sensitivity | 1C | Medium | Need per-item Fay state override in module detail view |
| Fay Worksheet Start messages | 1D | Low | Add `worksheet_start` context |
| Fay Module Completion message | 1F | Medium | Need module completion detection logic |
| Fay First-Tap Introduction | 4E | Low | AsyncStorage flag check |
| Reading completion animation | 2A | Medium | New animated wrapper in module detail view |
| Step transition animation | 2D | Medium | Modify `SteppedWorksheetRenderer` |
| XP earning animation | 2E | Medium | New `XPBadge` animated component |
| Pull-quote component | 3A | Low | New `PullQuote` presentational component |
| Enhanced worksheet placeholders | 3C | Low | Update `module_01_seed.json` |
| Gentle validation styling | 5L | Low | Update `WorksheetRenderer` error styles |

### NICE-TO-HAVE for v1

| Item | Section | Effort Estimate |
|------|---------|----------------|
| Fay experience-naming messages (on tap) | 3B | Low |
| Rapid-tap easter egg | 4A | Low |
| Revisiting content messages | 4C | Low |
| Progress advancement animation | 2B | Medium |
| Worksheet field completion feedback | 2C | Low |

### v2 (Phase 2)

| Item | Section | Effort Estimate |
|------|---------|----------------|
| All-in-one-session acknowledgment | 4B | Low |
| Time-of-day message variants | 4D | Medium |
| Sound design | 6 | Medium |
| Fay glow "filling up" during worksheet | 2D (extended) | Medium |

---

## 8. Type Changes Required

### `packages/types/src/index.ts`

Add new `FayMessageContext` values:

```typescript
export type FayMessageContext =
  | 'checkin_prompt'
  | 'post_worksheet'
  | 'post_symptom_log'
  | 'post_medication'
  | 'streak_milestone'
  | 'return_after_absence'
  | 'rough_day'
  | 'anti_hyperfocus'
  | 'idle'
  // Module-specific contexts (new)
  | 'module_start'
  | 'module_complete'
  | 'between_readings'
  | 'adjustment_stages_reading'
  | 'worksheet_start'
  | 'fay_introduction'
  | 'fay_rapid_tap'
  | 'revisit_content';
```

### `packages/yb-engine/src/fay.ts`

Add Module 1 messages to `MESSAGE_POOL` and extend `selectMessage` to accept optional `moduleId` and `contentItemId` parameters for context-specific message selection.

### New Components Needed

| Component | Location | Purpose |
|-----------|----------|---------|
| `PullQuote` | `apps/patient/src/components/PullQuote.tsx` | Highlighted quote block with amber left border |
| `XPBadge` | `apps/patient/src/components/XPBadge.tsx` | Animated floating XP indicator |
| `AnimatedStepTransition` | Integrated into `SteppedWorksheetRenderer` | Slide transitions between wizard steps |

---

## 9. Emotional Tone Summary by Module 1 Moment

| Moment | Tone | Fay Glow | Animation Energy |
|--------|------|----------|-----------------|
| Module start | Grounding, welcoming | Warm, steady | Minimal |
| Reading "What is ADHD" | Informational calm | Standard present | None |
| Reading "CBT Model" | Engaged, curious | Standard present | None |
| Reading "Adjustment Stages" | Tender, giving space | Dimmed, soft | Fay retreats |
| Worksheet 1 (relevance) | Practical, light | Attentive | Step transitions |
| Worksheet 2 (CBT mapping) | Deeper, reflective | Attentive, warming | Step transitions |
| After Worksheet 1 | Acknowledged | Celebrating (standard) | Tier 1 |
| After Worksheet 2 | Honored | Celebrating (extended) | Tier 2 |
| Module complete | Meaningful, forward-looking | Celebrating (peak) | Extended sequence |
| Revisiting content | Affirming | Standard present | None |
| Late night session | Cozy, no pressure | Dimmed | Minimal |

---

## 10. The Litmus Tests

Every delight element in this playbook must pass ALL of these:

1. **The 38-year-old skeptic test** (from companion design doc): Would a recently diagnosed male software architect in Bangalore show this to a colleague without embarrassment?

2. **The bad-day test**: If a patient reads this on a day when their focus score is 2/10 and they just had a fight with their partner, does this element make things worse?

3. **The repeat-exposure test**: Is this element still pleasant on the 15th viewing, or does it become annoying/patronizing?

4. **The skip test**: Can the user skip, dismiss, or ignore this element with zero consequence? If not, it should not exist.

5. **The therapy-room test**: Would Sunshine (founder, MBBS) feel comfortable if a patient's psychologist saw this element? Does it support the therapeutic relationship or compete with it?
