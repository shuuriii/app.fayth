import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { usePatient } from '@/hooks/usePatient';
import { useSymptomLog } from '@/hooks/useSymptomLog';
import { Colors, FontSizes, Spacing, Radii, LEVEL_LABELS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, patient, loading: patientLoading, refetch } = usePatient(user?.id);
  const { todayLog, loading: logLoading } = useSymptomLog(user?.id);
  const [lastCheckin, setLastCheckin] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchLastCheckin() {
      const { data } = await supabase
        .from('ai_checkins')
        .select('response')
        .eq('patient_id', user!.id)
        .order('triggered_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setLastCheckin(data.response);
      }
    }

    fetchLastCheckin();
  }, [user?.id]);

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
  const level = patient?.level ?? 'seed';
  const totalXp = patient?.total_xp ?? 0;
  const streak = patient?.daily_checkin_streak ?? 0;

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
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.name}>{firstName}</Text>
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
          <Text style={styles.quickLinkTitle}>Continue Modules</Text>
          <Text style={styles.quickLinkSubtitle}>Pick up where you left off</Text>
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
  greetingSection: {
    marginBottom: Spacing.lg,
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
