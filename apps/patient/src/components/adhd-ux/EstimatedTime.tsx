import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

interface EstimatedTimeProps {
  minutes: number;
}

export function EstimatedTime({ minutes }: EstimatedTimeProps) {
  return (
    <View
      style={styles.badge}
      accessibilityLabel={`Estimated time: approximately ${minutes} minutes`}
      accessibilityRole="text"
    >
      <Text style={styles.text}>~{minutes} min</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
