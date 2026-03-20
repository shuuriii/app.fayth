import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useContentItems, ContentItem, ContentResponse } from '@/hooks/useContentItems';
import { WorksheetRenderer } from '@/components/WorksheetRenderer';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

type ScreenState = 'loading' | 'form' | 'submitting' | 'success' | 'error' | 'already_done';

export default function WorksheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { fetchContentItem, submitResponse, getResponseForItem, loading: hookLoading } = useContentItems();

  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [existingResponse, setExistingResponse] = useState<ContentResponse | null>(null);
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    setScreenState('loading');
    try {
      const item = await fetchContentItem(id!);
      if (!item) {
        setScreenState('error');
        return;
      }
      setContentItem(item);

      // Check for existing response
      const existing = await getResponseForItem(id!);
      if (existing) {
        setExistingResponse(existing);
        // Pre-fill form with existing data so user can review
        setValues(existing.response_data ?? {});
        setScreenState('already_done');
      } else {
        setScreenState('form');
      }
    } catch {
      setScreenState('error');
    }
  }

  const handleChange = useCallback((fieldId: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for this field when user interacts
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

    const result = await submitResponse(id, values);
    if (result.success) {
      setScreenState('success');
    } else {
      Alert.alert('Error', result.error ?? 'Something went wrong. Please try again.');
      setScreenState('form');
    }
  }

  function handleRetake() {
    setExistingResponse(null);
    setValues({});
    setErrors({});
    setScreenState('form');
  }

  // ── Header ─────────────────────────────────────────────────────────

  const headerTitle = contentItem
    ? contentItem.title.length > 30
      ? contentItem.title.slice(0, 28) + '...'
      : contentItem.title
    : 'Worksheet';

  const stackScreenOptions = {
    headerShown: true,
    headerTitle: headerTitle,
    headerBackTitle: 'Back',
    headerTintColor: Colors.primary,
    headerStyle: { backgroundColor: Colors.background },
    headerTitleStyle: { color: Colors.text, fontWeight: '600' as const },
  };

  // ── Loading ────────────────────────────────────────────────────────

  if (screenState === 'loading') {
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

  // ── Error ──────────────────────────────────────────────────────────

  if (screenState === 'error' || !contentItem) {
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

  // ── Success ────────────────────────────────────────────────────────

  if (screenState === 'success') {
    return (
      <>
        <Stack.Screen options={stackScreenOptions} />
        <View style={styles.successContainer}>
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

            <Pressable
              onPress={() => router.back()}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Back to Module</Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  // ── Submitting ─────────────────────────────────────────────────────

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

  // ── Already Done (review mode) ────────────────────────────────────

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
          {/* Title and instructions */}
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

          {/* Form fields */}
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

          {/* Submit button (only in form mode) */}
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

          {/* Bottom spacing */}
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

  // Loading
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },

  // Error
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

  // Worksheet header
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

  // Review mode
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

  // AI feedback
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

  // Form
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

  // Submit
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
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
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
    marginBottom: Spacing.lg,
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
  },
  doneButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
});
