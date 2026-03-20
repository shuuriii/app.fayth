import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useSymptomLog } from '@/hooks/useSymptomLog';
import { ScoreSlider } from '@/components/ScoreSlider';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

export default function LogScreen() {
  const { user } = useAuth();
  const { todayLog, submitting, submitLog, loading } = useSymptomLog(user?.id);

  const [focus, setFocus] = useState(5);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [impulsivity, setImpulsivity] = useState(5);
  const [sleepHours, setSleepHours] = useState('7');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    const hours = parseFloat(sleepHours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      Alert.alert('Invalid Sleep Hours', 'Please enter a valid number between 0 and 24.');
      return;
    }

    try {
      await submitLog({
        focus_score: focus,
        mood_score: mood,
        energy_score: energy,
        impulsivity_score: impulsivity,
        sleep_hours: hours,
        notes: notes.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to submit your log. Please try again.');
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Already logged today or just submitted
  if (todayLog || submitted) {
    const log = todayLog;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.successContent}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>{'~'}</Text>
          <Text style={styles.successTitle}>
            {submitted ? 'Log submitted!' : "You've already logged today"}
          </Text>
          <Text style={styles.successSubtitle}>
            {submitted
              ? 'Great job checking in with yourself. Every log helps you understand your patterns better.'
              : 'Come back tomorrow to log again. Consistency is key!'}
          </Text>

          {log && (
            <View style={styles.summaryGrid}>
              <SummaryItem label="Focus" value={log.focus_score} />
              <SummaryItem label="Mood" value={log.mood_score} />
              <SummaryItem label="Energy" value={log.energy_score} />
              <SummaryItem label="Impulsivity" value={log.impulsivity_score} />
              <SummaryItem label="Sleep" value={`${log.sleep_hours}h`} />
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Daily Check-in</Text>
          <Text style={styles.subtitle}>
            Rate how you have been feeling today. There are no right or wrong answers.
          </Text>
        </View>

        <View style={styles.slidersSection}>
          <ScoreSlider
            label="Focus"
            value={focus}
            onChange={setFocus}
            lowLabel="Very distracted"
            highLabel="Highly focused"
          />

          <ScoreSlider
            label="Mood"
            value={mood}
            onChange={setMood}
            lowLabel="Very low"
            highLabel="Very good"
          />

          <ScoreSlider
            label="Energy"
            value={energy}
            onChange={setEnergy}
            lowLabel="Exhausted"
            highLabel="Very energetic"
          />

          <ScoreSlider
            label="Impulsivity"
            value={impulsivity}
            onChange={setImpulsivity}
            lowLabel="Very impulsive"
            highLabel="Very controlled"
          />
        </View>

        <View style={styles.sleepSection}>
          <Text style={styles.fieldLabel}>Hours of Sleep</Text>
          <View style={styles.sleepRow}>
            <Pressable
              style={styles.sleepButton}
              onPress={() => {
                const val = Math.max(0, parseFloat(sleepHours || '0') - 0.5);
                setSleepHours(val.toString());
              }}
              accessibilityLabel="Decrease sleep hours"
            >
              <Text style={styles.sleepButtonText}>-</Text>
            </Pressable>
            <TextInput
              style={styles.sleepInput}
              value={sleepHours}
              onChangeText={setSleepHours}
              keyboardType="decimal-pad"
              maxLength={4}
              accessibilityLabel="Sleep hours"
            />
            <Pressable
              style={styles.sleepButton}
              onPress={() => {
                const val = Math.min(24, parseFloat(sleepHours || '0') + 0.5);
                setSleepHours(val.toString());
              }}
              accessibilityLabel="Increase sleep hours"
            >
              <Text style={styles.sleepButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Anything you want to remember about today..."
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Notes"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="Log today's check-in"
        >
          {submitting ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.submitButtonText}>Log Today</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SummaryItem({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  slidersSection: {
    marginBottom: Spacing.md,
  },
  sleepSection: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sleepButton: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sleepButtonText: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  sleepInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    height: 48,
  },
  notesSection: {
    marginBottom: Spacing.lg,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    minHeight: 100,
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  submitButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  // Success state
  successContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: 64,
  },
  summaryValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
