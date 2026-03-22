import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontSizes, Spacing } from '@/lib/constants';

interface AutoSaveIndicatorProps {
  visible: boolean;
}

export function AutoSaveIndicator({ visible }: AutoSaveIndicatorProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, opacity]);

  return (
    <Animated.View
      style={[styles.container, { opacity }]}
      pointerEvents="none"
      accessibilityLabel="Draft saved"
      accessibilityRole="text"
    >
      <Text style={styles.text}>Draft saved</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
});
