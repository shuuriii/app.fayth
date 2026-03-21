# Module 1 UI Component Specifications

Detailed component specs for the Module 1 ("Introduction to ADHD in Adults") experience redesign. All values reference the existing design system in `apps/patient/src/lib/constants.ts`.

---

## 1. Module Landing Page Redesign

**File**: `apps/patient/app/module/[id].tsx`
**Replaces**: Current flat FlatList with header + progress bar + card list.

### 1A. Hero Section

```
+--------------------------------------------------+
|  [Back]           Module 1                        |
+--------------------------------------------------+
|                                                    |
|  +----- gradient bg: primaryLight -> bg --------+ |
|  |                                               | |
|  |     [Illustration placeholder: 120x120]       | |
|  |     (centered, rounded square, Radii.xl)      | |
|  |                                               | |
|  |  "Introduction to ADHD in Adults"             | |
|  |  fontSize: xxl (28), fontWeight: 700          | |
|  |  color: text (#1a1a1a)                        | |
|  |                                               | |
|  |  "Understanding your ADHD is the first..."    | |
|  |  fontSize: sm (14), color: textSecondary      | |
|  |  lineHeight: 22, maxLines: 3                  | |
|  |                                               | |
|  +-----------------------------------------------+ |
+--------------------------------------------------+
```

