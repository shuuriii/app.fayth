import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

interface ScoreSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}

function getScoreColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio <= 0.2) return Colors.scoreRed;
  if (ratio <= 0.4) return Colors.scoreOrange;
  if (ratio <= 0.6) return Colors.scoreYellow;
  if (ratio <= 0.8) return Colors.scoreYellowGreen;
  return Colors.scoreGreen;
}

export function ScoreSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel,
  highLabel,
}: ScoreSliderProps) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const color = getScoreColor(value, max);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.valueBadge, { backgroundColor: color }]}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      </View>

      <View style={styles.stepsRow}>
        {steps.map((step) => {
          const isSelected = step === value;
          const stepColor = getScoreColor(step, max);

          return (
            <Pressable
              key={step}
              onPress={() => onChange(step)}
              style={[
                styles.step,
                isSelected && { backgroundColor: stepColor, transform: [{ scale: 1.15 }] },
                !isSelected && { backgroundColor: Colors.surfaceAlt },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${step}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.stepText,
                  isSelected && { color: Colors.textOnPrimary, fontWeight: '700' },
                ]}
              >
                {step}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {(lowLabel || highLabel) && (
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>{lowLabel ?? ''}</Text>
          <Text style={styles.rangeLabel}>{highLabel ?? ''}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  valueBadge: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  step: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 36,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  rangeLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
});
