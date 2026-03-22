import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, FontSizes } from '@/lib/constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressRing({
  current,
  total,
  size = 64,
  strokeWidth = 5,
  color = Colors.primary,
}: ProgressRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const progress = total > 0 ? Math.min(current / total, 1) : 0;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Progress: ${current} of ${total}`}
      accessibilityValue={{ min: 0, max: total, now: current }}
    >
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.borderLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated fill */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>
          {current}/{total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.text,
  },
});
