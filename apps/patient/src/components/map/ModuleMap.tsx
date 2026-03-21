/**
 * Growth Garden — Module Map
 *
 * A scrollable illustrated world map where each therapy module is a
 * landmark along a winding golden path up a hillside.
 */
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  LayoutChangeEvent,
  Alert,
  RefreshControl,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect as SvgRect, Circle as SvgCircle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Colors, FayColors, FontSizes, Spacing, Radii, LEVEL_LABELS } from '@/lib/constants';
import { Fay } from '@/components/Fay';
import { getLandmarkComponent } from '@/components/map/landmarks';
import type { ModuleStatus } from '@fayth/types';
import type { FayVisualState, FayEvolutionStage } from '@fayth/types';

// ── Types ───────────────────────────────────────────────────────────

interface ModuleWithStatus {
  id: string;
  chapter_number: number;
  title: string;
  description: string;
  status: ModuleStatus;
}

interface ModuleMapProps {
  modules: ModuleWithStatus[];
  level: string;
  fayEvolution: FayEvolutionStage;
  refreshing: boolean;
  onRefresh: () => void;
}

// ── Layout Constants ────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAP_PADDING_H = 16;
const USABLE_WIDTH = SCREEN_WIDTH - MAP_PADDING_H * 2;

// Each module terrace takes this much vertical space
const TERRACE_HEIGHT = 200;
const HEADER_HEIGHT = 100;
const FOOTER_HEIGHT = 80;

// Alternate landmarks left and right along the S-curve
function getLandmarkX(index: number): number {
  // S-curve: even indices go left, odd go right
  const isLeft = index % 2 === 0;
  if (isLeft) {
    return MAP_PADDING_H + USABLE_WIDTH * 0.15;
  }
  return MAP_PADDING_H + USABLE_WIDTH * 0.55;
}

function getLandmarkY(index: number): number {
  // Bottom-up: module 0 (ch 1) is at the bottom, module 13 (ch 14) at top
  // We reverse so index 0 = bottom
  const reverseIndex = 13 - index;
  return HEADER_HEIGHT + reverseIndex * TERRACE_HEIGHT + TERRACE_HEIGHT * 0.3;
}

const TOTAL_HEIGHT = HEADER_HEIGHT + 14 * TERRACE_HEIGHT + FOOTER_HEIGHT;

// ── Zone Labels ─────────────────────────────────────────────────────

const ZONES = [
  { label: 'Getting Started', afterIndex: 2, emoji: '' },
  { label: 'Core Skills', afterIndex: 6, emoji: '' },
  { label: 'Life Areas', afterIndex: 12, emoji: '' },
  { label: 'Graduation', afterIndex: 13, emoji: '' },
];

function getZoneForChapter(ch: number): string {
  if (ch <= 3) return 'Getting Started';
  if (ch <= 7) return 'Core Skills';
  if (ch <= 13) return 'Life Areas';
  return 'Graduation';
}

// ── Winding Path SVG ────────────────────────────────────────────────

function buildPathD(moduleCount: number): string {
  // Build an S-curve path connecting all 14 module positions
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < moduleCount; i++) {
    points.push({
      x: getLandmarkX(i) + 40, // center of landmark
      y: getLandmarkY(i) + 40,
    });
  }

  // Reverse so path goes from bottom (module 1) to top (module 14)
  points.reverse();

  if (points.length < 2) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // Quadratic bezier for smooth S-curve
    const cpX = (prev.x + curr.x) / 2;
    d += ` Q ${prev.x} ${(prev.y + curr.y) / 2} ${cpX} ${curr.y}`;
  }

  return d;
}

function MapPath({ modules }: { modules: ModuleWithStatus[] }) {
  const pathD = buildPathD(modules.length);
  // Build completed portion
  const activeIndex = modules.findIndex(
    (m) => m.status === 'active' || m.status === 'assigned'
  );
  const completedCount = modules.filter((m) => m.status === 'complete').length;

  return (
    <Svg
      width={SCREEN_WIDTH}
      height={TOTAL_HEIGHT}
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e8dfd4" />
          <Stop offset="0.3" stopColor="#f0e6d8" />
          <Stop offset="0.7" stopColor="#e8f0e4" />
          <Stop offset="1" stopColor="#d4e8d0" />
        </LinearGradient>
        <LinearGradient id="pathGrad" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={FayColors.glowLight} />
          <Stop offset="1" stopColor={FayColors.glow} />
        </LinearGradient>
      </Defs>

      {/* Sky/ground background */}
      <SvgRect x="0" y="0" width={SCREEN_WIDTH} height={TOTAL_HEIGHT} fill="url(#skyGrad)" />

      {/* Rolling hills (decorative) */}
      <Path
        d={`M0 ${TOTAL_HEIGHT * 0.92} Q${SCREEN_WIDTH * 0.25} ${TOTAL_HEIGHT * 0.88} ${SCREEN_WIDTH * 0.5} ${TOTAL_HEIGHT * 0.91} Q${SCREEN_WIDTH * 0.75} ${TOTAL_HEIGHT * 0.94} ${SCREEN_WIDTH} ${TOTAL_HEIGHT * 0.9} L${SCREEN_WIDTH} ${TOTAL_HEIGHT} L0 ${TOTAL_HEIGHT} Z`}
        fill={Colors.primaryLight}
        opacity={0.5}
      />

      {/* Main path — shadow */}
      <Path
        d={pathD}
        stroke={Colors.border}
        strokeWidth={14}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.3}
      />

      {/* Main path — golden trail */}
      <Path
        d={pathD}
        stroke="url(#pathGrad)"
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />

      {/* Path center line — dotted */}
      <Path
        d={pathD}
        stroke={FayColors.glow}
        strokeWidth={2}
        fill="none"
        strokeDasharray="6,8"
        strokeLinecap="round"
        opacity={0.4}
      />
    </Svg>
  );
}

