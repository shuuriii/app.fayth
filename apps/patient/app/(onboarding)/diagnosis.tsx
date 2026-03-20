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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors, FontSizes, Spacing, Radii, SUBTYPE_LABELS } from '@/lib/constants';
import type { AdhdSubtype } from '@fayth/types';

const SUBTYPES: { value: AdhdSubtype; label: string; description: string }[] = [
  {
    value: 'inattentive',
    label: SUBTYPE_LABELS.inattentive,
    description: 'Difficulty sustaining attention, easily distracted, forgetful',
  },
  {
    value: 'hyperactive',
    label: SUBTYPE_LABELS.hyperactive,
    description: 'Restlessness, difficulty staying still, impulsive actions',
  },
  {
    value: 'combined',
    label: SUBTYPE_LABELS.combined,
    description: 'A mix of inattentive and hyperactive-impulsive symptoms',
  },
];

export default function DiagnosisScreen() {
  const router = useRouter();
  const { fullName, dob } = useLocalSearchParams<{ fullName: string; dob: string }>();

  const [selectedSubtype, setSelectedSubtype] = useState<AdhdSubtype | null>(null);
  const [diagDateText, setDiagDateText] = useState('');
  const [loading, setLoading] = useState(false);

  function formatDateInput(text: string): string {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }

  function parseDate(text: string): Date | null {
    const parts = text.split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    if (!dd || !mm || !yyyy || yyyy.length !== 4) return null;

    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10) - 1;
    const year = parseInt(yyyy, 10);

    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    if (date > new Date()) return null;
    return date;
  }

  const diagDate = diagDateText.length === 10 ? parseDate(diagDateText) : null;
  const isFormValid = selectedSubtype !== null;

  async function handleCompleteSetup() {
    if (!selectedSubtype || !fullName) {
      Alert.alert('Incomplete', 'Please select your ADHD subtype.');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Not authenticated. Please log in again.');
        router.replace('/(auth)/login');
        return;
      }

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: user.id,
        role: 'patient',
        full_name: fullName,
        phone: user.phone ?? null,
      });

      if (profileError) {
        throw profileError;
      }

      // Create patient record
      const { error: patientError } = await supabase.from('patients').insert({
        user_id: user.id,
        adhd_subtype: selectedSubtype,
        diagnosis_date: diagDate ? diagDate.toISOString().split('T')[0] : null,
        adjustment_stage: 1,
        onboarding_complete: true,
        total_xp: 0,
        level: 'seed',
        daily_checkin_streak: 0,
      });

      if (patientError) {
        throw patientError;
      }

      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Setup Failed', err.message ?? 'Could not complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.step}>Step 2 of 2</Text>
          <Text style={styles.title}>Your diagnosis</Text>
          <Text style={styles.subtitle}>
            This helps us tailor the programme to your specific needs. You can change this later.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>ADHD Subtype</Text>
          {SUBTYPES.map((subtype) => {
            const isSelected = selectedSubtype === subtype.value;
            return (
              <Pressable
                key={subtype.value}
                style={[styles.subtypeCard, isSelected && styles.subtypeCardSelected]}
                onPress={() => setSelectedSubtype(subtype.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.subtypeContent}>
                  <Text style={[styles.subtypeLabel, isSelected && styles.subtypeLabelSelected]}>
                    {subtype.label}
                  </Text>
                  <Text style={styles.subtypeDesc}>{subtype.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Diagnosis Date (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={Colors.textTertiary}
            value={diagDateText}
            onChangeText={(text) => setDiagDateText(formatDateInput(text))}
            keyboardType="number-pad"
            maxLength={10}
            accessibilityLabel="Diagnosis date"
          />
          {diagDateText.length === 10 && !diagDate && (
            <Text style={styles.errorText}>Please enter a valid date (not in the future)</Text>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            !isFormValid && styles.buttonDisabled,
            pressed && isFormValid && styles.buttonPressed,
          ]}
          onPress={handleCompleteSetup}
          disabled={!isFormValid || loading}
          accessibilityRole="button"
          accessibilityLabel="Complete setup"
        >
          {loading ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.buttonText}>Complete Setup</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 80,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  step: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtypeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  subtypeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radii.full,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
  },
  subtypeContent: {
    flex: 1,
  },
  subtypeLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  subtypeLabelSelected: {
    color: Colors.primaryDark,
  },
  subtypeDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: Spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: Colors.locked,
  },
  buttonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  buttonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
});
