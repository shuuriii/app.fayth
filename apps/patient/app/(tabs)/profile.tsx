import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { usePatient } from '@/hooks/usePatient';
import {
  Colors,
  FontSizes,
  Spacing,
  Radii,
  SUBTYPE_LABELS,
  ADJUSTMENT_STAGE_LABELS,
  LEVEL_LABELS,
} from '@/lib/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, patient, psychologist, psychiatrist, loading } = usePatient(user?.id);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (err: any) {
            Alert.alert('Error', err.message ?? 'Failed to sign out');
            setSigningOut(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const subtypeLabel = patient?.adhd_subtype
    ? SUBTYPE_LABELS[patient.adhd_subtype] ?? patient.adhd_subtype
    : 'Not set';

  const adjustmentLabel = patient?.adjustment_stage
    ? ADJUSTMENT_STAGE_LABELS[patient.adjustment_stage] ?? `Stage ${patient.adjustment_stage}`
    : 'Not assessed';

  const levelLabel = patient?.level
    ? LEVEL_LABELS[patient.level] ?? patient.level
    : 'Seed';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.full_name ?? 'Patient'}</Text>
        {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
      </View>

      {/* ADHD Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your ADHD Profile</Text>

        <View style={styles.infoCard}>
          <InfoRow label="Subtype" value={subtypeLabel} />
          <View style={styles.divider} />
          <InfoRow
            label="Adjustment Stage"
            value={`${patient?.adjustment_stage ?? 1} - ${adjustmentLabel}`}
          />
          <View style={styles.divider} />
          <InfoRow label="Level" value={`${levelLabel} (${patient?.total_xp ?? 0} XP)`} />
          <View style={styles.divider} />
          <InfoRow
            label="Diagnosis Date"
            value={
              patient?.diagnosis_date
                ? new Date(patient.diagnosis_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Not provided'
            }
          />
        </View>
      </View>

      {/* Providers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Care Team</Text>

        <View style={styles.infoCard}>
          <InfoRow
            label="Psychologist"
            value={psychologist?.full_name ?? 'Not assigned yet'}
          />
          <View style={styles.divider} />
          <InfoRow
            label="Psychiatrist"
            value={psychiatrist?.full_name ?? 'Not assigned yet'}
          />
        </View>
      </View>

      {/* Sign Out */}
      <Pressable
        style={({ pressed }) => [
          styles.signOutButton,
          pressed && styles.signOutButtonPressed,
        ]}
        onPress={handleSignOut}
        disabled={signingOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        {signingOut ? (
          <ActivityIndicator color={Colors.error} />
        ) : (
          <Text style={styles.signOutText}>Sign Out</Text>
        )}
      </Pressable>

      <Text style={styles.version}>fayth v0.0.1</Text>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: FontSizes.hero,
    fontWeight: '700',
    color: Colors.primary,
  },
  name: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  phone: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: Spacing.md,
  },
  signOutButtonPressed: {
    backgroundColor: Colors.errorLight,
  },
  signOutText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.error,
  },
  version: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
