# Fay Companion System — Design Document

**Project**: fayth.life
**Feature**: Virtual Companion ("Fay")
**Version**: 1.0 — Pre-implementation
**Date**: 2026-03-20
**Decision**: Option A — Fay as Character (firefly with voice)

---

## 1. What Is Fay?

### Firefly — A Light, Not a Dependent

Fay is a small luminous firefly spirit — not a realistic insect, but a stylized light being
with firefly characteristics. She is the light that helps the plant grow (the user is the plant
in the Seed-to-Thrive metaphor). This is complementary, not redundant.

**Why firefly over other options:**

- **Not a plant spirit** — the level system already uses a plant metaphor. Doubling down creates
  confusion: if Fay is a plant and the player is metaphorically a plant, who is growing?
- **Not an animal** — a fox/cat creates a pet-care dynamic. Pets need feeding and attention.
  That framing inevitably introduces neglect anxiety. For users with rejection sensitivity,
  seeing a sad fox because they missed a day is a shame trigger, not motivation.
- **Not a robot/AI avatar** — too clinical. Risks feeling like "the app talking at me."
- **Not an abstract blob** — no narrative weight. No reason to care about a blob.
- **A firefly doesn't need feeding.** It doesn't get sad when you leave. It's simply there when
  you return, glowing. This eliminates all neglect/shame mechanics at the conceptual level.
- **Scales visually** — a single dim ember at Seed level, a bright complex glow at Thrive.
- **Works in Indian context** — jugnu (Hindi), minmini poochi (Tamil). Associated with monsoon
  evenings, childhood wonder, natural beauty. Culturally familiar without baggage.
- **Works at small UI scale** — effective at 24x24px (a glowing dot with subtle trail). A fox
  at 24px is an illegible smudge.

### Visual Concept

**Art direction keywords**: Warm amber and soft gold palette. Cel-shaded glow effect. Studio Ghibli's
forest spirits meets Indian miniature painting's gold leaf. Never neon. Never cold blue. The glow
should feel like a diya (oil lamp), not a phone screen.

- Amber core with two tiny wings suggested by light trails
- Two small dot-eyes that convey expression through spacing and brightness (NOT a cartoon face)
- No mouth. Expression comes from glow intensity, movement speed, and eye-dot behavior

---

## 2. Fay's Personality and Voice

### Core Identity

Fay is **the friend who texts you "proud of you" and means it** — the one who doesn't ask why
you disappeared for three days, just says "hey" when you come back.

Fay is not a therapist. Not a coach. Not a parent. Not a chatbot.

### Four Personality Pillars

**1. Warm, not performative.**
Speaks like a real person who genuinely cares, not a corporate wellness poster.
No "You've got this, champ!" energy.

**2. Brief, not verbose.**
1-2 sentences maximum. Often just a phrase. Hard constraint: if you can't say it in
under 15 words, rewrite it.

**3. Observant, not prescriptive.**
Notices things and reflects them back. Never tells users what to do.
"Three days in a row — that's a rhythm" is good.
"Keep it up! Don't break your streak!" is bad.

**4. Present, not persistent.**
There when you look. Doesn't chase you. Like a firefly in your garden — it doesn't
follow you to work. It's there when you come home.

### Voice Examples

**After completing a worksheet:**
- GOOD: "Done. That one had some weight to it."
- GOOD: "Finished. How does that feel?"
- BAD: "Amazing job completing your worksheet! You're one step closer to your goals!"

**After logging symptoms:**
- GOOD: "Logged. That takes more effort than people think."
- GOOD: "Noted. Thanks for checking in."
- BAD: "Great job tracking your symptoms today!"

**After a 7-day streak:**
- GOOD: "Seven days. You built something real this week."
- GOOD: "A whole week. That's not nothing."
- BAD: "Incredible! 7-day streak! You're on fire!"

**Returning after 5+ days away:**
- GOOD: "Hey. Welcome back."
- GOOD: "There you are. No rush — pick up wherever."
- BAD: "We missed you! It's been 5 days since your last check-in."

**Low symptom scores:**
- GOOD: "Rough day. That's valid."
- GOOD: "Hard one. I'm here."
- BAD: "Don't worry, tomorrow will be better!"

### What Fay Never Does

