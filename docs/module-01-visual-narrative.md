# Module 1 Visual Narrative Design
# "Introduction to ADHD in Adults"

**Project**: fayth.life
**Module**: 1 of 14 (Young-Bramham Programme)
**Date**: 2026-03-21
**Context**: First therapeutic module after diagnosis. Patient is at Seed level, Fay is at Ember stage.

---

## 1. Overall Visual Metaphor: "First Light"

### The Chosen Metaphor

**A seed breaking open underground, with the first thread of light reaching it from above.**

This is not the plant-growing-upward metaphor (that comes later across modules 2-14). Module 1 is about something that happens before growth: the moment the seed cracks. The patient has just received a diagnosis. Something dormant has been named. Light is arriving, but the seed is still underground, still in the dark, still processing.

### Why This Over the Alternatives

- **Seed/sprout metaphor (full growth)** -- too premature. The patient has not grown yet. Showing a sprout at Module 1 undermines the journey. Growth imagery should be earned across modules.
- **Light emerging through clouds** -- too external. Module 1 is deeply internal work. The patient is looking inward, not outward.
- **Path/journey through landscape** -- too concrete, too linear. The adjustment stages are explicitly non-linear. A path implies a fixed sequence.
- **Constellation forming** -- beautiful but too cerebral. Module 1 is about emotion and identity, not pattern recognition.

**"First Light" works because:**

1. It connects to the gamification system -- the patient IS a Seed, and this visualises what "Seed" actually feels like from the inside.
2. It connects to Fay -- Fay is Ember, the first small light. In Module 1, Fay's glow IS the light reaching the seed. The companion and the metaphor are unified.
3. It creates honest emotional space -- being underground is not failure. Seeds are supposed to be underground. The darkness is not despair; it is the natural starting condition before understanding arrives.
4. It sets up every subsequent module -- if Module 1 is "seed cracks open," then Module 2 can be "first root," Module 4 can be "breaking soil," and Module 14 can be "canopy." The entire 14-module arc has a single coherent visual story.

### How It Adapts Per Section

| Content Item | Visual State | What the Patient Sees |
|---|---|---|
| Item 1: What is ADHD? | Darkness with a single warm crack of light appearing above | The seed is whole, untouched. Light has not reached it yet. As the patient reads, a thin amber line appears at the top of the screen -- light from above, finding its way down. |
| Item 2: CBT Model | The crack widens. Two channels of light visible -- one warm (resilience), one cooler (negative cycle) | The seed is still closed but the light is closer. The two-path nature of the CBT model (negative cycle vs. resilience) maps to two streams of light: one that warms, one that cools. |
| Item 3: Adjustment Stages | Light arrives at the seed. The shell begins to crack. Multiple colours refract through the crack. | The emotional peak. Light hitting the seed creates a prismatic moment -- six soft colour washes representing the six stages, all present simultaneously, none dominant. |
| Item 4: Programme Structure | The seed is open. The first pale root-thread extends downward. | The patient has begun to engage. The worksheet (rating module relevance) is the first active gesture -- the seed responding to light. Roots reach toward what matters most. |
| Item 5: Personalising CBT | From the crack, the first pale green shoot reaches upward toward the light. | The patient maps their own patterns. This is the moment the seed becomes something new. The shoot is fragile, tiny, but pointed upward. |

---

## 2. Section Transition Design

### Visual Progression System

The transitions between items use three coordinated channels: background atmosphere, Fay's behaviour, and a structural depth indicator.

### A. Background Atmosphere

