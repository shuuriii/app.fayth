import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

interface Section {
  id: string;
  label: string;
  completed: boolean;
}

interface StepIndicatorProps {
  sections: Section[];
  activeIndex: number;
  onSectionPress?: (index: number) => void;
}

export function StepIndicator({
  sections,
  activeIndex,
  onSectionPress,
}: StepIndicatorProps) {
  const underlineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(underlineAnim, {
      toValue: activeIndex,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [activeIndex, underlineAnim]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      accessibilityRole="tablist"
    >
      {sections.map((section, index) => {
        const isActive = index === activeIndex;
        const isCompleted = section.completed;

        return (
          <Pressable
            key={section.id}
            onPress={() => onSectionPress?.(index)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${section.label}${isCompleted ? ', completed' : ''}`}
            style={[
              styles.section,
              isActive && styles.sectionActive,
            ]}
          >
            <View style={styles.sectionContent}>
              {isCompleted && (
                <Text style={styles.checkmark}>{'\u2713'}</Text>
              )}
              <Text
                style={[
                  styles.sectionLabel,
                  isActive && styles.sectionLabelActive,
                  isCompleted && !isActive && styles.sectionLabelCompleted,
                ]}
                numberOfLines={1}
              >
                {section.label}
              </Text>
            </View>
            {isActive && <View style={styles.activeBar} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    minHeight: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  sectionActive: {
    backgroundColor: Colors.primaryLight,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  checkmark: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sectionLabelActive: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  sectionLabelCompleted: {
    color: Colors.primary,
  },
  activeBar: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.sm,
    right: Spacing.sm,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.primary,
  },
});