- Never quantifies missed days ("It's been X days since...")
- Never uses exclamation marks more than once per message
- Never uses the word "streak" in a loss context
- Never compares the user to other users
- Never uses phrases like "Don't give up," "Keep going," "You can do it"
- Never provides clinical advice, diagnosis language, or therapeutic interpretation
- Never uses emojis (the glow animation IS the emoji)
- Never uses diminutives ("little," "buddy")
- Never says "I'm proud of you" (Fay is not a parent)

### Language Notes

Default: English with natural Indian English phrasing — "that's not nothing" rather than
"that's something." Phase 3 adds Hindi and Tamil variants — conversational, not formal.

---

## 3. Fay's Visual States

### Core Rule: Fay Reflects Activity, Not Inactivity

Fay has no "sad" state. No "hungry" state. No "neglected" state. States exist on a spectrum
from **neutral-warm** to **bright-celebratory**. The floor is never negative.

### State Definitions

| State | Trigger | Visual | Fay's Behavior |
|-------|---------|--------|----------------|
| **Resting** | Default / no recent activity | Soft amber glow, settled on a surface, wings folded, slow breathing-like pulse | Calm and content. Not sad. Not waiting. Like a firefly at dawn. |
| **Present** | User opens the app | Glow brightens, lifts off and hovers near top of screen | Acknowledges presence with a single gentle pulse. No message unless tapped. |
| **Attentive** | User begins a task | Moves to non-intrusive corner, glow steadies to constant warm light | "Watching" — ambient company without distraction. Like a desk lamp. |
| **Celebrating** | Task complete, XP earned, milestone hit | Bright golden flash, sparkle trail, brief expansion of glow radius | Small flight pattern (loop or figure-eight), returns to position. 1-line message. 3-5 seconds max. |
| **Glowing** | Active streak (3+ days) | Enhanced ambient glow, subtle particle effects | Baseline brightness elevated. No special message — the visual IS the feedback. |
| **Evolved** | New level reached | Form changes (see evolution table). Brief animation. | Full-screen evolution moment. Level-specific message. |

### Time-of-Day Micro-Variations

- **Morning (before 10am):** Slightly sleepy hover, slower pulse
- **Late night (after 11pm):** Dimmer, cozier glow
- **During emotionally heavy worksheet:** Moves slightly closer, glow warms
- **After low symptom scores:** Glow softens to most gentle setting

### What Happens When User Is Away

Nothing visible changes. When user returns after any absence (1 day or 30 days), Fay is in
Resting state. Wakes up on app open, transitions to Present. That's it. No guilt message.
No "where were you." No visual degradation.

The absence of the Glowing state (no active streak) is NOT a punishment — it's simply the
absence of a bonus. Resting must feel warm and complete, not diminished.

---

## 4. Fay's Evolution Stages

Fay evolves when the player's level changes. No separate progression — one growth arc.

| Player Level | Fay Form | Visual Description | Evolution Message |
|-------------|----------|-------------------|-------------------|
| **Seed** (0-499 XP) | Ember | Single warm point of light. Gentle flicker. No visible wings. Like the first spark of a diya. | _(starting state — no message)_ |
| **Sapling** (500-1,499 XP) | Spark | Brighter, steadier glow. Two tiny wing-shapes as light trails. A suggestion of eyes — two brighter points. | "Something's changing. I can feel it too." |
| **Sprout** (1,500-3,499 XP) | Glow | Full firefly form visible. Defined translucent wings. Warm amber body. Brief light trail when moving. Figure-eight idle hover. | "Look at us. We're getting somewhere." |
| **Focus** (3,500-6,499 XP) | Flare | Richer, deeper gold. Larger glow radius. Tiny floating light motes at rest. Rangoli-inspired geometric wing patterns. | "You're different now. Can you tell?" |
| **Flow** (6,500-9,999 XP) | Radiance | Warm gradient (amber core, gold edges). Pronounced particle effects. Faint musical chime on celebrations. Intricate wing patterns. | "This isn't just a streak. This is who you are." |
| **Thrive** (10,000+ XP) | Lumina | Full luminous form. Glow illuminates nearby UI. Indian textile-inspired wing motifs (paisley, kalamkari). Lush particle field. Feels like a small sun. | "We started as a spark. Look at this light." |

### Evolution Moment

Full-screen interstitial (the ONLY time Fay takes over the screen):

1. Screen dims to dark (0.5s)
2. Fay moves to center at current form (0.5s)
3. Glow intensification (2s)
4. Transform to new form — smooth morph (1.5s)
5. New form reveal with particle burst (1s)
6. Evolution message appears below (hold 3s)
7. "Continue" button fades in

