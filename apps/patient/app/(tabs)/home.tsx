import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { usePatient } from '@/hooks/usePatient';
import { useSymptomLog } from '@/hooks/useSymptomLog';
import { useFay } from '@/hooks/useFay';
import { Fay } from '@/components/Fay';
import { Colors, FontSizes, Spacing, Radii, LEVEL_LABELS, FAY_EVOLUTION_LABELS } from '@/lib/constants';
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

async function fetchActiveModule(userId: string): Promise<ActiveModuleItem | null> {
  // Find the first active/assigned module
  const { data: patientModules } = await supabase
    .from('patient_modules')
    .select('module_id, status')
    .eq('patient_id', userId)
    .in('status', ['active', 'assigned'])
    .limit(1);

  if (!patientModules || patientModules.length === 0) return null;

  const pm = patientModules[0];

  // Get module info
  const { data: mod } = await supabase
    .from('yb_modules')
    .select('id, title, chapter_number')
    .eq('id', pm.module_id)
    .single();

  if (!mod) return null;

  // Get content items for this module
  const { data: items } = await supabase
    .from('yb_content_items')
    .select('id, title, type')
    .eq('module_id', mod.id)
    .order('id', { ascending: true });

  if (!items || items.length === 0) return null;

  // Get completed responses
  const itemIds = items.map((i) => i.id);
  const { data: responses } = await supabase
    .from('patient_content_responses')
    .select('content_item_id')
    .eq('patient_id', userId)
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

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, patient, loading: patientLoading, refetch } = usePatient(user?.id);
  const { todayLog, loading: logLoading } = useSymptomLog(user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [daysSinceLastOpen, setDaysSinceLastOpen] = useState(0);

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
    queryKey: ['last-checkin', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_checkins')
        .select('response')
        .eq('patient_id', user!.id)
        .order('triggered_at', { ascending: false })
        .limit(1)
        .single();
      return data?.response ?? null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: activeModule } = useQuery({
    queryKey: ['active-module', user?.id],
    queryFn: () => fetchActiveModule(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  if (patientLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

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
          visualState={fayState.visualState}
          evolutionStage={fayState.evolutionStage}
          message={fayState.message?.text}
          messageVisible={fayMessageVisible}
          onPress={toggleFayMessage}
        />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{LEVEL_LABELS[level] ?? level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalXp.toLocaleString()}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Daily Check-in Card */}
      {!todayLog ? (
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

      {/* Continue Module Card */}
      {activeModule && (
        <Pressable
          style={({ pressed }) => [
            styles.continueCard,
            pressed && styles.continueCardPressed,
          ]}
          onPress={() => {
            if (activeModule.nextItemType === 'psychoeducation') {
              router.push(`/module/${activeModule.moduleId}`);
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
      )}

      {/* AI Check-in Message */}
      {lastCheckin && (
        <View style={styles.checkinCard}>
          <Text style={styles.checkinLabel}>Your last check-in note</Text>
          <Text style={styles.checkinText}>{lastCheckin}</Text>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
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
