import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';
import type { Scoring, YBField } from '@fayth/types';

interface ScoreDisplayProps {
  scoring: Scoring;
  fields: YBField[];
  values: Record<string, any>;
}

function calculateScore(
  scoring: Scoring,
  fields: YBField[],
  values: Record<string, any>,
): { total: number; max: number; percentage: number } | null {
  if (scoring.method === 'none') return null;

  const scorableFields = fields.filter(
    (f) => f.type === 'likert' || f.type === 'scale' || f.type === 'number',
  );

  if (scorableFields.length === 0) return null;

  let total = 0;
  let count = 0;

  for (const field of scorableFields) {
    const val = values[field.id];
    if (val === undefined || val === null) continue;

    if (field.type === 'likert' && field.options && field.score_values) {
      const idx = field.options.indexOf(val);
      if (idx >= 0 && idx < field.score_values.length) {
        let score = field.score_values[idx];
        if (field.reverse_score && field.score_values.length > 0) {
          const maxVal = Math.max(...field.score_values);
          const minVal = Math.min(...field.score_values);
          score = maxVal + minVal - score;
        }
        total += score;
        count++;
      }
    } else if (field.type === 'scale' || field.type === 'number') {
      total += Number(val) || 0;
      count++;
    }
  }

  if (count === 0) return null;

  const finalScore = scoring.method === 'average' ? total / count : total;
  const max = scoring.max_score ?? total;
  const percentage = max > 0 ? Math.min((finalScore / max) * 100, 100) : 0;

  return {
    total: Math.round(finalScore * 10) / 10,
    max,
    percentage,
  };
}

function getInterpretation(
  scoring: Scoring,
  percentage: number,
): string | null {
  if (!scoring.interpretation) return null;

  const keys = Object.keys(scoring.interpretation);
  // Try numeric thresholds (e.g., "0-30": "low")
  for (const key of keys) {
    const match = key.match(/^(\d+)-(\d+)$/);
    if (match) {
      const low = parseInt(match[1], 10);
      const high = parseInt(match[2], 10);
      if (percentage >= low && percentage <= high) {
        return scoring.interpretation[key];
      }
    }
  }

  // Try named bands
  if (percentage <= 33 && scoring.interpretation.low) {
    return scoring.interpretation.low;
  }
  if (percentage <= 66 && scoring.interpretation.medium) {
    return scoring.interpretation.medium;
  }
  if (scoring.interpretation.high) {
    return scoring.interpretation.high;
  }

  return null;
}

function getBarColor(percentage: number): string {
  if (percentage <= 25) return Colors.scoreGreen;
  if (percentage <= 50) return Colors.scoreYellowGreen;
  if (percentage <= 75) return Colors.scoreOrange;
  return Colors.scoreRed;
}

export function ScoreDisplay({ scoring, fields, values }: ScoreDisplayProps) {
  const result = calculateScore(scoring, fields, values);
  if (!result) return null;

  const interpretation = getInterpretation(scoring, result.percentage);
  const barColor = getBarColor(result.percentage);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Score</Text>

      <View style={styles.scoreRow}>
        <Text style={styles.scoreValue}>{result.total}</Text>
        {scoring.max_score ? (
          <Text style={styles.scoreMax}>/ {result.max}</Text>
        ) : null}
      </View>

      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${result.percentage}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      {interpretation ? (
        <View style={styles.interpretationCard}>
          <Text style={styles.interpretationText}>{interpretation}</Text>
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing.md,
  },
  heading: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  scoreValue: {
    fontSize: FontSizes.hero,
    fontWeight: '800',
    color: Colors.text,
  },
  scoreMax: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  barBg: {
    height: 10,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  barFill: {
    height: '100%',
    borderRadius: Radii.full,
  },
  interpretationCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  interpretationText: {
    fontSize: FontSizes.sm,
    color: Colors.primaryDark,
    lineHeight: 22,
  },
});