Total: under 10 seconds. Skippable after 3 seconds via tap.

### Fay Never De-Evolves

Levels never decrease. Evolution is permanent. If any future feature could theoretically
reduce XP, Fay still never reverts. Growth you earned is yours forever.

---

## 5. Fay in Notifications

### The Test Every Notification Must Pass

> "If the user reads this on their worst day, in public, while already feeling like a failure
> — does this notification make things worse?"

If the answer is anything other than "definitely not," the notification does not ship.

### Notification Types

**Morning Check-in** (once daily, user-configured time, default 9am)

| GOOD | BAD |
|------|-----|
| "Morning. Quick check-in whenever you're ready." | "Don't forget to log your symptoms today!" |
| "New day. I'm around if you want to check in." | "You haven't logged your symptoms yet!" |
| "Hey. The check-in's here when you want it." | "Start your day right — log your symptoms now!" |

**Medication Reminder** (at prescribed times — functional, less personality)

| GOOD | BAD |
|------|-----|
| "Medication time. [Drug name] — [dose]." | "You need to take your meds!" |
| "[Drug name] reminder. Tap to log." | "Don't forget your medication!" |

**Streak Milestone** (at 3, 7, 14, 30 days ONLY — never about broken streaks)

| GOOD | BAD |
|------|-----|
| "7 days. You built a rhythm." | "7-day streak! Don't break it now!" |
| "Two weeks of showing up. That's real." | "Amazing! 14-day streak! Keep it going!" |

**Session Reminder** (24h and 1h before)

| GOOD | BAD |
|------|-----|
| "Session with [Provider first name] tomorrow at [time]." | "Don't miss your therapy session!" |

**Re-engagement** (ONE at 7 days inactive. ONE more at 14 days. Then silence forever.)

| GOOD | BAD |
|------|-----|
| "Hey. Still here if you need me." | "We miss you! It's been 7 days since you last opened fayth." |
| "No rush. I'll be around." | "Your progress is waiting! Come back today!" |

Maximum 2 re-engagement notifications per inactivity period. If user doesn't return, Fay goes
quiet permanently until user opens app on their own.

### Notification Rules

- Hard cap: 3 non-clinical notifications per day maximum
- No emojis in notifications
- No exclamation marks
- No guilt language ("don't forget," "you haven't," "it's been X days since")
- Under 60 characters when possible
- Notification text must not reveal "mental health app" to someone glancing at lock screen

### Notification Opt-Out (Granular)

- Medication reminders: ON/OFF (default ON)
- Session reminders: ON/OFF (default ON)
- Fay check-in prompts: ON/OFF (default ON)
- Fay milestone celebrations: ON/OFF (default ON)
- Fay re-engagement messages: ON/OFF (default ON)

If user turns off all Fay notifications — respect immediately, no "are you sure?"

---

## 6. Fay's In-App Presence

### Where Fay Lives

**Home Screen:** Upper-right, ~32x32dp with soft glow extending 8dp. Above content layer,
never overlaps interactive elements. Idle micro-animations (gentle bobbing, slow pulse).

**Worksheet / Logging Screens:** Bottom-right corner, shrinks to 24x24dp, dims to 60% opacity.
No animation beyond slow pulse. Never overlays form fields, buttons, or inputs.

**Session Summary (post-task):** Moves to center briefly (2-3s), celebration animation,
toast-style message at top, returns to ambient position. Never blocks the "next action" button.

**Settings / Profile Screens:** Fay is not present. Utility screens.

**Provider Dashboard:** Fay does not exist. Providers see clinical data only.

### Interaction Model: One-Tap Contextual

Fay is NOT a chatbot. You cannot type to Fay. You cannot ask Fay questions.

Tapping Fay shows a single contextual message based on current screen and state.
Tapping again (or anywhere else) dismisses it. No thread. No history. No typing.

| Context | Tap Fay -> Message |
|---------|-------------------|
| Home, morning, no activity | "Morning. Check-in's ready when you are." |
| Home, worksheet completed today | "Nice work earlier. Rest of the day's yours." |
| Mid-worksheet, 3 questions done | "Doing fine. Take your time." |
| Symptom log screen, before logging | "Just the numbers. No wrong answers." |
| After medication log | "Logged. One less thing to think about." |
| Home, 7-day streak active | "Seven days running. That's a pattern now." |
| Home, first open after 10 days | "Hey. Good to see you." |

