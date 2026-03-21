import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { usePatient } from '@/hooks/usePatient';
import { usePatientId } from '@/hooks/usePatientId';
import { useSymptomLog } from '@/hooks/useSymptomLog';
import { useFay } from '@/hooks/useFay';
import { Fay } from '@/components/Fay';
import { Colors, FontSizes, Spacing, Radii, LEVEL_LABELS, getLevelProgress } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

const LAST_OPEN_KEY = 'fayth_last_open_ts';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface ActiveModuleItem {
  moduleId: number;
  moduleTitle: string;
  chapterNumber: number;
  nextItemId: string;
  nextItemTitle: string;
  nextItemType: string;
  completedCount: number;
  totalCount: number;
}

async function fetchActiveModule(patientId: string): Promise<ActiveModuleItem | null> {
  // Find the first active/assigned module
  const { data: patientModules } = await supabase
    .from('patient_modules')
    .select('module_id, status')
    .eq('patient_id', patientId)
    .in('status', ['active', 'assigned'])
    .limit(1);

  if (!patientModules || patientModules.length === 0) return null;

  const pm = patientModules[0];

  // Fetch module info and content items in parallel (both only need module_id)
  const [{ data: mod }, { data: items }] = await Promise.all([
    supabase
      .from('yb_modules')
      .select('id, title, chapter_number')
      .eq('id', pm.module_id)
      .single(),
    supabase
      .from('yb_content_items')
      .select('id, title, type')
      .eq('module_id', pm.module_id)
      .order('id', { ascending: true }),
  ]);

  if (!mod || !items || items.length === 0) return null;

  // Get completed responses
  const itemIds = items.map((i) => i.id);
  const { data: responses } = await supabase
    .from('patient_content_responses')
    .select('content_item_id')
    .eq('patient_id', patientId)
    .in('content_item_id', itemIds);

  const completedIds = new Set((responses ?? []).map((r) => r.content_item_id));
  const nextItem = items.find((i) => !completedIds.has(i.id));

  if (!nextItem) return null;

  return {
    moduleId: mod.id,
    moduleTitle: mod.title,
    chapterNumber: mod.chapter_number,
    nextItemId: nextItem.id,
    nextItemTitle: nextItem.title,
    nextItemType: nextItem.type,
    completedCount: completedIds.size,
    totalCount: items.length,
  };
}

// ── Skeleton Loader ──────────────────────────────────────────────────

function Skeleton({ width, height, style }: { width: number | string; height: number; style?: object }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: Radii.sm, backgroundColor: Colors.surfaceAlt, opacity },
        style,
      ]}
    />
  );
}

