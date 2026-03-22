import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, {
  Polygon,
  Line,
  Text as SvgText,
  Circle,
  G,
} from 'react-native-svg';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

// ── Types ──────────────────────────────────────────────────────────────

export interface SymptomRadarChartProps {
  /** 9 domain scores, each 0-3 */
  scores: Array<{ label: string; value: number; maxValue: number }>;
  /** Interpretation text based on total score */
  interpretation?: string;
  /** Size of the chart in dp */
  size?: number;
}

// ── Geometry helpers ───────────────────────────────────────────────────

const LABEL_PADDING = 36;

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  // Start from top (12 o'clock) and go clockwise
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function buildPolygonPoints(
  cx: number,
  cy: number,
  values: number[],
  maxValue: number,
  maxRadius: number,
): string {
  const count = values.length;
  const step = 360 / count;
  return values
    .map((v, i) => {
      const r = (v / maxValue) * maxRadius;
      const { x, y } = polarToCartesian(cx, cy, r, i * step);
      return `${x},${y}`;
    })
    .join(' ');
}

function buildGuidePolygonPoints(
  cx: number,
  cy: number,
  count: number,
  radius: number,
): string {
  const step = 360 / count;
  return Array.from({ length: count })
    .map((_, i) => {
      const { x, y } = polarToCartesian(cx, cy, radius, i * step);
      return `${x},${y}`;
    })
    .join(' ');
}

// ── Animated data polygon ──────────────────────────────────────────────

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

function DataPolygon({
  cx,
  cy,
  scores,
  maxRadius,
  animProgress,
}: {
  cx: number;
  cy: number;
  scores: Array<{ value: number; maxValue: number }>;
  maxRadius: number;
  animProgress: Animated.Value;
}) {
  const count = scores.length;
  const step = 360 / count;

  // We need to interpolate the polygon points string based on the anim value.
  // Since Animated doesn't natively handle string interpolation for polygon points,
  // we use a listener to update state.
  const [points, setPoints] = React.useState<string>(
    buildPolygonPoints(
      cx,
      cy,
      scores.map(() => 0),
      scores[0]?.maxValue ?? 3,
      maxRadius,
    ),
  );

  useEffect(() => {
    const id = animProgress.addListener(({ value: t }) => {
      const interpolatedValues = scores.map((s) => s.value * t);
      setPoints(
        buildPolygonPoints(
          cx,
          cy,
          interpolatedValues,
          scores[0]?.maxValue ?? 3,
          maxRadius,
        ),
      );
    });
    return () => animProgress.removeListener(id);
  }, [cx, cy, scores, maxRadius, animProgress]);

  return (
    <Polygon
      points={points}
      fill={Colors.primary}
      fillOpacity={0.2}
      stroke={Colors.primary}
      strokeWidth={2}
    />
  );
}

// ── Component ──────────────────────────────────────────────────────────

export function SymptomRadarChart({
  scores,
  interpretation,
  size = 280,
}: SymptomRadarChartProps) {
  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animProgress.setValue(0);
    Animated.timing(animProgress, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [scores]);

  const count = scores.length;
  if (count === 0) return null;

  const svgSize = size;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const maxRadius = svgSize / 2 - LABEL_PADDING;
  const maxValue = scores[0]?.maxValue ?? 3;
  const step = 360 / count;

  // Guide levels: 1, 2, 3 (skip 0 since it's just the center)
  const guideLevels = Array.from({ length: maxValue }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        accessibilityLabel={`Radar chart showing ${count} symptom domains`}
      >
        {/* Concentric guide polygons */}
        {guideLevels.map((level) => {
          const r = (level / maxValue) * maxRadius;
          return (
            <Polygon
              key={`guide-${level}`}
              points={buildGuidePolygonPoints(cx, cy, count, r)}
              fill="none"
              stroke={Colors.borderLight}
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines from center to each vertex */}
        {scores.map((_, i) => {
          const { x, y } = polarToCartesian(cx, cy, maxRadius, i * step);
          return (
            <Line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={Colors.borderLight}
              strokeWidth={1}
            />
          );
        })}

        {/* Center dot */}
        <Circle cx={cx} cy={cy} r={2} fill={Colors.textTertiary} />

        {/* Data polygon (animated) */}
        <DataPolygon
          cx={cx}
          cy={cy}
          scores={scores}
          maxRadius={maxRadius}
          animProgress={animProgress}
        />

        {/* Data points */}
        {scores.map((score, i) => {
          const r = (score.value / maxValue) * maxRadius;
          const { x, y } = polarToCartesian(cx, cy, r, i * step);
          return (
            <Circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r={4}
              fill={Colors.primary}
              stroke={Colors.surface}
              strokeWidth={2}
            />
          );
        })}

        {/* Axis labels */}
        {scores.map((score, i) => {
          const labelRadius = maxRadius + 18;
          const { x, y } = polarToCartesian(cx, cy, labelRadius, i * step);

          // Determine text-anchor based on position
          const angle = i * step;
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (angle > 15 && angle < 165) textAnchor = 'start';
          else if (angle > 195 && angle < 345) textAnchor = 'end';

          return (
            <SvgText
              key={`label-${i}`}
              x={x}
              y={y}
              textAnchor={textAnchor}
              alignmentBaseline="central"
              fontSize={FontSizes.xs}
              fill={Colors.textSecondary}
              fontWeight="500"
            >
              {score.label}
            </SvgText>
          );
        })}
      </Svg>

      {/* Interpretation text */}
      {interpretation ? (
        <View style={styles.interpretationContainer}>
          <Text style={styles.interpretationText}>{interpretation}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  interpretationContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: 'stretch',
  },
  interpretationText: {
    fontSize: FontSizes.sm,
    color: Colors.primaryDark,
    lineHeight: 20,
    textAlign: 'center',
  },
});
