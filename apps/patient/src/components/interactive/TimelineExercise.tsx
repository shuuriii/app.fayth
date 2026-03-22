import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';
import { FieldRenderer, YBField } from '@/components/WorksheetRenderer';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Types ──────────────────────────────────────────────────────────────

export interface TimelineExerciseProps {
  /** Chapters parsed from exercise fields */
  chapters: Array<{
    id: string;
    label: string;
    fields: YBField[];
  }>;
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  /** Index of the active chapter */
  activeChapterIndex: number;
  onChapterPress: (index: number) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────

function isChapterCompleted(
  fields: YBField[],
  values: Record<string, any>,
): boolean {
  const requiredFields = fields.filter((f) => f.required);
  if (requiredFields.length === 0) {
    // If no required fields, consider completed when any field is filled
    return fields.some((f) => {
      const v = values[f.id];
      return v !== undefined && v !== null && v !== '';
    });
  }
  return requiredFields.every((f) => {
    const v = values[f.id];
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });
}

function getChapterSummary(
  fields: YBField[],
  values: Record<string, any>,
): string {
  for (const field of fields) {
    const v = values[field.id];
    if (v !== undefined && v !== null && v !== '') {
      const str = typeof v === 'string' ? v : JSON.stringify(v);
      return str.length > 50 ? str.slice(0, 50) + '...' : str;
    }
  }
  return 'Not started';
}

// ── Node component ─────────────────────────────────────────────────────

const NODE_SIZE = 20;
const LINE_LEFT = NODE_SIZE / 2;

interface TimelineNodeProps {
  chapter: { id: string; label: string; fields: YBField[] };
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  onPress: () => void;
}

function TimelineNode({
  chapter,
  index,
  isActive,
  isCompleted,
  isLast,
  values,
  onChange,
  onPress,
}: TimelineNodeProps) {
  const expandAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const summary = getChapterSummary(chapter.fields, values);

  const nodeColor = isActive
    ? Colors.primary
    : isCompleted
      ? Colors.success
      : Colors.locked;

  return (
    <View style={styles.nodeContainer}>
      {/* Timeline line (except after last node) */}
      {!isLast && (
        <View
          style={[
            styles.timelineLine,
            { left: LINE_LEFT - 1 },
            isCompleted && styles.timelineLineCompleted,
          ]}
        />
      )}

      {/* Node row: circle + label */}
      <Pressable
        onPress={onPress}
        style={styles.nodeRow}
        accessibilityRole="button"
        accessibilityLabel={`${chapter.label}${isCompleted ? ', completed' : isActive ? ', active' : ''}`}
        accessibilityState={{ expanded: isActive }}
      >
        {/* Circle node */}
        <View
          style={[
            styles.nodeCircle,
            { backgroundColor: nodeColor },
            isActive && styles.nodeCircleActive,
          ]}
        >
          {isCompleted && !isActive && (
            <Text style={styles.nodeCheckmark}>{'\u2713'}</Text>
          )}
          {isActive && (
            <View style={styles.nodeInnerDot} />
          )}
        </View>

        {/* Label + summary */}
        <View style={styles.nodeLabelContainer}>
          <Text
            style={[
              styles.nodeLabel,
              isActive && styles.nodeLabelActive,
              isCompleted && !isActive && styles.nodeLabelCompleted,
            ]}
          >
            {chapter.label}
          </Text>
          {!isActive && (
            <Text style={styles.nodeSummary} numberOfLines={1}>
              {summary}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Expanded fields */}
      {isActive && (
        <Animated.View
          style={[
            styles.expandedContainer,
            {
              opacity: expandAnim,
            },
          ]}
        >
          <View style={styles.fieldsContainer}>
            {chapter.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={values[field.id]}
                onChange={(val) => onChange(field.id, val)}
              />
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────────

export function TimelineExercise({
  chapters,
  values,
  onChange,
  activeChapterIndex,
  onChapterPress,
}: TimelineExerciseProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const nodePositions = useRef<Record<number, number>>({});

  // Auto-scroll to active chapter when it changes
  useEffect(() => {
    const y = nodePositions.current[activeChapterIndex];
    if (y !== undefined && scrollViewRef.current) {
      // Small delay to allow layout to settle after expand animation
      const timeout = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [activeChapterIndex]);

  const handleChapterPress = useCallback(
    (index: number) => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          300,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity,
        ),
      );
      onChapterPress(index);
    },
    [onChapterPress],
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {chapters.map((chapter, index) => {
        const isActive = index === activeChapterIndex;
        const completed = isChapterCompleted(chapter.fields, values);

        return (
          <View
            key={chapter.id}
            onLayout={(e) => {
              nodePositions.current[index] = e.nativeEvent.layout.y;
            }}
          >
            <TimelineNode
              chapter={chapter}
              index={index}
              isActive={isActive}
              isCompleted={completed}
              isLast={index === chapters.length - 1}
              values={values}
              onChange={onChange}
              onPress={() => handleChapterPress(index)}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
  },

  // Node container (holds both the node row and expanded content)
  nodeContainer: {
    position: 'relative',
    paddingLeft: NODE_SIZE + Spacing.md,
    marginBottom: Spacing.xs,
  },

  // Vertical timeline line
  timelineLine: {
    position: 'absolute',
    top: NODE_SIZE,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.border,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.success,
  },

  // Clickable node row
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },

  // Circle on the timeline
  nodeCircle: {
    position: 'absolute',
    left: -(NODE_SIZE + Spacing.md),
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCircleActive: {
    width: NODE_SIZE + 4,
    height: NODE_SIZE + 4,
    borderRadius: (NODE_SIZE + 4) / 2,
    left: -(NODE_SIZE + Spacing.md) - 2,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  nodeCheckmark: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  nodeInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textOnPrimary,
  },

  // Label area
  nodeLabelContainer: {
    flex: 1,
  },
  nodeLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  nodeLabelActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  nodeLabelCompleted: {
    color: Colors.text,
  },
  nodeSummary: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },

  // Expanded fields area
  expandedContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  fieldsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
});