function HomeSkeleton() {
  return (
    <View style={[styles.container, styles.contentContainer]}>
      <View style={styles.greetingRow}>
        <View style={styles.greetingSection}>
          <Skeleton width={140} height={20} />
          <Skeleton width={100} height={34} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={48} height={48} style={{ borderRadius: 24 }} />
      </View>
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.statCard, { alignItems: 'center' }]}>
            <Skeleton width={40} height={22} />
            <Skeleton width={50} height={12} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
      <Skeleton width="100%" height={120} style={{ borderRadius: Radii.lg, marginBottom: Spacing.md }} />
      <Skeleton width="100%" height={80} style={{ borderRadius: Radii.lg }} />
    </View>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { patientId } = usePatientId(user?.id);
  const { profile, patient, loading: patientLoading, refetch } = usePatient(user?.id);
  const { todayLog, loading: logLoading, checkinGenerating } = useSymptomLog(patientId ?? undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [daysSinceLastOpen, setDaysSinceLastOpen] = useState(0);
  const prevCheckinRef = useRef<string | null>(null);
  const hasAutoShownFay = useRef(false);

  // Track days since last app open
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LAST_OPEN_KEY);
        if (stored) {
          const lastTs = parseInt(stored, 10);
          const diffMs = Date.now() - lastTs;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          setDaysSinceLastOpen(diffDays);
        }
        await AsyncStorage.setItem(LAST_OPEN_KEY, String(Date.now()));
      } catch {
        // AsyncStorage failure is non-critical
      }
    })();
  }, []);

  const { data: lastCheckin } = useQuery({
    queryKey: ['last-checkin', patientId],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_checkins')
        .select('response, triggered_at')
        .eq('patient_id', patientId!)
        .order('triggered_at', { ascending: false })
        .limit(1)
        .single();
      if (!data?.response) return null;
      return {
        message: data.response as string,
        isToday: new Date(data.triggered_at).toDateString() === new Date().toDateString(),
      };
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });

  // Derived check-in message (handle both string from cache seeding and object from query)
  const checkinMessage = typeof lastCheckin === 'string'
    ? lastCheckin
    : lastCheckin?.message ?? null;
  const isCheckinFresh = typeof lastCheckin === 'string' || (lastCheckin?.isToday ?? false);

  const { data: activeModule, isLoading: moduleLoading } = useQuery({
    queryKey: ['active-module', patientId],
    queryFn: () => fetchActiveModule(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const level = (patient?.level ?? 'seed') as import('@fayth/types').Level;
  const totalXp = patient?.total_xp ?? 0;
  const streak = patient?.daily_checkin_streak ?? 0;

  // ── Fay companion state ──
  const {
    state: fayState,
    messageVisible: fayMessageVisible,
    toggleMessage: toggleFayMessage,
    dismissMessage: dismissFayMessage,
  } = useFay({
    level,
    streakDays: streak,
    todayLogComplete: !!todayLog,
    daysSinceLastOpen,
    lastFocusScore: todayLog?.focus_score,
    lastMoodScore: todayLog?.mood_score,
    dailyActionsComplete: !!todayLog && !activeModule,
  });

  // Auto-show Fay's tooltip on first load (brief delay for entrance feel)
  useEffect(() => {
    if (!patientLoading && fayState.message && !hasAutoShownFay.current) {
      hasAutoShownFay.current = true;
      const timer = setTimeout(() => {
        if (!fayMessageVisible) toggleFayMessage();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [patientLoading, fayState.message]);

  // When a fresh AI check-in arrives, auto-show Fay's tooltip
  useEffect(() => {
    if (checkinMessage && checkinMessage !== prevCheckinRef.current && isCheckinFresh) {
      prevCheckinRef.current = checkinMessage;
      if (!fayMessageVisible) toggleFayMessage();
    }
  }, [checkinMessage, isCheckinFresh]);

  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  // Skeleton loading state instead of blank spinner
  if (patientLoading) {
    return <HomeSkeleton />;
  }

  // Determine Fay's displayed message: AI check-in takes priority
  const fayDisplayMessage =
    checkinGenerating
      ? '...'
      : isCheckinFresh && checkinMessage
        ? checkinMessage
        : fayState.message?.text ?? null;

  const fayDisplayState =
    checkinGenerating
      ? 'glowing' as const
      : isCheckinFresh && checkinMessage
        ? 'attentive' as const
        : fayState.visualState;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Greeting + Fay */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
        <Fay
          visualState={fayDisplayState}
          evolutionStage={fayState.evolutionStage}
          message={fayDisplayMessage}
          messageVisible={checkinGenerating || fayMessageVisible}
          onPress={toggleFayMessage}
        />
      </View>

      {/* Stats Row */}
      {(() => {
        const lp = getLevelProgress(totalXp);
        return (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{lp.label}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={[styles.statCard, styles.xpCard]}>
              <Text style={styles.statValue}>{totalXp.toLocaleString()}</Text>
              <Text style={styles.statLabel}>XP</Text>
              {lp.nextLabel && (
                <View style={styles.xpBarSection}>
                  <View style={styles.xpBarBg}>
                    <View style={[styles.xpBarFill, { width: `${lp.progress * 100}%` }]} />
                  </View>
                  <Text style={styles.xpBarLabel}>
                    {lp.xpIntoLevel}/{lp.xpNeededForNext} to {lp.nextLabel}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        );
      })()}

      {/* Daily Check-in Card */}
      {logLoading ? (
        <Skeleton width="100%" height={120} style={{ borderRadius: Radii.lg, marginBottom: Spacing.md }} />
      ) : !todayLog ? (
        <Pressable
          style={({ pressed }) => [
            styles.promptCard,
            pressed && styles.promptCardPressed,
          ]}
          onPress={() => router.push('/(tabs)/log')}
          accessibilityRole="button"
          accessibilityLabel="Log how you are feeling today"
        >
          <Text style={styles.promptTitle}>How are you feeling today?</Text>
          <Text style={styles.promptSubtitle}>
            Take a moment to check in with yourself. Your daily log helps track your progress.
          </Text>
          <View style={styles.promptAction}>
            <Text style={styles.promptActionText}>Log Now</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.completedCard}>
          <Text style={styles.completedTitle}>Today's check-in complete</Text>
          <Text style={styles.completedSubtitle}>
            Focus: {todayLog.focus_score} | Mood: {todayLog.mood_score} | Energy:{' '}
            {todayLog.energy_score}
          </Text>
        </View>
      )}

      {/* Continue Module Card / Empty State */}
      {moduleLoading ? (
        <Skeleton width="100%" height={100} style={{ borderRadius: Radii.lg, marginBottom: Spacing.md }} />
      ) : activeModule ? (
        <Pressable
          style={({ pressed }) => [
            styles.continueCard,
            pressed && styles.continueCardPressed,
          ]}
          onPress={() => {
            if (activeModule.nextItemType === 'psychoeducation') {
              router.push(`/module/${activeModule.moduleId}/read/${activeModule.nextItemId}`);
            } else {
              router.push(`/worksheet/${activeModule.nextItemId}`);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={`Continue ${activeModule.moduleTitle}`}
        >
          <Text style={styles.continueLabel}>Continue</Text>
          <Text style={styles.continueModuleTitle}>
            Module {activeModule.chapterNumber}: {activeModule.moduleTitle}
          </Text>
          <Text style={styles.continueNextItem}>
            Next: {activeModule.nextItemTitle}
          </Text>
          <View style={styles.continueProgressRow}>
            <View style={styles.continueProgressBg}>
              <View
                style={[
                  styles.continueProgressFill,
                  {
                    width: `${(activeModule.completedCount / activeModule.totalCount) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.continueProgressText}>
              {activeModule.completedCount}/{activeModule.totalCount}
            </Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.emptyModuleCard}>
          <Text style={styles.emptyModuleTitle}>Your programme</Text>
          <Text style={styles.emptyModuleSubtitle}>
            Your psychologist will assign modules based on your needs.
            In the meantime, explore what's available.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.emptyModuleAction,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push('/(tabs)/modules')}
          >
            <Text style={styles.emptyModuleActionText}>Browse Modules</Text>
          </Pressable>
        </View>
      )}

      {/* AI Check-in — older messages (not from today) shown as card fallback */}
      {checkinMessage && !isCheckinFresh && (
        <View style={styles.checkinCard}>
          <Text style={styles.checkinLabel}>Fay's last note</Text>
          <Text style={styles.checkinText}>{checkinMessage}</Text>
        </View>
      )}

      {/* Getting Started Tips — shown for brand-new users */}
      {totalXp === 0 && !todayLog && !logLoading && (
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Getting started</Text>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>1</Text>
            <Text style={styles.tipText}>Log how you're feeling — it takes 30 seconds</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>2</Text>
            <Text style={styles.tipText}>Your psychologist will assign therapy modules</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>3</Text>
            <Text style={styles.tipText}>Fay checks in with you daily — tap her to chat</Text>
          </View>
        </View>
      )}

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <Pressable
          style={({ pressed }) => [
            styles.quickLink,
            pressed && styles.quickLinkPressed,
          ]}
          onPress={() => router.push('/(tabs)/modules')}
        >
          <Text style={styles.quickLinkTitle}>All Modules</Text>
          <Text style={styles.quickLinkSubtitle}>Browse the full programme</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  name: {
    fontSize: FontSizes.hero,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  xpCard: {
    flex: 1.5,
  },
  xpBarSection: {
    width: '100%',
    marginTop: Spacing.xs,
  },
  xpBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  xpBarLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  promptCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  promptCardPressed: {
    opacity: 0.9,
  },
  promptTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
  },
  promptSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  promptAction: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  promptActionText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  completedCard: {
    backgroundColor: Colors.successLight,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  completedTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
  },
  completedSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  // Continue card
  continueCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  continueCardPressed: {
    backgroundColor: Colors.primaryLight,
  },
  continueLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  continueModuleTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  continueNextItem: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  continueProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  continueProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  continueProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  continueProgressText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  checkinCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  checkinLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  checkinText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
  },
  // Empty module state
  emptyModuleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyModuleTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyModuleSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  emptyModuleAction: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  emptyModuleActionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  // Tips card
  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tipsTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tipBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.primary,
    overflow: 'hidden',
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Quick links
  quickLinks: {
    marginTop: Spacing.sm,
  },
  quickLink: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  quickLinkPressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  quickLinkTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  quickLinkSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
