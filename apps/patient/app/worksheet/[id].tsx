import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useWorksheet, useSubmitWorksheet } from '@/hooks/useWorksheet';
import { WorksheetRenderer } from '@/components/WorksheetRenderer';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

const DRAFT_PREFIX = 'worksheet_draft_';
const AUTOSAVE_DELAY = 800; // ms

type ScreenState = 'form' | 'submitting' | 'success' | 'already_done';

export default function WorksheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error: fetchError } = useWorksheet(id);
  const submitMutation = useSubmitWorksheet();

  const [screenState, setScreenState] = useState<ScreenState | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initializedForItem, setInitializedForItem] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contentItem = data?.item ?? null;
  const existingResponse = data?.existingResponse ?? null;

  // Initialize form state once data loads, restoring draft if available
  if (data && id && initializedForItem !== id) {
    if (existingResponse) {
      setValues(existingResponse.response_data ?? {});
      setScreenState('already_done');
      setDraftRestored(true);
    } else {
      setValues({});
      setScreenState('form');
      setDraftRestored(false);
    }
    setErrors({});
    setInitializedForItem(id);
  }

  // Restore draft from AsyncStorage (only for new responses, not review mode)
  useEffect(() => {
    if (!id || draftRestored || screenState !== 'form') return;

    AsyncStorage.getItem(`${DRAFT_PREFIX}${id}`).then((saved) => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            setValues(parsed);
          }
        } catch {
          // Corrupted draft, ignore
        }
      }
      setDraftRestored(true);
    });
  }, [id, draftRestored, screenState]);

  // Auto-save draft to AsyncStorage on value changes (debounced)
  useEffect(() => {
    if (!id || screenState !== 'form' || !draftRestored) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    autosaveTimer.current = setTimeout(() => {
      if (Object.keys(values).length > 0) {
        AsyncStorage.setItem(`${DRAFT_PREFIX}${id}`, JSON.stringify(values)).catch(() => {});
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [values, id, screenState, draftRestored]);

  const handleChange = useCallback((fieldId: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (prev[fieldId]) {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      }
      return prev;
    });
  }, []);

  function validate(): boolean {
    const fields = contentItem?.schema?.fields ?? [];
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      if (!field.required) continue;
      const val = values[field.id];

      if (val === undefined || val === null || val === '') {
        newErrors[field.id] = 'This field is required';
        continue;
      }

      if (field.type === 'checkbox' && Array.isArray(val) && val.length === 0) {
        newErrors[field.id] = 'Please select at least one option';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!contentItem || !id) return;

    if (!validate()) {
      Alert.alert(
        'Missing answers',
        'Please fill in all required fields (marked with *) before submitting.',
      );
      return;
    }

    setScreenState('submitting');

    try {
      await submitMutation.mutateAsync({
        contentItemId: id,
        responseData: values,
        xpValue: contentItem.xp_value,
      });
      // Clear draft after successful submission
      AsyncStorage.removeItem(`${DRAFT_PREFIX}${id}`).catch(() => {});
      setScreenState('success');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong. Please try again.');
      setScreenState('form');
    }
  }

  function handleRetake() {
    setValues({});
    setErrors({});
    setScreenState('form');
  }

  // Header
  const headerTitle = contentItem
    ? contentItem.title.length > 30
      ? contentItem.title.slice(0, 28) + '...'
      : contentItem.title
    : 'Worksheet';

  const stackScreenOptions = {
    headerShown: true,
    headerTitle,
    headerBackTitle: 'Back',
    headerTintColor: Colors.primary,
    headerStyle: { backgroundColor: Colors.background },
    headerTitleStyle: { color: Colors.text, fontWeight: '600' as const },
  };

  // Loading
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={stackScreenOptions} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading worksheet...</Text>
        </View>
      </>
    );
  }

  // Error
  if (fetchError || !contentItem) {
    return (
      <>
        <Stack.Screen options={stackScreenOptions} />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Could not load this worksheet</Text>
          <Text style={styles.errorSubtext}>Please go back and try again.</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </>
    );
  }

  // Success with score
  if (screenState === 'success') {
    const scoring = contentItem.schema?.scoring;
    const fields = contentItem.schema?.fields ?? [];

    return (
      <>
        <Stack.Screen options={stackScreenOptions} />
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.successScrollContent}
        >
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Text style={styles.successIcon}>{'✓'}</Text>
            </View>
            <Text style={styles.successTitle}>Well done!</Text>
            <Text style={styles.successSubtext}>
              Your responses have been saved. Your therapist will review them.
            </Text>

            {contentItem.xp_value > 0 && (
              <View style={styles.xpEarned}>
                <Text style={styles.xpEarnedNumber}>+{contentItem.xp_value}</Text>
                <Text style={styles.xpEarnedLabel}>XP earned</Text>
              </View>
            )}
          </View>

          {scoring && scoring.method !== 'none' && fields.length > 0 && (
            <ScoreDisplay scoring={scoring} fields={fields} values={values} />
          )}

          <Pressable
            onPress={() => router.back()}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Back to Module</Text>
          </Pressable>
        </ScrollView>
      </>
    );
  }

  // Submitting
  if (screenState === 'submitting') {
    return (
      <>
        <Stack.Screen options={stackScreenOptions} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Saving your responses...</Text>
        </View>
      </>
    );
  }

  // Form / Review mode
  const isReviewMode = screenState === 'already_done';
  const fields = contentItem.schema?.fields ?? [];
  const instructionsForPatient = contentItem.schema?.instructions_for_patient;

  return (
    <>
      <Stack.Screen options={stackScreenOptions} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.worksheetTitle}>{contentItem.title}</Text>

          {contentItem.instructions ? (
            <Text style={styles.instructions}>{contentItem.instructions}</Text>
          ) : null}

          {instructionsForPatient ? (
            <View style={styles.patientInstructions}>
              <Text style={styles.patientInstructionsTitle}>Before you begin</Text>
              <Text style={styles.patientInstructionsText}>{instructionsForPatient}</Text>
            </View>
          ) : null}

          {isReviewMode && (
            <View style={styles.reviewBanner}>
              <Text style={styles.reviewBannerText}>
                You have already completed this worksheet. You can review your answers below or retake it.
              </Text>
              <Pressable onPress={handleRetake} style={styles.retakeButton}>
                <Text style={styles.retakeButtonText}>Retake Worksheet</Text>
              </Pressable>
            </View>
          )}

          {existingResponse?.ai_feedback && isReviewMode ? (
            <View style={styles.aiFeedbackCard}>
              <Text style={styles.aiFeedbackTitle}>Feedback</Text>
              <Text style={styles.aiFeedbackText}>{existingResponse.ai_feedback}</Text>
            </View>
          ) : null}

          {isReviewMode && contentItem.schema?.scoring && contentItem.schema.scoring.method !== 'none' && fields.length > 0 && (
            <ScoreDisplay
              scoring={contentItem.schema.scoring}
              fields={fields}
              values={values}
            />
          )}

          {fields.length > 0 ? (
            <View style={styles.formSection}>
              <WorksheetRenderer
                fields={fields}
                values={values}
                onChange={handleChange}
                errors={errors}
              />
            </View>
          ) : (
            <View style={styles.noFieldsContainer}>
              <Text style={styles.noFieldsText}>
                This item does not have form fields to fill in.
              </Text>
            </View>
          )}

          {!isReviewMode && fields.length > 0 && (
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
              ]}
            >
              <Text style={styles.submitButtonText}>Submit Responses</Text>
              {contentItem.xp_value > 0 && (
                <Text style={styles.submitXpHint}>+{contentItem.xp_value} XP</Text>
              )}
            </Pressable>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  errorSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: Radii.md,
  },
  backButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  worksheetTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  instructions: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  patientInstructions: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  patientInstructionsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
  },
  patientInstructionsText: {
    fontSize: FontSizes.sm,
    color: Colors.primaryDark,
    lineHeight: 22,
  },
  reviewBanner: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  reviewBannerText: {
    fontSize: FontSizes.sm,
    color: '#92400e',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  retakeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.warning,
    borderRadius: Radii.sm,
  },
  retakeButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#ffffff',
  },
  aiFeedbackCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  aiFeedbackTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: Spacing.xs,
  },
  aiFeedbackText: {
    fontSize: FontSizes.sm,
    color: '#0c4a6e',
    lineHeight: 22,
  },
  formSection: {
    marginTop: Spacing.sm,
  },
  noFieldsContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  noFieldsText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  submitButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  submitXpHint: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primaryLight,
    marginTop: Spacing.xs,
  },
  // Success
  successScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successIcon: {
    fontSize: 36,
    color: Colors.primary,
    fontWeight: '700',
  },
  successTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  successSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  xpEarned: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
  },
  xpEarnedNumber: {
    fontSize: FontSizes.hero,
    fontWeight: '800',
    color: Colors.primary,
  },
  xpEarnedLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginTop: Spacing.xs,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  doneButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
});
