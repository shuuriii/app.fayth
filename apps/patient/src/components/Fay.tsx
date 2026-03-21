import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import type { FayVisualState, FayEvolutionStage } from '@fayth/types';
import { FayColors, FontSizes, Spacing, Radii } from '@/lib/constants';
import { Colors } from '@/lib/constants';

// ── Visual Config per Evolution Stage ──────────────────────────────

interface StageVisuals {
  /** Core size in dp */
  size: number;
  /** Glow/halo radius multiplier */
  glowRadius: number;
  /** Core opacity */
  coreOpacity: number;
  /** Whether to show wing trails */
  wings: boolean;
  /** Whether to show particle dots */
  particles: boolean;
}

const STAGE_VISUALS: Record<FayEvolutionStage, StageVisuals> = {
  ember: { size: 14, glowRadius: 1.4, coreOpacity: 0.85, wings: false, particles: false },
  spark: { size: 16, glowRadius: 1.6, coreOpacity: 0.9, wings: true, particles: false },
  glow: { size: 18, glowRadius: 1.8, coreOpacity: 0.95, wings: true, particles: false },
  flare: { size: 20, glowRadius: 2.0, coreOpacity: 1.0, wings: true, particles: true },
  radiance: { size: 22, glowRadius: 2.2, coreOpacity: 1.0, wings: true, particles: true },
  lumina: { size: 24, glowRadius: 2.5, coreOpacity: 1.0, wings: true, particles: true },
};

// ── Props ──────────────────────────────────────────────────────────

interface FayProps {
  visualState: FayVisualState;
  evolutionStage: FayEvolutionStage;
  message?: string | null;
  messageVisible?: boolean;
  onPress?: () => void;
  /** Compact mode for non-home screens */
  compact?: boolean;
}

// ── Component ─────────────────────────────────────────────────────

export function Fay({
  visualState,
  evolutionStage,
  message,
  messageVisible = false,
  onPress,
  compact = false,
}: FayProps) {
  const visuals = STAGE_VISUALS[evolutionStage];
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Separate pulse for the halo (JS-driven, since glowAnim is also JS on same node)
  const haloPulseAnim = useRef(new Animated.Value(1)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;

  // Gentle breathing pulse
  useEffect(() => {
    const speed = visualState === 'resting' ? 3000 : visualState === 'attentive' ? 4000 : 2500;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: speed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: speed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    // Mirror for halo (JS-driven to avoid native/JS conflict with glowAnim)
    const haloPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulseAnim, {
          toValue: 1.15,
          duration: speed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(haloPulseAnim, {
          toValue: 1,
          duration: speed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();
    haloPulse.start();
    return () => { pulse.stop(); haloPulse.stop(); };
  }, [visualState, pulseAnim, haloPulseAnim]);

  // Gentle vertical bob
  useEffect(() => {
    if (visualState === 'resting') {
      bobAnim.setValue(0);
      return;
    }
    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -4,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    bob.start();
    return () => bob.stop();
  }, [visualState, bobAnim]);

  // Glow intensity based on state
  useEffect(() => {
    const targetGlow =
      visualState === 'celebrating'
        ? 0.7
        : visualState === 'glowing'
          ? 0.5
          : visualState === 'attentive'
            ? 0.2
            : 0.3;

    Animated.timing(glowAnim, {
      toValue: targetGlow,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [visualState, glowAnim]);

  // Message tooltip animation
  useEffect(() => {
    Animated.timing(messageOpacity, {
      toValue: messageVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [messageVisible, messageOpacity]);

  const containerSize = compact ? 32 : 48;
  const coreSize = compact ? visuals.size * 0.75 : visuals.size;
  const haloSize = coreSize * visuals.glowRadius * 2;

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      {/* Message tooltip */}
      {message && (
        <Animated.View
          style={[
            styles.tooltip,
            { opacity: messageOpacity },
          ]}
          pointerEvents={messageVisible ? 'auto' : 'none'}
        >
          <Text style={styles.tooltipText}>{message}</Text>
          <View style={styles.tooltipArrow} />
        </Animated.View>
      )}

      {/* Fay body */}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Fay companion"
        accessibilityHint={message ? 'Tap to see what Fay has to say' : undefined}
        style={[styles.container, { width: containerSize, height: containerSize }]}
      >
        {/* Halo / glow effect */}
        <Animated.View
          style={[
            styles.halo,
            {
              width: haloSize,
              height: haloSize,
              borderRadius: haloSize / 2,
              opacity: glowAnim,
              transform: [{ scale: haloPulseAnim }],
            },
          ]}
        />

        {/* Core body */}
        <Animated.View
          style={[
            styles.core,
            {
              width: coreSize,
              height: coreSize,
              borderRadius: coreSize / 2,
              opacity: visuals.coreOpacity,
              transform: [{ translateY: bobAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          {/* Dot eyes */}
          <View style={styles.eyeRow}>
            <View style={[styles.eye, { width: coreSize * 0.15, height: coreSize * 0.15 }]} />
            <View style={{ width: coreSize * 0.2 }} />
            <View style={[styles.eye, { width: coreSize * 0.15, height: coreSize * 0.15 }]} />
          </View>
        </Animated.View>

        {/* Wing trails (spark stage+) */}
        {visuals.wings && !compact && (
          <Animated.View
            style={[
              styles.wingContainer,
              { transform: [{ translateY: bobAnim }] },
            ]}
          >
            <View style={[styles.wing, styles.wingLeft, { opacity: visuals.coreOpacity * 0.4 }]} />
            <View style={[styles.wing, styles.wingRight, { opacity: visuals.coreOpacity * 0.4 }]} />
          </Animated.View>
        )}

        {/* Particle dots (flare stage+) */}
        {visuals.particles && !compact && (
          <View style={styles.particleContainer}>
            <Animated.View
              style={[
                styles.particle,
                { top: -8, right: 2, transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.particle,
                { bottom: -4, left: -6, transform: [{ scale: pulseAnim }] },
              ]}
            />
          </View>
        )}
      </Pressable>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    zIndex: 10,
  },
  wrapperCompact: {
    // nothing extra for now
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    backgroundColor: FayColors.halo,
  },
  core: {
    backgroundColor: FayColors.glow,
    alignItems: 'center',
    justifyContent: 'center',
    // soft shadow for the glow effect
    shadowColor: FayColors.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  eyeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -1,
  },
  eye: {
    backgroundColor: FayColors.eyes,
    borderRadius: 999,
  },
  wingContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  wing: {
    width: 6,
    height: 10,
    borderRadius: 3,
    backgroundColor: FayColors.glowLight,
    position: 'absolute',
  },
  wingLeft: {
    left: 4,
    top: -2,
    transform: [{ rotate: '-30deg' }],
  },
  wingRight: {
    right: 4,
    top: -2,
    transform: [{ rotate: '30deg' }],
  },
  particleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: FayColors.spark,
    opacity: 0.6,
  },
  tooltip: {
    position: 'absolute',
    bottom: 56,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    maxWidth: 220,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tooltipText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    right: 16,
    width: 12,
    height: 12,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    transform: [{ rotate: '45deg' }],
  },
});