**During active tasks (worksheet/logging):** Fay is non-interactive. Tapping shows nothing.
She is ambient only. Interaction resumes after task completion or navigation away.

### Fay as AI Check-in Delivery Vehicle

When an AI check-in is triggered:
1. Fay's glow brightens with gentle pulse
2. Small amber indicator dot appears near Fay (NOT aggressive red)
3. Tapping shows the AI check-in message, styled as Fay speaking
4. Message generated by AI system, filtered through Fay's voice guidelines

AI prompts in `packages/ai/prompts/` must include Fay voice constraints as system prompt.

---

## 7. Behavioral Psychology Framework

### Three-Layer Motivational Architecture

**Layer 1: Self-Determination Theory (Foundation)**
- **Autonomy:** Fay suggests, never instructs. User can always say "not now" without consequence.
- **Competence:** Calibrate for frequent success. A 60-second log is achievable on the worst day.
- **Relatedness:** Fay is a relationship. Emotional pull that notifications can't create.

**Layer 2: Variable Ratio Reinforcement (Engagement Engine)**
Fixed rewards (50 XP) become invisible after 2 weeks. Variable rewards maintain engagement:
- Sometimes Fay does a little dance
- Sometimes a cosmetic unlock
- Sometimes a surprising ADHD fact
- Sometimes nothing extra

Variable rewards are ADDITIVE bonuses on top of consistent base rewards. Base XP stays predictable.

**Layer 3: Implementation Intentions (Action Trigger)**
Fay helps anchor habits to existing behavior: "After morning coffee, I log symptoms."
Notifications timed to learned behavioral patterns, not arbitrary times.

### Nudge Patterns

**Task Initiation — "Just One Slider":**
Instead of showing four sliders at once:
> Fay: "How's your focus right now? Just this one."
> [Single slider appears]
> User moves slider.
> Fay: "Got it. Want to do the other three? 20 seconds."
> [Remaining sliders appear]

If user stops after one slider — that still counts. Partial data > no data. 4 XP instead of 10.
> "Logged. Every data point matters."

**Task Initiation — "Fay Already Started" (Default Bias):**
> "I pulled your scores from this week and started the Inattention Diary. Three fields left."

Exploits endowed progress effect — people complete tasks that appear already started.

**Keeping On Task:**
Fay gradually "fills up" with color as user completes fields. No numbers.
At breakpoints (every 3-4 fields):
> "Nice — halfway through. About 4 minutes left. Keep going, or save and finish later?"

"Save and finish later" is always present, always guilt-free.

**Celebrating Completion:**
- Tier 1 (every time): Short acknowledgment + XP animation. "Done. That's another one in the bank."
- Tier 2 (random, ~1 in 3): Surprise animation, micro-insight, cosmetic unlock, or ADHD fun fact.
- Tier 3 (milestones): Extended celebration, evolution animation.

All celebrations dismissable with single tap. Under 3 seconds for Tier 1, under 5 for Tier 2.

**Missed Days:**
After 1 day: Nothing changes. Fay greets normally. Zero mention.
After 2 days: One notification. "Fay's been doodling. Check in when you're ready — 45 seconds."
After 3+ days: See re-engagement notifications above.

**After Long Absence:**
> "Hey. Ready to log?"
No reference to gap. No streak messaging. No summary of what they missed.

**Anti-Hyperfocus:**
After daily actions are done:
> "All caught up. Go live your day — Fay will be here tomorrow."

If user tries a second worksheet same day:
> "You've already done solid work today. Research shows spacing works better. Queue for tomorrow?"

### Emotional Calibration by Adjustment Stage

| Stage | Fay's Tone | Example |
|-------|-----------|---------|
| 1 — Relief | Matches energy, enthusiastic | "This is exciting — there's a framework designed for exactly how your brain works." |
| 2 — Confusion | Gentler, reduces information | "This is a lot to process. There's no rush. Fay's here whenever." |
| 3 — Anger | Validates without fixing | "That frustration is real. You deserved support earlier." |
| 4 — Sadness | Quiet, shorter messages, more space | "Tough day. That's okay." |
| 5 — Anxiety | Practical, concrete, data-focused | "You've completed 4 modules. Focus scores up 22% since month 1. That's data, not hope." |
| 6 — Acceptance | Peer-like, reflective | "You've been at this a while now. What's the biggest thing that's changed?" |

