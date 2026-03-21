import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { Colors, FontSizes, Spacing, Radii, FayColors } from '@/lib/constants';

// ── Messages ─────────────────────────────────────────────────────────

const ENCOURAGEMENT_MESSAGES = [
  'That took real effort.',
  'One step forward.',
  'Showing up is the hardest part.',
  "You're building something here.",
  'Progress, not perfection.',
  'Done. That one mattered.',
];

function getRandomMessage(): string {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
}

// ── Props ────────────────────────────────────────────────────────────

interface MicroCelebrationProps {
  visible: boolean;
  xpEarned: number;
  completedCount: number;
  totalCount: number;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms. Default: 1800 */
  autoDismissMs?: number;
}

// ── Component ────────────────────────────────────────────────────────

export function MicroCelebration({
  visible,
  xpEarned,
  completedCount,
  totalCount,
  onDismiss,
  autoDismissMs = 1800,
}: MicroCelebrationProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const xpScale = useRef(new Animated.Value(0.3)).current;
  const xpTranslateY = useRef(new Animated.Value(30)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const message = useRef(getRandomMessage()).current;

  useEffect(() => {
    if (!visible) {
      overlayOpacity.setValue(0);
      return;
    }

    const prevProgress = totalCount > 0 ? ((completedCount - 1) / totalCount) * 100 : 0;
    const newProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    progressWidth.setValue(prevProgress);

    // Entrance sequence
    Animated.sequence([
      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      // XP pop + message fade
      Animated.parallel([
        Animated.spring(xpScale, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(xpTranslateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 300,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
      // Progress bar animation (non-native for width)
      Animated.timing(progressWidth, {
        toValue: newProgress,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();

    // Auto-dismiss
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onDismiss}>
      <Animated.View style={[styles.container, { opacity: overlayOpacity }]}>
        {/* XP badge */}
        <Animated.View
          style={[
            styles.xpContainer,
            {
              transform: [
                { scale: xpScale },
                { translateY: xpTranslateY },
              ],
            },
          ]}
        >
          <Text style={styles.xpNumber}>+{xpEarned}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </Animated.View>

        {/* Encouragement message */}
        <Animated.Text style={[styles.message, { opacity: messageOpacity }]}>
          {message}
        </Animated.Text>

        {/* Progress mini-bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedCount} of {totalCount} complete
          </Text>
        </View>

        {/* Tap hint */}
        <Text style={styles.tapHint}>tap anywhere to continue</Text>
      </Animated.View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  xpContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  xpNumber: {
    fontSize: FontSizes.hero,
    fontWeight: '800',
    color: Colors.primary,
  },
  xpLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  message: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  progressSection: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  tapHint: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontWeight: '400',
  },
});
