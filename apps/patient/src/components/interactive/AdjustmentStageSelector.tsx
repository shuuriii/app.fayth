import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  ViewToken,
} from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

// ── Types ──────────────────────────────────────────────────────────────

export interface AdjustmentStageSelectorProps {
  value: number | undefined;
  onChange: (stage: number) => void;
  /** Whether this is read-only (for review mode) */
  readOnly?: boolean;
}

// ── Stage data ─────────────────────────────────────────────────────────

interface StageInfo {
  stage: number;
  name: string;
  description: string;
}

const STAGES: StageInfo[] = [
  {
    stage: 1,
    name: 'Relief & Elation',
    description:
      'Many adults feel immense relief at diagnosis. Finally there is an explanation for lifelong struggles.',
  },
  {
    stage: 2,
    name: 'Confusion & Emotional Turmoil',
    description:
      'The initial relief can give way to confusion. What does this mean for my identity?',
  },
  {
    stage: 3,
    name: 'Anger',
    description:
      "Why wasn't I diagnosed sooner? Anger is common \u2014 directed at parents, teachers, the system.",
  },
  {
    stage: 4,
    name: 'Sadness & Grief',
    description:
      'Grief for lost opportunities, for the person you might have been.',
  },
  {
    stage: 5,
    name: 'Anxiety',
    description:
      'The realisation that ADHD is chronic can trigger anxiety. Will I always be like this?',
  },
  {
    stage: 6,
    name: 'Accommodation & Acceptance',
    description:
      'The diagnosis becomes integrated into your sense of self. You learn what works for you.',
  },
];

// ── Dimensions ─────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 32;
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;
const CARD_GAP = Spacing.md;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

// ── Component ──────────────────────────────────────────────────────────

export function AdjustmentStageSelector({
  value,
  onChange,
  readOnly = false,
}: AdjustmentStageSelectorProps) {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleSelect = useCallback(
    (stage: number) => {
      if (!readOnly) {
        onChange(stage);
      }
    },
    [readOnly, onChange],
  );

  const renderCard = useCallback(
    ({ item }: { item: StageInfo }) => {
      const isSelected = value === item.stage;

      return (
        <View
          style={[
            styles.card,
            isSelected && styles.cardSelected,
            { width: CARD_WIDTH },
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={`Stage ${item.stage}: ${item.name}`}
        >
          {/* Stage number badge */}
          <View
            style={[
              styles.stageBadge,
              isSelected && styles.stageBadgeSelected,
            ]}
          >
            <Text
              style={[
                styles.stageBadgeText,
                isSelected && styles.stageBadgeTextSelected,
              ]}
            >
              {item.stage}
            </Text>
          </View>

          {/* Stage name */}
          <Text style={[styles.stageName, isSelected && styles.stageNameSelected]}>
            {item.name}
          </Text>

          {/* Description */}
          <Text style={styles.stageDescription}>{item.description}</Text>

          {/* Select button */}
          {!readOnly && (
            <Pressable
              onPress={() => handleSelect(item.stage)}
              style={({ pressed }) => [
                styles.selectButton,
                isSelected && styles.selectButtonSelected,
                pressed && !isSelected && styles.selectButtonPressed,
              ]}
              accessibilityLabel={
                isSelected
                  ? `Stage ${item.stage} selected`
                  : `Select stage ${item.stage}`
              }
            >
              {isSelected ? (
                <View style={styles.selectButtonContent}>
                  <Text style={styles.checkmark}>{'\u2713'}</Text>
                  <Text style={styles.selectButtonTextSelected}>
                    This feels like me
                  </Text>
                </View>
              ) : (
                <Text style={styles.selectButtonText}>This feels like me</Text>
              )}
            </Pressable>
          )}

          {/* Read-only selected indicator */}
          {readOnly && isSelected && (
            <View style={styles.readOnlyBadge}>
              <Text style={styles.readOnlyBadgeText}>
                {'\u2713'} Your current stage
              </Text>
            </View>
          )}
        </View>
      );
    },
    [value, readOnly, handleSelect],
  );

  const keyExtractor = useCallback((item: StageInfo) => String(item.stage), []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={STAGES}
        renderItem={renderCard}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + CARD_GAP,
          offset: (CARD_WIDTH + CARD_GAP) * index,
          index,
        })}
      />

      {/* Dots indicator */}
      <View style={styles.dotsRow}>
        {STAGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex && styles.dotActive,
              value === i + 1 && styles.dotSelected,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },

  // Stage badge
  stageBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  stageBadgeSelected: {
    backgroundColor: Colors.primary,
  },
  stageBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  stageBadgeTextSelected: {
    color: Colors.textOnPrimary,
  },

  // Stage name
  stageName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  stageNameSelected: {
    color: Colors.primaryDark,
  },

  // Description
  stageDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },

  // Select button
  selectButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  selectButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectButtonPressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  selectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  selectButtonTextSelected: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  checkmark: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },

  // Read-only badge
  readOnlyBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    alignSelf: 'center',
  },
  readOnlyBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
  },
  dotActive: {
    backgroundColor: Colors.textTertiary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotSelected: {
    backgroundColor: Colors.primary,
  },
});
