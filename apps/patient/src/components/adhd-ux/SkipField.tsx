import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing } from '@/lib/constants';

interface SkipFieldProps {
  onSkip: () => void;
  label?: string;
}

export function SkipField({ onSkip, label }: SkipFieldProps) {
  const displayLabel = label ?? 'Skip for now \u2192';

  return (
    <Pressable
      onPress={onSkip}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={label ?? 'Skip this field for now'}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.text}>{displayLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  text: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
  },
});