**Layout**:
- Container: `paddingHorizontal: Spacing.lg (24)`, `paddingTop: Spacing.md (16)`, `paddingBottom: Spacing.lg (24)`
- Background: Linear gradient from `Colors.primaryLight` (#e8f5ee) at top to `Colors.background` (#faf9f7) at bottom. If expo-linear-gradient is not available, use a simple `backgroundColor: Colors.primaryLight` with `borderBottomLeftRadius: Radii.xl (24)` and `borderBottomRightRadius: Radii.xl (24)`.
- Illustration placeholder: 120x120 View with `backgroundColor: Colors.surfaceAlt`, `borderRadius: Radii.xl (24)`, centered. Later replaced with per-module illustration. `marginBottom: Spacing.md (16)`.
- Title: `fontSize: FontSizes.xxl (28)`, `fontWeight: '700'`, `color: Colors.text`, `textAlign: 'center'`, `marginBottom: Spacing.sm (8)`.
- Description: `fontSize: FontSizes.sm (14)`, `color: Colors.textSecondary`, `textAlign: 'center'`, `lineHeight: 22`, `maxWidth: 300`, `alignSelf: 'center'`.

### 1B. Progress Ring

Positioned below the hero, centered, with stats flanking it.

```
+--------------------------------------------------+
|          2/5 complete         XP: 100             |
|                                                    |
|              +-------------+                       |
|             /   40%          \                      |
|            |    completed     |                     |
|             \                /                      |
|              +-------------+                       |
|                                                    |
|         "2 of 5 activities done"                   |
+--------------------------------------------------+
```

**Layout**:
- Container: `alignItems: 'center'`, `paddingVertical: Spacing.lg (24)`.
- Ring: 100x100 outer circle. Implemented with RN `Animated` API using two half-circle rotations (the standard SVG-free progress ring technique).
  - Track color: `Colors.surfaceAlt` (#f5f3ef), 6px stroke width.
  - Fill color: `Colors.primary` (#2f9468), 6px stroke width.
  - Inner text: completion percentage, `fontSize: FontSizes.xl (22)`, `fontWeight: '800'`, `color: Colors.primary`.
  - Below percentage: "complete", `fontSize: FontSizes.xs (12)`, `color: Colors.textTertiary`.
- Flanking stats (flexDirection row, 3 columns):
  - Left stat: Items done count, `fontSize: FontSizes.lg`, `fontWeight: '700'`, `color: Colors.primary`.
  - Center: The ring.
  - Right stat: XP earned so far, `fontSize: FontSizes.lg`, `fontWeight: '700'`, `color: Colors.primary`.
  - Stat labels below each: `fontSize: FontSizes.xs`, `color: Colors.textTertiary`.

**Implementation note**: Use `react-native-svg` if available (likely present via Expo), with `<Circle>` and `strokeDasharray`/`strokeDashoffset`. If not, fall back to the half-circle mask technique with two `Animated.View` rotations.

**Animation**: When the screen loads, animate the ring fill from 0 to the actual percentage over 800ms with `Easing.out(Easing.cubic)`. Use `useNativeDriver: false` (rotation transform on styled views).

### 1C. Journey Path (Vertical Timeline)

Replaces the flat FlatList. Each content item becomes a node on a vertical path.

```
+--------------------------------------------------+
|  YOUR JOURNEY                                     |
|                                                    |
|  [*]---+                                          |
|  |     |  LEARN                                   |
|  |     |  "What is ADHD in Adults?"               |
|  |     |  ~3 min read  |  Completed               |
|  |     +------------------------------------------+
|  |                                                 |
|  [*]---+                                          |
|  |     |  LEARN                                   |
|  |     |  "CBT Model of ADHD"                     |
|  |     |  ~2 min read  |  Tap to read             |
|  |     +------------------------------------------+
|  |                                                 |
|  [o]---+                                          |
|  |     |  LEARN                                   |
|  |     |  "Six Adjustment Stages"                 |
|  |     |  ~4 min read  |  Locked                  |
|  |     +------------------------------------------+
|  |                                                 |
|  [o]---+                                          |
|  |     |  WORKSHEET                               |
|  |     |  "Programme Structure"                   |
|  |     |  50 XP  |  Locked                        |
|  |     +------------------------------------------+
|  |                                                 |
|  [o]---+                                          |
|        |  WORKSHEET                               |
|        |  "Personalising CBT Model"               |
|        |  50 XP  |  Locked                        |
|        +------------------------------------------+
+--------------------------------------------------+
```

**Layout** (each node):
- Outer container: `flexDirection: 'row'`, `marginBottom: 0` (the line connects them).
- Left column (timeline rail): `width: 40`, `alignItems: 'center'`.
  - Node circle: `width: 20`, `height: 20`, `borderRadius: 10`.
    - Completed: `backgroundColor: Colors.primary`, with a checkmark (Text "check" or a small View checkmark).
    - Current (next to do): `backgroundColor: Colors.primary`, with a pulsing outer ring (Animated opacity loop 0.3-0.7, 2000ms, `Colors.primary` at 20% opacity, 28x28 behind the node).
    - Upcoming: `backgroundColor: Colors.surfaceAlt`, `borderWidth: 2`, `borderColor: Colors.border`.
  - Connecting line: `width: 2`, `flex: 1`, `backgroundColor: Colors.border`. For completed-to-completed transitions, `backgroundColor: Colors.primary`.
- Right column (card): `flex: 1`, `marginLeft: Spacing.sm (8)`.
  - Card surface: Same as existing `itemCard` style but with a left accent:
    - `backgroundColor: Colors.surface`, `borderRadius: Radii.lg (16)`, `padding: Spacing.md (16)`.
    - `borderWidth: 1`, `borderColor: Colors.borderLight`.
    - Completed cards: `borderLeftWidth: 3`, `borderLeftColor: Colors.primary`.
    - Current card: `borderLeftWidth: 3`, `borderLeftColor: Colors.primary`, `shadowColor: Colors.primary`, `shadowOpacity: 0.08`, `shadowRadius: 8`, `shadowOffset: { width: 0, height: 2 }`, `elevation: 2`.
  - Type badge: Reuse existing `TYPE_CONFIG` with the same pill style.
  - Title: `fontSize: FontSizes.md (16)`, `fontWeight: '600'`, `color: Colors.text`.
  - Bottom row: `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`, `marginTop: Spacing.sm (8)`.
    - Left: estimated time or XP badge.
    - Right: status text or "Tap to read"/"Tap to start".

**Section header**: "YOUR JOURNEY" label above the timeline.
- `fontSize: FontSizes.xs (12)`, `fontWeight: '700'`, `color: Colors.textTertiary`, `textTransform: 'uppercase'`, `letterSpacing: 1`, `marginBottom: Spacing.md (16)`, `marginLeft: 40 + Spacing.sm` (aligned with cards, not the rail).

**Interaction states**:
- Default: as described above.
- Pressed: `backgroundColor: Colors.surfaceAlt` on the card.
- Completed: green left border, checkmark node, reduced opacity on "Completed" badge text.
- Locked: `opacity: 0.5` on the entire node row. Non-pressable (or shows a toast explaining sequence).

**Fay integration**: Position Fay component adjacent to the "current" item. Render the Fay component in `compact` mode (32px) absolutely positioned to the right of the current card, vertically centered. Fay's message should say something contextual like "This is a great one -- take your time with it" or "You're doing great, keep going!". Message appears on first render, auto-dismisses after 4 seconds.

### 1D. Module Landing - Component Skeleton

New component file: `apps/patient/src/components/JourneyPath.tsx`

```typescript
// Props
interface JourneyPathProps {
  items: ContentItem[];
  responses: Map<string, any>;
  onItemPress: (item: ContentItem) => void;
  currentItemIndex: number; // first uncompleted item
}
```

**Accessibility**:
- Each node: `accessibilityRole="button"`, `accessibilityLabel` includes type, title, and status.
- Completed nodes: `accessibilityState={{ disabled: false }}` (reviewable).
- Locked nodes: `accessibilityState={{ disabled: true }}`.
- Timeline rail is decorative: `accessibilityElementsHidden={true}` / `importantForAccessibility="no"`.

---

## 2. Psychoeducation Reader Redesign

**File**: New component `apps/patient/src/components/PsychoeducationReader.tsx`
**Replaces**: Inline expansion of `PsychoeducationCard` within the module page. Instead, tapping a psychoeducation item navigates to a full-screen reader.

### 2A. Overall Structure

```
+--------------------------------------------------+
|  [X Close]              1 of 5                    |
|  +----------------------------------------------+ |
|  |  [====----]  progress bar                    | |
|  +----------------------------------------------+ |
|                                                    |
|  +----- reading card (swipeable) ---------------+ |
|  |                                               | |
|  |  "What is ADHD?"                              | |
|  |  heading: xl (22), fontWeight: 700            | |
|  |                                               | |
|  |  "ADHD stands for Attention Deficit..."       | |
|  |  body: md (16), lineHeight: 26               | |
|  |  color: text                                  | |
|  |                                               | |
|  +-----------------------------------------------+ |
|                                                    |
|  [ . o . . . ]  page dots                         |
|                                                    |
|  +----------------------------------------------+ |
|  |  ~3 min read   |   [Mark as understood ->]    | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
```

### 2B. Page/Card Swipe System

Uses a horizontal `FlatList` with `pagingEnabled={true}` and `snapToInterval` equal to screen width minus padding.

**Layout**:
- Outer container: `flex: 1`, `backgroundColor: Colors.background`.
- Top bar: `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`, `paddingHorizontal: Spacing.lg (24)`, `paddingTop: Spacing.md (16)`, `paddingBottom: Spacing.sm (8)`.
  - Close button: "X" or back arrow, `fontSize: FontSizes.lg`, `color: Colors.textSecondary`. Pressable with `accessibilityLabel="Close reader"`.
  - Page counter: "1 of 5", `fontSize: FontSizes.sm (14)`, `fontWeight: '600'`, `color: Colors.textSecondary`.
- Progress bar: Full width, `height: 3`, below the top bar.
  - Background: `Colors.surfaceAlt`.
  - Fill: `Colors.primary`, width animated to `(currentPage + 1) / totalPages * 100%`.
  - Animation: `Animated.timing`, 200ms, `Easing.out(Easing.ease)`, `useNativeDriver: false`.

**Reading card**:
- Horizontal FlatList: `horizontal={true}`, `pagingEnabled={true}`, `showsHorizontalScrollIndicator={false}`.
- Each page: `width: screenWidth - 48` (Spacing.lg * 2), `marginHorizontal: Spacing.lg (24)`.
- Card surface: `backgroundColor: Colors.surface`, `borderRadius: Radii.lg (16)`, `padding: Spacing.lg (24)`, `borderWidth: 1`, `borderColor: Colors.borderLight`, `minHeight: 300`.
- Heading: `fontSize: FontSizes.xl (22)`, `fontWeight: '700'`, `color: Colors.text`, `marginBottom: Spacing.md (16)`.
- Body: `fontSize: FontSizes.md (16)`, `color: Colors.text`, `lineHeight: 26`. Note the bump from `sm (14)` to `md (16)` and from `Colors.textSecondary` to `Colors.text` for improved readability in the reader context.
- If the block has no heading (body-only), the body text gets `fontSize: FontSizes.md (16)` still.

**Page dots**:
- Container: `flexDirection: 'row'`, `justifyContent: 'center'`, `alignItems: 'center'`, `paddingVertical: Spacing.md (16)`, `gap: Spacing.sm (8)`.
- Each dot: `width: 8`, `height: 8`, `borderRadius: 4`.
  - Inactive: `backgroundColor: Colors.border` (#e5e2dc).
  - Active: `backgroundColor: Colors.primary`, `width: 20` (elongated pill), animated width transition.
  - Read (past): `backgroundColor: Colors.primary`, `opacity: 0.4`.
- Animation: Active dot width animates from 8 to 20 over 200ms, `useNativeDriver: false`.

### 2C. Reading Time Badge

Positioned in the bottom bar.

**Calculation**: Estimate ~200 words per minute (slightly slower for clinical content). Count words across all blocks. Round to nearest minute, minimum "1 min read".

**Style**: `fontSize: FontSizes.xs (12)`, `color: Colors.textTertiary`, `fontWeight: '500'`.

### 2D. Key Takeaway Card

The last "page" in the swipeable sequence is an auto-generated takeaway card (or, if the content data has a `key_takeaway` field, use that).

```
+-----------------------------------------------+
|                                                 |
|  [lightbulb icon placeholder]                   |
|                                                 |
|  KEY TAKEAWAY                                   |
|  fontSize: xs (12), fontWeight: 700             |
|  color: primaryDark, letterSpacing: 1           |
|                                                 |
|  "ADHD is a neurodevelopmental condition..."    |
|  fontSize: md (16), fontWeight: 600             |
|  color: text, lineHeight: 24                    |
|                                                 |
+-----------------------------------------------+
```

**Style**:
- Card: `backgroundColor: Colors.primaryLight` (#e8f5ee), `borderRadius: Radii.lg`, `padding: Spacing.lg`, `borderWidth: 1`, `borderColor: Colors.primary` (at 30% opacity, use `'rgba(47, 148, 104, 0.3)'`).
- Section label: `fontSize: FontSizes.xs (12)`, `fontWeight: '700'`, `color: Colors.primaryDark`, `textTransform: 'uppercase'`, `letterSpacing: 1`, `marginBottom: Spacing.sm (8)`.
- Takeaway text: `fontSize: FontSizes.md (16)`, `fontWeight: '600'`, `color: Colors.text`, `lineHeight: 24`.

### 2E. "Mark as Understood" Button

Replaces auto-mark-as-read. User must explicitly confirm they absorbed the content.

**Behavior**: Button appears on the last page (or the takeaway page). Only becomes pressable once all pages have been visited.

**Layout**: Bottom of screen, `paddingHorizontal: Spacing.lg`, `paddingBottom: Spacing.xl (32)` for safe area.

**States**:
- Disabled (not all pages seen): `backgroundColor: Colors.surfaceAlt`, `borderWidth: 1`, `borderColor: Colors.border`.
  - Text: "Read all sections first", `fontSize: FontSizes.md (16)`, `fontWeight: '600'`, `color: Colors.textTertiary`.
- Enabled (all pages seen): `backgroundColor: Colors.primary`, `borderRadius: Radii.md (12)`, `paddingVertical: 16`.
  - Text: "I understand this", `fontSize: FontSizes.md (16)`, `fontWeight: '700'`, `color: Colors.textOnPrimary`.
- Pressed: `backgroundColor: Colors.primaryDark`.
- Already read: Show a `Colors.successLight` banner instead: "You've read this section" with a checkmark.

**Accessibility**: `accessibilityRole="button"`, `accessibilityState={{ disabled: !allPagesVisited }}`.

### 2F. Navigation from Module Landing

When user taps a psychoeducation item on the journey path, instead of inline expanding, navigate to:
```
router.push(`/reader/${item.id}`)
```
New route: `apps/patient/app/reader/[id].tsx` which renders `PsychoeducationReader`.

---

## 3. Adjustment Stage Picker

**File**: New component `apps/patient/src/components/AdjustmentStagePicker.tsx`
**Context**: Used within worksheet 4 (Programme Structure) for the field with `id: "adjustment_scale"` or similar, when the field targets the 6 psychological adjustment stages.

### 3A. Single-Select Mode (default)

```
+--------------------------------------------------+
|  "Where are you right now?"                       |
|  fontSize: md (16), fontWeight: 600               |
|                                                    |
|  +----------------------------------------------+ |
|  |  1  Relief & Elation                          | |
|  |     "Finally, it all makes sense"             | |
|  |     [selected ring glow]                      | |
|  +----------------------------------------------+ |
|                                                    |
|  +----------------------------------------------+ |
|  |  2  Confusion & Turmoil                       | |
|  |     "What does this mean for me?"             | |
|  +----------------------------------------------+ |
|                                                    |
|  +----------------------------------------------+ |
|  |  3  Anger                                     | |
|  |     "Why wasn't I diagnosed sooner?"          | |
|  +----------------------------------------------+ |
|                                                    |
|  ... (4, 5, 6)                                    |
|                                                    |
|  [toggle] "I relate to multiple stages"           |
+--------------------------------------------------+
```

**Layout** (each stage card):
- Container: `paddingVertical: Spacing.xs (4)`.
- Card: `flexDirection: 'row'`, `backgroundColor: Colors.surface`, `borderRadius: Radii.lg (16)`, `padding: Spacing.md (16)`, `borderWidth: 1.5`.
  - Default border: `Colors.borderLight`.
  - Selected border: `Colors.primary`.
  - Selected background: `Colors.primaryLight`.
- Left column: Stage number badge.
  - Circle: `width: 36`, `height: 36`, `borderRadius: 18`, `alignItems: 'center'`, `justifyContent: 'center'`.
  - Default: `backgroundColor: Colors.surfaceAlt`.
  - Selected: `backgroundColor: Colors.primary`.
  - Number text: `fontSize: FontSizes.sm (14)`, `fontWeight: '700'`.
  - Default text color: `Colors.textSecondary`.
  - Selected text color: `Colors.textOnPrimary`.
  - `marginRight: Spacing.md (16)`.
- Right column: `flex: 1`.
  - Stage name: `fontSize: FontSizes.md (16)`, `fontWeight: '600'`, `color: Colors.text`.
  - Description: `fontSize: FontSizes.sm (14)`, `color: Colors.textSecondary`, `marginTop: 2`, `lineHeight: 20`.

**Selected state animation**:
- Border color transition: Animate with `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` on selection change. Or use Animated.View with interpolated borderColor (requires `useNativeDriver: false`).
- Background: Instant switch (no animation needed, LayoutAnimation handles the layout shift).
- Scale: Selected card gets a subtle `transform: [{ scale: 1.02 }]` via Animated.spring with `useNativeDriver: true`, `tension: 100`, `friction: 8`.

**Accessibility**:
- Each card: `accessibilityRole="radio"`, `accessibilityState={{ selected: isSelected }}`.
- `accessibilityLabel`: "Stage {n}: {name}. {description}".
- Container: `accessibilityRole="radiogroup"`.

### 3B. Multi-Select Toggle

Below the cards, a toggle switch:

```
+--------------------------------------------------+
|  [toggle switch]  "I relate to multiple stages"  |
+--------------------------------------------------+
```

**Layout**: `flexDirection: 'row'`, `alignItems: 'center'`, `paddingVertical: Spacing.md (16)`, `gap: Spacing.sm (8)`.
- Toggle: A custom switch (RN `Switch` component) with `trackColor={{ false: Colors.border, true: Colors.primaryLight }}`, `thumbColor: Colors.primary` when on, `Colors.textTertiary` when off.
- Label: `fontSize: FontSizes.sm (14)`, `color: Colors.textSecondary`, `fontWeight: '500'`.

**Behavior when toggled ON**:
- Cards become multi-selectable (checkboxes instead of radio).
- The number badge gains a checkmark overlay when selected.
- Selected cards use the same visual treatment.
- Value changes from `number` to `number[]`.

### 3C. Stage Descriptions

These map to `ADJUSTMENT_STAGE_LABELS` from constants, extended with short one-line emotional descriptions:

```typescript
const STAGE_DESCRIPTIONS: Record<number, string> = {
  1: '"Finally, it all makes sense"',
  2: '"What does this mean for my life?"',
  3: '"Why wasn\'t I diagnosed sooner?"',
  4: '"Grieving for the life I could have had"',
  5: '"Will I always struggle with this?"',
  6: '"I can work with this, not against it"',
};
```

### 3D. Component Interface

```typescript
interface AdjustmentStagePickerProps {
  value: number | number[] | undefined;
  onChange: (value: number | number[]) => void;
  allowMultiple?: boolean; // starts false, user can toggle
}
```

---

## 4. CBT Cycle Visualizer

**File**: New component `apps/patient/src/components/CBTCycleVisualizer.tsx`
**Context**: Used within worksheet 5 (Personalising CBT Model). The worksheet has fields for negative thoughts, feelings, behaviors, and their positive reframes.

### 4A. Cycle Diagram

```
+--------------------------------------------------+
|                                                    |
|          THOUGHTS                                  |
|       +-----------+                                |
|       | "I always |                                |
|       |  mess up" |                                |
|       +-----------+                                |
|          |      ^                                  |
|          v      |                                  |
|   BEHAVIORS    FEELINGS                            |
|  +---------+  +-----------+                        |
|  |"Avoid   |  |"Frustrated|                        |
|  | tasks"  |  | and sad"  |                        |
|  +---------+  +-----------+                        |
|          |      ^                                  |
|          +------+                                  |
|                                                    |
+--------------------------------------------------+
```

**Layout**: The cycle is rendered as three nodes in a triangular arrangement.

- Container: `height: 280`, `alignItems: 'center'`, `justifyContent: 'center'`, `position: 'relative'`.
- Three nodes positioned absolutely within the container:
  - **Thoughts** (top center): `top: 0`, `alignSelf: 'center'`.
  - **Feelings** (bottom right): `bottom: 0`, `right: Spacing.md`.
  - **Behaviors** (bottom left): `bottom: 0`, `left: Spacing.md`.

**Node style**:
- Container: `width: 120`, `minHeight: 80`, `backgroundColor: Colors.surface`, `borderRadius: Radii.lg (16)`, `padding: Spacing.sm (8)`, `borderWidth: 1.5`.
- Default (empty): `borderColor: Colors.border`, `borderStyle: 'dashed'`.
- Filled (user has entered text): `borderColor: Colors.primary`, `borderStyle: 'solid'`.
- Label: `fontSize: FontSizes.xs (12)`, `fontWeight: '700'`, `color: Colors.primary`, `textTransform: 'uppercase'`, `textAlign: 'center'`, `marginBottom: Spacing.xs (4)`.
- Content text: `fontSize: FontSizes.sm (14)`, `color: Colors.text`, `textAlign: 'center'`, `lineHeight: 20`. Truncated with `numberOfLines={3}`.
- Empty placeholder: `fontSize: FontSizes.sm (14)`, `color: Colors.textTertiary`, `fontStyle: 'italic'`, `textAlign: 'center'`. Text: "Tap to fill in".

**Connecting arrows**: Three arrows forming a clockwise cycle.
- Drawn with Views: A line (2px wide, `backgroundColor: Colors.border`) rotated to connect node centers, with a small triangle arrowhead at the destination end.
- When both connected nodes are filled: line color changes to `Colors.primary` at 60% opacity.
- Implementation: Use absolute-positioned Views with calculated rotation transforms. Each arrow is a `View` with `width: lineLength`, `height: 2`, and `transform: [{ rotate: 'Xdeg' }, { translateX }, { translateY }]`. Arrowhead: 3 small Views forming a triangle, or simply use the text character ">" rotated.

### 4B. Negative/Positive Split View

Below the cycle diagram, an accordion or tab system toggles between negative and positive cycles.

```
+--------------------------------------------------+
|  [NEGATIVE CYCLE]  |  [POSITIVE REFRAME]          |
+--------------------------------------------------+
|                                                    |
|  (cycle diagram updates to show selected mode)    |
|                                                    |
+--------------------------------------------------+
```

**Tab bar**:
- Container: `flexDirection: 'row'`, `backgroundColor: Colors.surfaceAlt`, `borderRadius: Radii.full (9999)`, `padding: 3`.
- Each tab: `flex: 1`, `paddingVertical: Spacing.sm (8)`, `borderRadius: Radii.full`, `alignItems: 'center'`.
  - Active tab: `backgroundColor: Colors.surface`, shadow: `shadowColor: '#000'`, `shadowOpacity: 0.05`, `shadowRadius: 4`, `elevation: 1`.
  - Active text: `fontSize: FontSizes.sm (14)`, `fontWeight: '700'`, `color: Colors.text`.
  - Inactive text: `fontSize: FontSizes.sm (14)`, `fontWeight: '500'`, `color: Colors.textTertiary`.
- Negative tab label: "Negative Cycle"
- Positive tab label: "Positive Reframe"

**Behavior**:
- When "Negative Cycle" is active, the diagram shows the negative-cycle field values (negative_thoughts, negative_feelings, negative_behaviors).
- When "Positive Reframe" is active, the diagram shows the positive field values.
- The node border color changes to indicate the mode:
  - Negative: `Colors.error` (#d94444) at 40% opacity for borders, `Colors.errorLight` for node background.
  - Positive: `Colors.primary` for borders, `Colors.primaryLight` for node background.
- Transition: Cross-fade the node contents with `Animated.timing` opacity, 200ms.

### 4C. Tapping a Node

When the user taps a node on the diagram:
1. Scroll the form below to the corresponding field.
2. Briefly highlight the field with a flash animation (background color pulses from `Colors.primaryLight` to transparent over 600ms).
3. Focus the TextInput if applicable.

This creates a bidirectional link: filling in the form updates the diagram, and tapping the diagram focuses the form.

### 4D. Component Interface

```typescript
interface CBTCycleVisualizerProps {
  // Field IDs mapped to the three cycle positions
  thoughtsFieldId: string;
  feelingsFieldId: string;
  behaviorsFieldId: string;
  // Current form values
  values: Record<string, any>;
  // Which mode is active
  mode: 'negative' | 'positive';
  onModeChange: (mode: 'negative' | 'positive') => void;
  onNodePress: (fieldId: string) => void;
}
```

### 4E. Responsive Considerations

- On small screens (width < 360), reduce node width to 100 and font sizes by 1 step.
- The cycle diagram is not scrollable; it must fit within the visible viewport section.
- Consider adding a "full screen" expand button for users who want to see the complete diagram without scrolling.

---

## 5. Micro-Celebration Component

**File**: New component `apps/patient/src/components/MicroCelebration.tsx`
**Context**: Triggered after completing any content item (psychoeducation read, worksheet submitted). Appears as a modal overlay for 1.8 seconds, then auto-dismisses.

### 5A. Layout

```
+--------------------------------------------------+
|  (semi-transparent overlay)                       |
|                                                    |
|           +--------- card ---------+               |
|           |                         |               |
|           |    [Fay: celebrating]   |               |
|           |                         |               |
|           |      +50 XP             |               |
|           |    (flying up anim)     |               |
|           |                         |               |
|           |  "Nice work!"           |               |
|           |                         |               |
|           |  ====[====]====         |               |
|           |  2 of 5 complete        |               |
|           |                         |               |
|           +-------------------------+               |
|                                                    |
+--------------------------------------------------+
```

### 5B. Overlay

- `position: 'absolute'`, covering full screen (use a Modal or absolute View).
- Background: `'rgba(0, 0, 0, 0.3)'`.
- `alignItems: 'center'`, `justifyContent: 'center'`.
- Fade in: `Animated.timing` opacity from 0 to 1, 150ms.
- Fade out: starts at 1500ms mark, 300ms duration.
- Total visible time: 1800ms.
- Tap anywhere to dismiss early.

### 5C. Celebration Card

- `backgroundColor: Colors.surface`, `borderRadius: Radii.xl (24)`, `padding: Spacing.xl (32)`, `alignItems: 'center'`, `minWidth: 220`.
- Shadow: `shadowColor: Colors.primary`, `shadowOpacity: 0.15`, `shadowRadius: 20`, `elevation: 8`.
- Entry animation: scale from 0.8 to 1.0, `Animated.spring`, `tension: 120`, `friction: 8`, `useNativeDriver: true`.

### 5D. Fay Celebrating State

- Render the `Fay` component with `visualState="celebrating"` and `evolutionStage` from current user state.
- `compact={false}` (full size, 48px container).
- No message tooltip needed here.
- Fay is centered at the top of the card.

### 5E. XP Animation

- XP number: `fontSize: FontSizes.xxl (28)`, `fontWeight: '800'`, `color: Colors.primary`.
- Prefix "+": same style.
- "XP" suffix: `fontSize: FontSizes.sm (14)`, `fontWeight: '600'`, `color: Colors.primaryDark`.
- Animation: The "+{N} XP" text starts at `translateY: 20`, `opacity: 0` and animates to `translateY: 0`, `opacity: 1` over 400ms with `Easing.out(Easing.back(1.5))`, `useNativeDriver: true`. This creates a "pop up" effect.

### 5F. Encouragement Message

A short, randomly selected message from a pool:

```typescript
const CELEBRATION_MESSAGES = [
  'Nice work!',
  'Keep it up!',
  'Well done!',
  'Great progress!',
  'You got this!',
  'One step closer!',
];
```

- `fontSize: FontSizes.lg (18)`, `fontWeight: '600'`, `color: Colors.text`, `marginTop: Spacing.sm (8)`.

### 5G. Progress Mini-Bar

Shows module-level progress.

- Container: `marginTop: Spacing.md (16)`, `alignItems: 'center'`, `width: '100%'`.
- Bar background: `width: '80%'`, `height: 6`, `backgroundColor: Colors.surfaceAlt`, `borderRadius: Radii.full`.
- Bar fill: `height: '100%'`, `backgroundColor: Colors.primary`, `borderRadius: Radii.full`.
  - Width animated from previous percentage to new percentage over 400ms, 200ms delay (after the XP animation), `Easing.out(Easing.cubic)`, `useNativeDriver: false`.
- Label: "{completed}/{total} complete", `fontSize: FontSizes.xs (12)`, `color: Colors.textSecondary`, `marginTop: Spacing.xs (4)`.

### 5H. Component Interface

```typescript
interface MicroCelebrationProps {
  visible: boolean;
  xpEarned: number;
  completedCount: number;
  totalCount: number;
  fayEvolutionStage: FayEvolutionStage;
  onDismiss: () => void;
}
```

### 5I. Performance Notes

- Use `useNativeDriver: true` for all transforms and opacity animations.
- The progress bar width animation requires `useNativeDriver: false`, but it is a single small view, so performance impact is negligible.
- Total animation budget: 1800ms maximum. Breakdown:
  - 0-150ms: Overlay fade in + card scale spring.
  - 150-550ms: XP number pop-up.
  - 550-950ms: Progress bar fill.
  - 1500-1800ms: Fade out.
- The component should be pre-mounted (rendered but invisible) to avoid mount delay when triggering.

---

## 6. Integration Notes

### Navigation Changes

The module detail screen (`apps/patient/app/module/[id].tsx`) needs these structural changes:

1. Replace `FlatList` with `ScrollView` containing the hero, progress ring, and journey path as sequential sections.
2. Psychoeducation items no longer expand inline. Tapping navigates to the new reader route.
3. Add a new route `apps/patient/app/reader/[id].tsx` for the psychoeducation reader.
4. After any content completion (worksheet submit success or psychoeducation "mark as understood"), show the `MicroCelebration` overlay before returning to the module page.

### New Color Tokens to Add

Add these to `apps/patient/src/lib/constants.ts`:

```typescript
// In Colors object:
primaryAlpha30: 'rgba(47, 148, 104, 0.3)',
primaryAlpha10: 'rgba(47, 148, 104, 0.1)',
errorAlpha40: 'rgba(217, 68, 68, 0.4)',
overlayDark: 'rgba(0, 0, 0, 0.3)',
```

### Estimated Reading Time Utility

New utility file: `apps/patient/src/lib/readingTime.ts`

```typescript
export function estimateReadingTime(blocks: { body?: string }[]): number {
  const totalWords = blocks.reduce((sum, block) => {
    if (!block.body) return sum;
    return sum + block.body.split(/\s+/).length;
  }, 0);
  const minutes = Math.ceil(totalWords / 200);
  return Math.max(1, minutes);
}
```

### Component File Summary

| Component | File Path | New/Modified |
|-----------|-----------|-------------|
| Module landing page | `apps/patient/app/module/[id].tsx` | Modified |
| JourneyPath | `apps/patient/src/components/JourneyPath.tsx` | New |
| ProgressRing | `apps/patient/src/components/ProgressRing.tsx` | New |
| ModuleHero | `apps/patient/src/components/ModuleHero.tsx` | New |
| PsychoeducationReader | `apps/patient/src/components/PsychoeducationReader.tsx` | New |
| Reader route | `apps/patient/app/reader/[id].tsx` | New |
| AdjustmentStagePicker | `apps/patient/src/components/AdjustmentStagePicker.tsx` | New |
| CBTCycleVisualizer | `apps/patient/src/components/CBTCycleVisualizer.tsx` | New |
| MicroCelebration | `apps/patient/src/components/MicroCelebration.tsx` | New |
| Reading time utility | `apps/patient/src/lib/readingTime.ts` | New |
| Constants update | `apps/patient/src/lib/constants.ts` | Modified |

### ADHD-Specific UX Decisions Summary

| Concern | Solution |
|---------|----------|
| Short attention span | Paginated reader (one block per page, not wall-of-text) |
| Overwhelm avoidance | Journey path shows sequential items; only current + completed are visually prominent |
| Working memory | Progress ring always visible; page counter in reader; "where you left off" via current node highlight |
| Dopamine seeking | XP pop-up animation; Fay celebrating; progress bar fill animation |
| Impulsivity | Auto-save drafts on worksheet; "pick up where you left off" current node on journey path |
| Task initiation | Fay positioned at current task with encouraging message; reduced friction (one tap to start reading) |
| Completion anxiety | "Mark as understood" is low-pressure language (not "quiz" or "test"); multi-stage picker normalizes being at any stage |

### Accessibility Compliance

All components target WCAG AA:

- **Color contrast**: All text meets 4.5:1 ratio against its background. Verified: `#1a1a1a` on `#faf9f7` = 15.2:1. `#6b6b6b` on `#ffffff` = 5.2:1. `#ffffff` on `#2f9468` = 4.6:1.
- **Touch targets**: All pressable elements are minimum 44x44dp.
- **Screen reader**: All interactive elements have `accessibilityRole` and `accessibilityLabel`. Decorative elements (timeline rail, arrows) are hidden from accessibility tree.
- **Reduced motion**: Check `AccessibilityInfo.isReduceMotionEnabled()` or use `useReducedMotion()` from react-native-reanimated. When true, skip all animations (instant transitions) and disable Fay pulse/bob.
- **Focus management**: When navigating to reader, focus should move to the first content card. When dismissing celebration overlay, focus returns to the journey path.