The module detail screen currently uses `Colors.background` (#faf9f7) as a flat background. For Module 1, the background becomes a living gradient that shifts as the patient progresses.

**Item 1-2 (Act 1: Understanding)**
- Background: Deep warm charcoal at the bottom of the screen (#2a2520), fading to warm ivory (#faf9f7) at the top
- This creates the "underground looking up" feeling
- The charcoal is NOT black -- it is warm, earthy, the colour of rich soil
- Opacity of the dark gradient: starts at 60%, reduces to 40% by Item 2
- A single thin line of amber light (#D4A852 at 15% opacity) traces down from the top, growing slightly wider between Item 1 and Item 2

**Item 3 (Act 2: Processing)**
- The charcoal recedes to 25% opacity
- The amber line from above now touches the centre of the screen
- Where it touches, a soft prismatic wash radiates outward -- six colours at very low opacity (8-12%), creating a barely-visible rainbow effect in the background
- The six colours (see Section 3 for the stage colour system) pulse gently, fading in and out at different rates, never settling into a fixed pattern

**Item 4-5 (Act 3: Reflecting)**
- The charcoal is gone. Background is fully warm ivory
- The amber light channel remains but is now wider, softer, more ambient
- A very faint green tint (#2f9468 at 5% opacity) begins to appear at the bottom of the screen -- the first hint of the primary brand colour emerging from below
- By Item 5, this green has risen to fill the bottom third of the screen at 8% opacity

### B. Fay's State Changes

Fay is present throughout Module 1 in compact mode (top-right corner, as established in the existing component). Her state changes reflect the narrative:

| Section | Visual State | Behaviour |
|---|---|---|
| Module entry | `resting` | Fay appears as a dim Ember. Barely visible. She is not demanding attention. |
| Item 1 opened | `attentive` | Fay's glow increases slightly. She bobs gently. Her glow is the light from above in the metaphor. |
| Item 2 opened | `attentive` | No change from Item 1. Consistency signals stability. |
| Item 3 opened | `glowing` | Fay's glow intensifies during the adjustment stages. She is present, witnessing. Not celebrating, not sad -- present. This is the companion simply being there during a hard moment. |
| Item 4 started | `attentive` | Back to attentive. The emotional peak has passed. Now there is work to do. Fay is alert, interested, but not intense. |
| Item 5 completed | `celebrating` | Only celebration in the entire module. The full glow, the spark particles. This is earned. |

### C. Structural Depth Indicator

Replace the current flat progress bar with a **depth gauge** that reinforces the underground metaphor.

Instead of a horizontal bar filling left-to-right, display a vertical element on the left edge of the screen: a thin (3px wide) line that starts at the bottom (underground) and grows upward as items are completed. The line uses the ambient colour of each section:

- Items 1-2: amber (#D4A852 at 40% opacity)
- Item 3: shifts through the six stage colours
- Items 4-5: transitions to primary green (#2f9468)

At the top of this line, a small dot (6px) represents "the surface." When all 5 items are complete, the line reaches the dot -- the seed has reached the surface.

This replaces the `progressBarBg` / `progressBarFill` in the module detail header. The text indicator ("3/5 done") remains but moves to below the module title.

---

## 3. Emotional Moment Design: The Six Adjustment Stages

### The Core Challenge

The adjustment stages are the emotional heart of Module 1. The design must communicate:
1. All six feelings are valid -- none is "better" or "worse"
2. Stages are not linear -- patients revisit them
3. This is normalising, not pathologising -- "most people go through this"

### Stage Colour System

Each stage gets a dedicated colour that will be reused throughout the app whenever adjustment stages are referenced (in the patient profile, in provider views, in the adjustment_stage selector in Item 4).

| Stage | Feeling | Colour | Hex | Rationale |
|---|---|---|---|---|
| 1 | Relief & Elation | Warm gold | #D4A852 | Fay's amber -- warmth, light arriving. Relief is the first feeling, and it mirrors the "first light" metaphor. |
| 2 | Confusion & Turmoil | Soft lavender | #9B8EC4 | Neither warm nor cool. Ambiguous. The colour itself is hard to categorise, mirroring the feeling. |
| 3 | Anger | Burnt terracotta | #C4694A | Not aggressive red. Terracotta is earth-toned, warm, associated with clay and hands and making -- anger is constructive energy waiting for a channel. |
| 4 | Sadness & Grief | Deep teal | #4A8C8C | Cool but not cold. Teal is the colour of deep water -- depth, stillness, not emptiness. |
| 5 | Anxiety | Muted sage | #8CAA7E | Green but uncertain. Sage is a living colour that hasn't quite decided what it is yet -- potential that feels nervous. |
| 6 | Acceptance | Primary green | #2f9468 | The brand colour. Acceptance is where the patient's journey aligns with the programme's purpose. This is not a destination but a homecoming. |

### Visual Representation: "The Tide Pool"

The six stages are displayed as a **circular arrangement** rather than a numbered list. This is the single most important visual decision in Module 1.

A numbered vertical list (1, 2, 3, 4, 5, 6) implies linearity, progression, and hierarchy. It says "Stage 6 is the goal and Stage 1 is the start." This directly contradicts the clinical guidance that stages are non-linear and revisited.

Instead, the six stages are arranged in a loose circular/organic cluster -- like stones at the bottom of a tide pool, or like six firefly lights floating in a gentle orbit. Each stage is represented as:

- A softly rounded shape (not a perfect circle -- organic, slightly irregular, like a smooth river stone)
- Filled with its stage colour at 70% opacity
- Labelled with the stage name in white text
- The same size as every other stage

The shapes are arranged in a rough circle with slight overlaps at the edges, suggesting that stages touch and blend into each other. There is no numbered sequence visible. No arrows. No "start here."

At the centre of the arrangement: empty space. Not a label, not a number -- just breathing room. This communicates that there is no single centre, no correct position to occupy.

### Interaction Design

When the patient taps a stage:
- The tapped stage scales up gently (1.0 to 1.08, 200ms ease-out)
- Its colour intensifies to 90% opacity
- The stage's descriptive text appears below the cluster in a card
- A thin coloured line (2px, stage colour) connects the tapped stage to the text card
- Other stages dim slightly (to 50% opacity) but remain visible and tappable
- Fay pulses once in the stage's colour (her halo briefly tints to match)

When no stage is tapped:
- All six are at equal 70% opacity
- A gentle ambient animation rotates a soft highlight around the cluster, briefly brightening each stage in turn (not in order -- randomly), reinforcing that there is no fixed sequence

### "All of This is Valid" Moment

After the patient has tapped and read at least 3 of the 6 stages, a subtle animation triggers:
- All six stages simultaneously pulse to full opacity and return, like a collective heartbeat
- Below the cluster, text fades in: "Wherever you are right now is exactly where you're meant to be."
- Fay glows warmly
- This animation plays once and does not repeat

### Non-Linearity Visual

Below the tide pool cluster, a small illustration shows the same six coloured dots connected by a wandering, looping line -- a path that visits stages in no particular order, doubles back, skips ahead, revisits. This is a static illustration, not interactive. It communicates at a glance: "the path through these stages is yours, and it will not be straight."

---

## 4. Celebration and Completion

### Module 1 Completion Sequence

When the patient completes Item 5 (the final worksheet), the following sequence plays. This is the first celebration moment in the entire app. It must feel earned, warm, and forward-looking -- not performative.

**Phase 1: The Moment (0-1.5s)**
- The screen content fades to 30% opacity
- A full-screen overlay appears with the warm ivory background
- At the centre, the "seed breaking open" illustration from the visual metaphor, but now the shoot has emerged and a tiny leaf is unfurling
- Fay is positioned just above the shoot, glowing at full intensity in `celebrating` state
- Her particles are visible, orbiting gently

**Phase 2: The Acknowledgment (1.5-3s)**
- Text fades in above the illustration:
  - "Module 1 Complete" (FontSizes.lg, Colors.text, weight 700)
  - Below it: "You showed up. That's the hardest part." (FontSizes.md, Colors.textSecondary, weight 400)
- The illustration pulses once, warmly

**Phase 3: XP Reveal (3-4.5s)**
- Below the text, the XP earned fades in with a counting animation:
  - "+160 XP" (the total for Module 1: 20 + 20 + 20 + 50 + 50)
  - The number counts up from 0 to 160 over 1 second
  - Each tick accompanies a soft tactile feedback (Haptics.impactAsync light)
  - The XP text uses Colors.primary, FontSizes.xl, weight 700
- If this XP pushes the patient to a new level, a secondary line appears:
  - "Level up: Sapling" with the Sapling label in a soft green badge

**Phase 4: Looking Forward (4.5-6s)**
- The celebration content slides up slightly
- A card slides in from the bottom:
  - "Coming next: Module 2 -- Assessment"
  - "Now that you understand ADHD and how it affects you, the next step is a structured assessment to map your specific challenges."
  - A "Continue" button (primary green, full width)
  - A "Back to Home" text link below

**Phase 5: Ambient Exit**
- When the patient taps either action, the overlay fades out over 300ms
- The depth gauge on the left edge completes its journey to the top dot
- The module status badge updates to "Complete" with the successLight/success colour scheme

### Design Constraints for Celebration

- No confetti. No fireworks. No particle explosions. These feel performative and hollow for someone processing a recent ADHD diagnosis.
- No sound effects. The patient may be in a public space, in a therapy session, or in bed at 2am.
- Haptic feedback only during the XP count -- subtle, physical, real.
- The tone is quiet pride, not loud excitement. "You showed up" is the message, not "Amazing job!"

---

## 5. Micro-Visual Elements

### A. Progress Indicator: The Depth Gauge

Already described in Section 2C. Implementation details:

- Position: fixed to the left edge of the screen, 16px from left, spanning from the bottom safe area to 60px from the top
- Width: 3px (the line), 6px (the surface dot at top)
- The line grows upward in segments. Each completed item adds 20% of the total height.
- Between segments, the line fades to 15% opacity (indicating uncompleted items above)
- The current active item's position on the line pulses gently
- Touch target: the depth gauge is NOT interactive. It is purely ambient feedback.

In terms of existing code, this replaces the `progressRow`, `progressBarBg`, `progressBarFill` styles in the module detail screen. The text indicator "X/5 done" moves to a subtitle position beneath `moduleTitle`.

### B. Content Item Card Differentiators

The current module detail screen uses `TYPE_CONFIG` to differentiate content types with coloured badges. This is functional but not visually narrative. For Module 1, enhance the card design:

**Psychoeducation Cards (Items 1, 2, 3)**
- Left border: 3px solid, using the current indigo (#6366f1)
- Card background: the existing Colors.surface (#ffffff)
- A small illustration element in the top-right corner of the card: a simplified version of the "light from above" motif -- three thin parallel lines at a slight angle, in amber (#D4A852) at 12% opacity. This subtle watermark-like element signals "this is content to absorb" without being distracting.
- The "Learn" badge remains but changes to an icon-forward design: a small open-book silhouette (8x8px, amber) next to the text

**Worksheet Cards (Items 4, 5)**
- Left border: 3px solid, using primary green (#2f9468)
- A small illustration element in the top-right corner: three thin concentric circles, like ripples in water, in green at 12% opacity. This signals "this is content you create" -- your input radiates outward.
- The "Worksheet" badge changes to include a small pencil-and-paper silhouette (8x8px, green)
- XP value is more prominently displayed: moved from the top-right badge area to a dedicated pill below the title, with a subtle green background

### C. Reading Progress Within Psychoeducation

When a psychoeducation item is expanded (Items 1, 2, 3), the patient scrolls through multiple content blocks. The current `PsychoeducationCard` renders blocks as a flat list with no reading progress indicator.

Replace with a **"light trail" indicator**: a thin vertical line on the left side of the expanded content area. As the patient scrolls, the line fills from top to bottom in amber (#D4A852). Each content block heading has a small dot on this line, and the dot fills when that block scrolls into the viewport.

This is more engaging than page dots (which imply discrete pages when the content is continuous) and more narrative than a scroll indicator (which is purely mechanical).

Implementation: use an `onScroll` handler on the expanded content ScrollView to calculate scroll position and update the fill percentage. The dots at heading positions are calculated from the measured layout of each block.

### D. Content Block Enhancements for Psychoeducation

Within the expanded psychoeducation content, each block currently renders as a plain card with heading and body text. Enhance for Module 1:

**Block headings**: add a thin underline in amber, 2px, spanning 40% of the heading width. This creates a gentle emphasis without the heaviness of bold-and-large styling.

**Pull quotes**: certain sentences in the body text deserve visual emphasis. For example, in Item 1: "ADHD is a neurobiological condition -- it is not caused by laziness, poor parenting, or lack of willpower." These key sentences should be extractable as pull quotes -- displayed in a slightly larger font (FontSizes.md instead of FontSizes.sm), indented with a left border in amber, and with a subtle warm background tint.

Identification of pull quotes should be done in the seed data by adding a `highlights` array to the content block schema, listing sentence ranges that deserve emphasis. This keeps the visual decisions in the data layer, not hardcoded in the component.

---

## 6. Cross-Platform and Mobile Adaptation

### Mobile Screen Size Considerations

The patient app is Expo (React Native), mobile-first. All designs above are specified for mobile. Key constraints:

**Small screens (iPhone SE, 375px width)**
- The tide pool cluster in Item 3 scales down but maintains the circular arrangement. Minimum stage shape size: 56x56px. On small screens, the cluster may need to become scrollable horizontally.
- The depth gauge line thins to 2px
- The celebration overlay text reduces to FontSizes.md for the title
- Content block pull quotes use the same font size as body text but retain the left border and background tint

**Large screens (iPhone 15 Pro Max, 430px width and above)**
- The tide pool cluster has more breathing room between shapes
- The depth gauge can include small labels at each segment ("1/5", "2/5", etc.)
- The celebration illustration can be larger

**Landscape / tablets**
- Not a priority for Phase 1. The module detail screen should simply centre its content with a max-width of 500px and add horizontal padding.

### Accessibility

- All colour choices meet WCAG AA contrast ratios when used for text. Stage colours are never used as text-on-background -- they are always fills with white text on top, or decorative fills behind standard text.
- The tide pool cluster is fully keyboard/screen-reader navigable. Each stage is a tappable element with accessibilityRole="button" and accessibilityLabel that includes the stage name and description.
- The depth gauge is marked with accessibilityElementsHidden={true} since its information is redundant with the text progress indicator.
- All animations respect `AccessibilityInfo.isReduceMotionEnabled`. When reduce motion is on: background gradients are static (no transitions), the tide pool has no ambient rotation animation, the celebration sequence shows all phases simultaneously without transitions, and the XP counter shows the final number without counting up.
- The light trail reading progress indicator provides equivalent information via the block-level "Marked as read" badge that already exists.

---

## 7. Connection to Modules 2-14: The Growing Visual Arc

Module 1's "First Light / Seed Cracking Open" metaphor establishes the foundation for a 14-module visual arc. Each module should have its own visual theme, but all should feel like chapters of the same story.

### The Proposed Arc

| Module | Visual Theme | Metaphor Stage | Background Mood |
|---|---|---|---|
| 1 | First Light | Seed cracks open underground | Dark-to-warm transition |
| 2 | First Root | Root threads extend downward from the open seed | Warm earth tones |
| 3 | Breaking Soil | The shoot pushes through the surface for the first time | Transition from underground to open sky |
| 4 | First Leaves | The seedling has two leaves and is learning to orient to sunlight | Bright daylight, open air |
| 5 | Rings of Growth | The stem thickens. Time rings become visible. | Morning light, golden hour |
| 6 | Branching | The plant branches for the first time -- choices about direction | Midday, full light, multiple shadows |
| 7 | Thorns and Bark | The plant develops protective structures | Afternoon, warm but with contrast |
| 8 | Reaching Toward Others | Branches extend toward neighboring plants | Late afternoon, warm amber light |
| 9 | Storm | Rain falls. The plant bends but doesn't break. | Overcast, rain, dramatic but not threatening |
| 10 | Fire-Resistant Bark | The plant survives a brush fire. Bark is scorched but the core is alive. | Post-fire warm haze, resilience tones |
| 11 | Winter | Leaves fall. The plant looks bare. But the roots are deep. | Cool, muted, bare branches |
| 12 | Night Growth | Growth that happens in darkness, when no one is watching (sleep) | Night sky, starlight, quiet |
| 13 | Pruning | Removing branches that no longer serve the plant | Clear morning after rain, clean lines |
| 14 | Canopy | The plant has become a tree. It provides shade to others. | Golden hour, long shadows, warm completion |

### What This Means for Module 1 Specifically

Every visual choice in Module 1 must be simple enough to leave room for escalation. The background gradient should not use too many colours. The celebration should not be too elaborate. The depth gauge should be a minimal line, not a complex illustration. Module 1 is the most restrained module visually, because everything that follows will build on it.

Fay, too, is at her simplest in Module 1 -- Ember stage, no wings, no particles. As the patient progresses through modules and earns XP, Fay evolves visually. By Module 14, Fay at Lumina is a fully realised light being with wings, particles, and complex glow patterns. Module 1's Ember Fay is the "before" that makes the "after" meaningful.

### Colour System Across Modules

Module 1 establishes the three foundational colours that will recur:
- **Amber (#D4A852)**: Fay, warmth, light, the companion's presence
- **Dark earth (#2a2520)**: where you start, the underground, the before
- **Primary green (#2f9468)**: where the programme takes you, growth, the brand

Every subsequent module can introduce one additional accent colour while maintaining these three as anchors. This prevents visual chaos while allowing each module to feel distinct.

---

## 8. Implementation Notes

### New Constants Required

Add to `/apps/patient/src/lib/constants.ts`:

```typescript
// Adjustment stage colours (used in Module 1 tide pool and patient profile)
export const ADJUSTMENT_STAGE_COLORS: Record<number, string> = {
  1: '#D4A852', // Relief -- Fay's amber
  2: '#9B8EC4', // Confusion -- lavender
  3: '#C4694A', // Anger -- terracotta
  4: '#4A8C8C', // Sadness -- deep teal
  5: '#8CAA7E', // Anxiety -- muted sage
  6: '#2f9468', // Acceptance -- primary green
};

// Module visual theme colours
export const ModuleThemeColors = {
  underground: '#2a2520',
  undergroundLight: 'rgba(42, 37, 32, 0.6)',
  lightBeam: 'rgba(212, 168, 82, 0.15)',
  shootGreen: 'rgba(47, 148, 104, 0.08)',
} as const;
```

### New Components Required

1. **DepthGauge** -- vertical progress indicator, replaces horizontal bar in module detail
2. **TidePool** -- circular stage selector for adjustment stages (Item 3)
3. **LightTrail** -- vertical reading progress indicator for psychoeducation blocks
4. **ModuleCompletionOverlay** -- full-screen celebration sequence
5. **GradientBackground** -- animated background atmosphere for module detail screen

### Files Affected

- `/apps/patient/app/module/[id].tsx` -- add GradientBackground, DepthGauge, enhanced item cards
- `/apps/patient/src/components/PsychoeducationCard.tsx` -- add LightTrail, pull quote rendering
- `/apps/patient/src/components/Fay.tsx` -- add halo colour tinting for stage interaction
- `/apps/patient/src/lib/constants.ts` -- add stage colours and theme colours
- `/supabase/seed/module_01_seed.json` -- add `highlights` arrays to content blocks (optional, Phase 2 enhancement)

### Performance Considerations

- Background gradients should use `react-native-linear-gradient` (already compatible with Expo) rather than SVG overlays
- The tide pool animation should use `useNativeDriver: true` for all transforms
- The depth gauge should NOT re-render on every scroll event -- debounce to 100ms intervals
- The celebration overlay should lazy-load (not mounted until triggered)
- Reduce motion checks should happen once at component mount, not per-animation

---

## 9. Summary: The Emotional Journey in Visual Terms

A patient opens Module 1. The screen is darker at the bottom, lighter at the top -- they are underground, looking up. Fay glows faintly in the corner, a small amber ember. A thin line of light descends from above.

They read about what ADHD is. The light widens. They read about the CBT model -- how negative cycles form, but also how resilience is a natural strength. Two streams of light now.

They reach the adjustment stages. The light arrives at the centre of the screen. Six coloured shapes appear in a loose circle -- not numbered, not ranked, not ordered. They tap "Anger" and read about it. They tap "Relief." They tap "Sadness." After three taps, all six shapes pulse together, once, like a shared heartbeat. Text appears: "Wherever you are right now is exactly where you're meant to be."

They move to the worksheets. The darkness is gone now. The background is warm ivory. They rate which modules matter most to them. They map their own patterns -- the negative thoughts, the coping behaviours, the strengths they already have. Fay watches, attentive.

They finish the last worksheet. The screen quiets. A simple illustration appears: a small shoot emerging from a cracked seed, with Fay glowing above it. "Module 1 Complete. You showed up. That's the hardest part." The XP counts up. A card appears: "Coming next: Assessment."

They tap Continue. The depth gauge completes. The module card now says "Complete" in green.

They are no longer underground.