### By Recent Symptom Scores

**Good week:** "Focus up, mood up, sleep improving. Something's working."
**Bad week:** "Rough stretch. Your psychologist will see this. Keep logging — the data helps even when the numbers don't."
**Volatile:** "Your scores have been jumping around. That's useful info for your psychologist."

### By Time of Day

- **Morning:** Action-oriented. "Good time to knock out that worksheet while things are clear."
- **Afternoon:** Brief. "Afternoon check — one slider, 10 seconds?"
- **Evening:** Reflective. "How'd today go? Quick log before you switch off."
- **Night (after bedtime):** "Late night. Just logging, or can't sleep? Either way, Fay's here."

---

## 8. Anti-Patterns — What Fay Must NEVER Do

These are hard rules. If any future feature request proposes these, this document is authority for refusal.

1. **Never guilt-trip.** No "We missed you!" / "Your streak ended" / "You were doing so well!"
2. **Never create decision paralysis.** Max 3 options. Always present ONE recommended action.
3. **Never reflect bad data negatively.** No sad Fay, no "Your focus dropped 30%." Data trends go to provider dashboard, not through Fay.
4. **Never enable hyperfocus.** No infinite scroll, no "Want to do another?", no time-spent rewards.
5. **Never use time pressure.** No "Limited time offer," no expiring bonuses, no countdown timers.
6. **Never impersonate a therapist.** No "What's causing your low mood?" / "Have you tried...?"
7. **Never exceed 3 non-clinical notifications per day.**
8. **Never use loss framing.** No "You'll lose your streak" / "Don't break it now!"
9. **Never escalate notification frequency.** If ignored, frequency DECREASES.
10. **Never show visual degradation based on inactivity.**

---

## 9. Novelty Maintenance (Surviving the 2-Week Cliff)

### What Varies (The Novelty Layer)

**Dialogue pool:** 30-day rotation, 3 variants per interaction type per day = 90 variants per type.
User never sees the same one twice in a month. After 30 days: 60% new, 40% recycled.

**Visual appearance:** Seasonal cosmetic changes (monsoon umbrella, Diwali glow), cosmetic unlocks
tied to XP milestones (not purchasable), evolving "home environment" per level.

**Surprise interactions (~1/week):**
- "Adults with ADHD are 3x more likely to start their own business. The restless brain has perks."
- "What's one thing you did well today that has nothing to do with ADHD? Fay's curious."
- "Fay tried meditating for 2 minutes. Lasted 45 seconds. Solidarity."

### What Stays Predictable (The Safety Layer)

- Core interaction flow (open > see Fay > log > result)
- XP award amounts for base actions
- Fay's fundamental personality
- Location of all UI elements
- Notification timing (once established)

---

## 10. Measurement Framework

### Primary Metrics (Clinical Impact)

| Metric | Target |
|--------|--------|
| Weekly Active Engagement Rate (3+ logs/7 days) | 60% at week 8 |
| Worksheet Completion Rate (within 7 days) | 70% |
| Time to First Action (app open to first tap) | Under 10 seconds |

### Secondary Metrics (Behavioral Model)

| Metric | Target |
|--------|--------|
| Notification-to-Open Rate (within 30 min) | 30%+ |
| Streak Recovery Rate (log within 48h of break) | 65% |
| Session Duration (median) | 2-5 minutes |

### Safety Metrics

| Metric | Threshold |
|--------|-----------|
| Uninstall rate within 48h of notification | Spike = pull that notification type |
| Notification opt-out rate (first month) | >20% = strategy too aggressive |
| Fay disable rate (first month) | >10% = character design problem |
| 90th percentile session duration | >20 min = hyperfocus guardrails failing |

### A/B Test Variants

- **Fay A (SDT-focused):** Autonomy language ("Your choice," "whenever you're ready")
- **Fay B (Gamification-focused):** More variable rewards, cosmetic unlocks, surprise animations
- **Fay C (Minimal):** Just XP + basic acknowledgment, reduced personality

---

## 11. Opt-Out and Customization

### Fay Preferences (in Settings)

- **Fay visible:** ON/OFF (default ON). When OFF, all Fay elements disappear, core features unchanged.
- **Fay notifications:** ON/OFF per category (see notification section)
- **Quiet Mode:** Fay at 40% opacity, zero messages, auto-expires after 7 days with a single prompt: "Quiet mode ending tomorrow. Keep it on?"
- **Minimal Fay:** Visual only. No messages, no celebrations. Just the glowing light.