// ── Mini-Map Overlay ────────────────────────────────────────────────

function MiniMap({
  modules,
  onDotPress,
}: {
  modules: ModuleWithStatus[];
  onDotPress: (index: number) => void;
}) {
  const dotColor = (status: ModuleStatus) => {
    switch (status) {
      case 'locked': return Colors.locked;
      case 'assigned': return FayColors.glow;
      case 'active': return Colors.primary;
      case 'complete': return FayColors.glow;
    }
  };

  return (
    <View style={miniStyles.container}>
      {modules.map((mod, i) => (
        <Pressable
          key={mod.id}
          onPress={() => onDotPress(i)}
          hitSlop={8}
          accessibilityLabel={`Jump to module ${mod.chapter_number}`}
        >
          <View
            style={[
              miniStyles.dot,
              {
                backgroundColor: dotColor(mod.status),
                width: mod.status === 'active' ? 10 : 6,
                height: mod.status === 'active' ? 10 : 6,
                borderRadius: mod.status === 'active' ? 5 : 3,
              },
            ]}
          />
        </Pressable>
      ))}
    </View>
  );
}

const miniStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 6,
    top: 120,
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    zIndex: 20,
  },
  dot: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});

// ── Landmark Node ───────────────────────────────────────────────────

function LandmarkNode({
  mod,
  index,
  onPress,
}: {
  mod: ModuleWithStatus;
  index: number;
  onPress: () => void;
}) {
  const LandmarkSvg = getLandmarkComponent(mod.chapter_number);
  const isActive = mod.status === 'active';
  const isLocked = mod.status === 'locked';
  const isComplete = mod.status === 'complete';

  // Glow animation for active module
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    if (!isActive) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isActive, glowAnim]);

  const x = getLandmarkX(index);
  const y = getLandmarkY(index);

  return (
    <Pressable
      onPress={onPress}
      style={[
        landmarkStyles.wrapper,
        {
          left: x,
          top: y,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Module ${mod.chapter_number}: ${mod.title}. ${mod.status}`}
    >
      {/* Active glow ring */}
      {isActive && (
        <Animated.View
          style={[
            landmarkStyles.glowRing,
            { opacity: glowAnim },
          ]}
        />
      )}

      {/* Landmark SVG */}
      <View style={[landmarkStyles.svgContainer, isLocked && landmarkStyles.lockedOverlay]}>
        <LandmarkSvg status={mod.status} size={80} />
      </View>

      {/* Chapter number badge */}
      <View
        style={[
          landmarkStyles.chapterBadge,
          isLocked && landmarkStyles.chapterBadgeLocked,
          isComplete && landmarkStyles.chapterBadgeComplete,
        ]}
      >
        {isLocked ? (
          <Text style={landmarkStyles.lockIcon}>{'🔒'}</Text>
        ) : (
          <Text
            style={[
              landmarkStyles.chapterNumber,
              isComplete && landmarkStyles.chapterNumberComplete,
            ]}
          >
            {mod.chapter_number}
          </Text>
        )}
      </View>

      {/* Title */}
      <Text
        style={[
          landmarkStyles.title,
          isLocked && landmarkStyles.titleLocked,
        ]}
        numberOfLines={2}
      >
        {mod.title}
      </Text>

      {/* Completion badge */}
      {isComplete && (
        <View style={landmarkStyles.completionStar}>
          <Text style={landmarkStyles.completionStarText}>{'★'}</Text>
        </View>
      )}
    </Pressable>
  );
}

const LANDMARK_WIDTH = 120;

const landmarkStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: LANDMARK_WIDTH,
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    top: -6,
    left: (LANDMARK_WIDTH - 92) / 2,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: FayColors.halo,
    borderWidth: 2,
    borderColor: FayColors.glowLight,
  },
  svgContainer: {
    width: 80,
    height: 80,
  },
  lockedOverlay: {
    opacity: 0.5,
  },
  chapterBadge: {
    position: 'absolute',
    top: -6,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  chapterBadgeLocked: {
    backgroundColor: Colors.lockedBg,
  },
  chapterBadgeComplete: {
    backgroundColor: FayColors.glowLight,
    borderColor: FayColors.glow,
  },
  chapterNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  chapterNumberComplete: {
    color: FayColors.glowDim,
  },
  lockIcon: {
    fontSize: 10,
  },
  title: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
    maxWidth: 110,
  },
  titleLocked: {
    color: Colors.locked,
  },
  completionStar: {
    position: 'absolute',
    top: -10,
    left: 14,
  },
  completionStarText: {
    fontSize: 16,
    color: FayColors.glow,
  },
});

// ── Zone Divider ────────────────────────────────────────────────────

function ZoneDivider({ label, y }: { label: string; y: number }) {
  return (
    <View style={[zoneStyles.container, { top: y }]}>
      <View style={zoneStyles.line} />
      <View style={zoneStyles.labelContainer}>
        <Text style={zoneStyles.label}>{label}</Text>
      </View>
      <View style={zoneStyles.line} />
    </View>
  );
}

const zoneStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MAP_PADDING_H,
    gap: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.4,
  },
  labelContainer: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

// ── Main Map Component ──────────────────────────────────────────────

export function ModuleMap({
  modules,
  level,
  fayEvolution,
  refreshing,
  onRefresh,
}: ModuleMapProps) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [scrollReady, setScrollReady] = useState(false);

  // Sort modules by chapter number
  const sorted = [...modules].sort((a, b) => a.chapter_number - b.chapter_number);

  // Find active module for Fay placement + auto-scroll
  const activeIndex = sorted.findIndex(
    (m) => m.status === 'active' || m.status === 'assigned'
  );

  // Auto-scroll to active module on mount
  useEffect(() => {
    if (!scrollReady || activeIndex < 0) return;
    const targetY = getLandmarkY(activeIndex) - 200;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
    }, 300);
  }, [scrollReady, activeIndex]);

  function handleModulePress(mod: ModuleWithStatus) {
    if (mod.status === 'locked') {
      Alert.alert(
        'Module Locked',
        'This module will be unlocked by your psychologist when the time is right. Focus on your current modules for now.',
        [{ text: 'Got it' }],
      );
      return;
    }
    router.push(`/module/${mod.id}`);
  }

  function handleMiniMapDotPress(index: number) {
    const targetY = getLandmarkY(index) - 150;
    scrollRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
  }

  // Zone divider positions — placed between zone transitions
  const zoneDividers: { label: string; y: number }[] = [
    { label: 'Graduation', y: getLandmarkY(13) - 40 },
    { label: 'Life Areas', y: getLandmarkY(7) - 40 },
    { label: 'Core Skills', y: getLandmarkY(3) - 40 },
    { label: 'Getting Started', y: getLandmarkY(0) - 40 },
  ];

  return (
    <View style={mapStyles.root}>
      {/* Header overlay */}
      <View style={mapStyles.headerOverlay}>
        <Text style={mapStyles.headerTitle}>Your Journey</Text>
        <View style={mapStyles.levelBadge}>
          <Text style={mapStyles.levelText}>
            {LEVEL_LABELS[level] ?? level}
          </Text>
        </View>
      </View>

      {/* Mini-map */}
      <MiniMap modules={sorted} onDotPress={handleMiniMapDotPress} />

      <ScrollView
        ref={scrollRef}
        style={mapStyles.scroll}
        contentContainerStyle={{ height: TOTAL_HEIGHT }}
        showsVerticalScrollIndicator={false}
        onLayout={() => setScrollReady(true)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* SVG background + path */}
        <MapPath modules={sorted} />

        {/* Zone dividers */}
        {zoneDividers.map((z) => (
          <ZoneDivider key={z.label} label={z.label} y={z.y} />
        ))}

        {/* Landmark nodes */}
        {sorted.map((mod, i) => (
          <LandmarkNode
            key={mod.id}
            mod={mod}
            index={i}
            onPress={() => handleModulePress(mod)}
          />
        ))}

        {/* Fay at active module */}
        {activeIndex >= 0 && (
          <View
            style={[
              mapStyles.fayMarker,
              {
                left: getLandmarkX(activeIndex) + 80,
                top: getLandmarkY(activeIndex) - 10,
              },
            ]}
          >
            <Fay
              visualState="attentive"
              evolutionStage={fayEvolution}
              compact
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 30,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: FayColors.glowLight,
  },
  levelText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: FayColors.glowDim,
  },
  fayMarker: {
    position: 'absolute',
    zIndex: 15,
  },
});