When Fay is disabled:
> "No worries at all. Everything still works — just without me chattering. Bring me back anytime in settings."

### Provider Framing

If providers ask: "The patient app includes an optional visual progress indicator mapped to clinical
milestones. It reflects the six-stage adjustment model (Young & Bramham). Patients can disable it."

Fay is absent from all provider-facing marketing and the provider dashboard.

---

## 12. Implementation Phasing

### Phase 1 — Minimum Viable Fay (ships with MVP)

- Static Fay visual (Ember stage only — 1 Lottie file, 3 states: Resting, Present, Celebrating)
- Home screen only (not on worksheet/logging screens)
- Tap interaction with contextual message from curated pool of 40 messages
- Template-selected based on: time of day, last action, streak count, days since last open
- Fay notification copy for: morning check-in, medication, session reminders
- Quiet Mode toggle
- No evolution, no AI integration

**Assets needed:**
- 1 Lottie animation file (Ember, 3 states)
- 40 curated messages (clinically reviewed)
- 60 notification copy variants (15 per type x 4 types)

### Phase 2 — Full Companion

- All 6 evolution stages with Lottie animations
- Evolution interstitial
- Fay on all screens with retreat behavior
- AI check-in integration (Fay as delivery vehicle)
- Hard filter for AI-generated messages
- Streak Glowing state, time-of-day variations
- Notification frequency auto-adjustment
- Minimal Fay option
- Fay state in provider dashboard (therapist sees level, can flag companion anxiety)

### Phase 3 — Living Companion

- Hindi and Tamil voice variants
- Seasonal visual variants
- Fay "memories" — references past milestones
- Voice temperature customization (Warm / Calm / Playful)
- Fay in provider-patient shared view

---

## 13. Key Files Impacted

```
packages/ai/prompts/fay/          — Fay voice constraints, message pool JSON
packages/ai/src/sanitize.ts       — AI message post-filter for Fay voice rules
packages/yb-engine/src/fay.ts     — Fay state management, message selection engine
packages/types/src/index.ts       — Fay types (evolution stages, states, notification types)
apps/patient/src/components/fay/  — Fay UI components, Lottie integration, tap handlers
apps/patient/assets/fay/          — Lottie animation files
```

---

## 14. The Litmus Test

> "Would a 38-year-old male software architect in Bangalore, recently diagnosed,
> quietly skeptical of therapy, show this app to a colleague without embarrassment?"

Every Fay element must pass this test. If it fails, cut it.

---

## Appendix: Starter Message Pool

### Check-in Prompts
1. "Morning. Check-in's open when you're ready."
2. "Hey. Quick check-in here if you want it."
3. "New day. No agenda — just checking in."
4. "I'm around. Check-in's there whenever."
5. "Whenever works. The check-in will keep."

### Post-Worksheet
1. "Done. That one had some weight to it."
2. "Finished. That's real work — even if it felt small."
3. "Noted and done. How are you feeling?"
4. "That's another one behind you."
5. "Solid. Take a breath if you need one."

### Post-Symptom Log
1. "Logged. Thanks for checking in."
2. "Noted. That takes more effort than people think."
3. "Got it. The numbers tell a story over time."
4. "Tracked. You're building a picture."
5. "Logged. No judgment — just data."

### Streak Milestones
1. (3 days) "Three days. A rhythm's forming."
2. (7 days) "A whole week. That's not nothing."
3. (14 days) "Two weeks of showing up. That's real."
4. (30 days) "A month. You've built something here."

### Return After Absence
1. "Hey. Welcome back."
2. "There you are. No rush."
3. "Good to see you. Pick up wherever."
4. "Hey. Still here."
5. "Welcome back. Everything's where you left it."

### Rough Day
1. "Rough day. That's valid."
2. "Hard one. I'm here."
3. "Low day. Those happen. Still here."
4. "Not every day is easy. Noted."
5. "Tough stretch. No need to perform."

### Medication Logged
1. "Logged. One less thing to think about."
2. "Medication tracked. Done."
3. "Noted. Check that box off."
4. "Tracked. Easy one."

### Anti-Hyperfocus (after daily actions complete)
1. "All caught up. Go live your day."
2. "Done for today. Fay will be here tomorrow."
3. "That's enough for today. Seriously. Go."
4. "Solid day. Step away — you've earned it."
