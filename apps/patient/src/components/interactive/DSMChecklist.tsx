import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';
import { FayContextBubble } from '@/components/adhd-ux/FayContextBubble';
import { FieldRenderer } from '@/components/WorksheetRenderer';
import type { YBField } from '@/components/WorksheetRenderer';

// ── Types ───────────────────────────────────────────────────────────────

interface DSMChecklistProps {
  fields: YBField[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  onSubmit: () => void;
  scoring?: {
    method: string;
    subscales?: Record<string, any>;
    interpretation?: Record<string, string>;
  };
  xpValue?: number;
}

type Domain = 'ia' | 'hi';

interface ClassifiedField {
  field: YBField;
  domain: Domain;
}

// ── Constants ───────────────────────────────────────────────────────────

const IA_ACCENT = '#3b82f6';
const IA_ACCENT_LIGHT = '#eff6ff';
const HI_ACCENT = '#f97316';
const HI_ACCENT_LIGHT = '#fff7ed';

const AUTO_ADVANCE_DELAY = 400;

// ── Helpers ─────────────────────────────────────────────────────────────

function classifyFields(fields: YBField[]) {
  const symptomFields: ClassifiedField[] = [];
  const supplementaryFields: YBField[] = [];

  let currentDomain: Domain = 'ia';

  for (const field of fields) {
    if (field.id.startsWith('section_header')) {
      // Detect domain from section header content
      if (
        field.label.toLowerCase().includes('hyperactiv') ||
        field.label.toLowerCase().includes('impulsiv')
      ) {
        currentDomain = 'hi';
      }
      continue;
    }

    if (field.id.startsWith('ia')) {
      symptomFields.push({ field, domain: 'ia' });
    } else if (field.id.startsWith('hi')) {
      symptomFields.push({ field, domain: 'hi' });
    } else {
      supplementaryFields.push(field);
    }
  }

  return { symptomFields, supplementaryFields };
}

function getScoreValue(field: YBField, value: string | undefined): number {
  if (!value || !field.options || !field.score_values) return 0;
  const idx = field.options.indexOf(value);
  return idx >= 0 && idx < field.score_values.length ? field.score_values[idx] : 0;
}

// ── Animated Option Card ────────────────────────────────────────────────

function OptionCard({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  }, [onPress, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected,
        ]}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={label}
      >
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text
          style={[
            styles.optionLabel,
            isSelected && styles.optionLabelSelected,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Counter Pill ────────────────────────────────────────────────────────

function CounterPill({
  label,
  answered,
  total,
  oftenCount,
  accent,
  accentLight,
}: {
  label: string;
  answered: number;
  total: number;
  oftenCount: number;
  accent: string;
  accentLight: string;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const prevAnswered = useRef(answered);

  useEffect(() => {
    if (answered !== prevAnswered.current) {
      prevAnswered.current = answered;
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [answered, pulseAnim]);

  return (
    <View style={[styles.counterPill, { backgroundColor: accentLight, borderColor: accent }]}>
      <Text style={[styles.counterLabel, { color: accent }]}>{label}</Text>
      <Animated.Text
        style={[
          styles.counterValue,
          { color: accent, transform: [{ scale: pulseAnim }] },
        ]}
      >
        {answered}/{total}
      </Animated.Text>
      <Text style={[styles.counterOften, { color: accent }]}>
        {oftenCount} often
      </Text>
    </View>
  );
}

// ── Main Component ──────────────────────────────────────────────────────

export function DSMChecklist({
  fields,
  values,
  onChange,
  onSubmit,
  scoring,
  xpValue,
}: DSMChecklistProps) {
  const { symptomFields, supplementaryFields } = useMemo(
    () => classifyFields(fields),
    [fields],
  );

  const iaFields = useMemo(
    () => symptomFields.filter((sf) => sf.domain === 'ia'),
    [symptomFields],
  );
  const hiFields = useMemo(
    () => symptomFields.filter((sf) => sf.domain === 'hi'),
    [symptomFields],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // ── Domain stats ────────────────────────────────────────────────────

  const iaAnswered = iaFields.filter((sf) => values[sf.field.id] != null).length;
  const hiAnswered = hiFields.filter((sf) => values[sf.field.id] != null).length;

  const iaOften = iaFields.filter((sf) => values[sf.field.id] === 'Often').length;
  const hiOften = hiFields.filter((sf) => values[sf.field.id] === 'Often').length;

  const totalScore = useMemo(() => {
    return symptomFields.reduce((sum, sf) => {
      return sum + getScoreValue(sf.field, values[sf.field.id]);
    }, 0);
  }, [symptomFields, values]);

  // ── Navigation ──────────────────────────────────────────────────────

  const totalSymptoms = symptomFields.length;
  const currentItem = currentIndex < totalSymptoms ? symptomFields[currentIndex] : null;
  const isAtDomainBoundary =
    currentIndex > 0 &&
    currentIndex < totalSymptoms &&
    symptomFields[currentIndex - 1]?.domain === 'ia' &&
    symptomFields[currentIndex]?.domain === 'hi';

  const crossfadeTo = useCallback(
    (nextIndex: number) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // Check for domain transition
        if (
          nextIndex < totalSymptoms &&
          currentIndex < totalSymptoms &&
          symptomFields[currentIndex]?.domain === 'ia' &&
          symptomFields[nextIndex]?.domain === 'hi'
        ) {
          setShowTransition(true);
          fadeAnim.setValue(0);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();

          // Auto-dismiss transition after 2 seconds
          advanceTimer.current = setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start(() => {
              setShowTransition(false);
              setCurrentIndex(nextIndex);
              fadeAnim.setValue(0);
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }).start();
            });
          }, 2000);
          return;
        }

        if (nextIndex >= totalSymptoms) {
          setShowSummary(true);
        }

        setCurrentIndex(nextIndex);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    },
    [currentIndex, fadeAnim, symptomFields, totalSymptoms],
  );

  const handleSelect = useCallback(
    (option: string) => {
      if (!currentItem) return;
      onChange(currentItem.field.id, option);

      if (advanceTimer.current) clearTimeout(advanceTimer.current);

      advanceTimer.current = setTimeout(() => {
        if (currentIndex < totalSymptoms - 1) {
          crossfadeTo(currentIndex + 1);
        } else {
          // Last symptom item, go to summary
          crossfadeTo(totalSymptoms);
        }
      }, AUTO_ADVANCE_DELAY);
    },
    [currentItem, currentIndex, totalSymptoms, onChange, crossfadeTo],
  );

  const handleBack = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);

    if (showSummary) {
      setShowSummary(false);
      crossfadeTo(totalSymptoms - 1);
      return;
    }
    if (showTransition) {
      setShowTransition(false);
    }
    if (currentIndex > 0) {
      crossfadeTo(currentIndex - 1);
    }
  }, [currentIndex, showSummary, showTransition, totalSymptoms, crossfadeTo]);

  const handleTransitionContinue = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowTransition(false);
      // currentIndex should already be at the first HI item
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  // ── Progress bar ────────────────────────────────────────────────────

  const progress = showSummary
    ? 1
    : totalSymptoms > 0
      ? currentIndex / totalSymptoms
      : 0;

  // ── Render: Transition Card ─────────────────────────────────────────

  if (showTransition) {
    return (
      <View style={styles.container}>
        <CounterRow
          iaAnswered={iaAnswered}
          iaTotal={iaFields.length}
          iaOften={iaOften}
          hiAnswered={hiAnswered}
          hiTotal={hiFields.length}
          hiOften={hiOften}
        />
        <ProgressBar progress={iaFields.length / totalSymptoms} />
        <Animated.View style={[styles.transitionContainer, { opacity: fadeAnim }]}>
          <FayContextBubble
            message="Great -- now let's look at hyperactivity and impulsivity."
            position="top"
          />
          <Pressable
            onPress={handleTransitionContinue}
            style={styles.continueButton}
            accessibilityRole="button"
            accessibilityLabel="Continue to hyperactivity questions"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  // ── Render: Summary ─────────────────────────────────────────────────

  if (showSummary) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.summaryContent}>
        <CounterRow
          iaAnswered={iaAnswered}
          iaTotal={iaFields.length}
          iaOften={iaOften}
          hiAnswered={hiAnswered}
          hiTotal={hiFields.length}
          hiOften={hiOften}
        />
        <ProgressBar progress={1} />

        <Text style={styles.summaryHeading}>Your Results</Text>

        {/* Domain results */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryDot, { backgroundColor: IA_ACCENT }]} />
            <Text style={styles.summaryDomainLabel}>Inattention</Text>
            <Text style={[styles.summaryDomainValue, { color: IA_ACCENT }]}>
              {iaOften} items rated 'Often'
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <View style={[styles.summaryDot, { backgroundColor: HI_ACCENT }]} />
            <Text style={styles.summaryDomainLabel}>Hyperactivity / Impulsivity</Text>
            <Text style={[styles.summaryDomainValue, { color: HI_ACCENT }]}>
              {hiOften} items rated 'Often'
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total score</Text>
            <Text style={styles.summaryTotalValue}>{totalScore}</Text>
          </View>
        </View>

        {/* Interpretation */}
        {scoring?.interpretation && (
          <View style={styles.interpretationCard}>
            {Object.entries(scoring.interpretation).map(([key, text]) => (
              <View key={key} style={styles.interpretationRow}>
                <Text style={styles.interpretationKey}>{key}:</Text>
                <Text style={styles.interpretationText}>{text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Supplementary questions */}
        {supplementaryFields.length > 0 && (
          <View style={styles.supplementarySection}>
            <Text style={styles.supplementaryHeading}>
              A few more questions
            </Text>
            {supplementaryFields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={values[field.id]}
                onChange={(val) => onChange(field.id, val)}
              />
            ))}
          </View>
        )}

        {/* Navigation and submit */}
        <View style={styles.summaryNavRow}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.navButton,
              styles.navButtonBack,
              pressed && styles.navButtonBackPressed,
            ]}
            accessibilityLabel="Go back to review answers"
          >
            <Text style={styles.navButtonBackText}>Back</Text>
          </Pressable>
          <Pressable
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.navButton,
              styles.navButtonSubmit,
              pressed && styles.navButtonSubmitPressed,
            ]}
            accessibilityLabel="Submit checklist"
          >
            <Text style={styles.navButtonSubmitText}>Save my responses</Text>
            {xpValue != null && xpValue > 0 && (
              <Text style={styles.xpHint}>+{xpValue} XP</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ── Render: Question Card ───────────────────────────────────────────

  if (!currentItem) return null;

  const { field, domain } = currentItem;
  const options = field.options ?? [];
  const selectedValue = values[field.id];

  return (
    <View style={styles.container}>
      <CounterRow
        iaAnswered={iaAnswered}
        iaTotal={iaFields.length}
        iaOften={iaOften}
        hiAnswered={hiAnswered}
        hiTotal={hiFields.length}
        hiOften={hiOften}
      />
      <ProgressBar progress={progress} />

      {/* Question number */}
      <Text style={styles.questionNumber}>
        Question {currentIndex + 1} of {totalSymptoms}
      </Text>

      {/* Question */}
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <View
          style={[
            styles.domainBadge,
            {
              backgroundColor: domain === 'ia' ? IA_ACCENT_LIGHT : HI_ACCENT_LIGHT,
            },
          ]}
        >
          <Text
            style={[
              styles.domainBadgeText,
              { color: domain === 'ia' ? IA_ACCENT : HI_ACCENT },
            ]}
          >
            {domain === 'ia' ? 'Inattention' : 'Hyperactivity / Impulsivity'}
          </Text>
        </View>

        <Text style={styles.questionText}>{field.label}</Text>

        <View
          style={styles.optionsList}
          accessibilityRole="radiogroup"
          accessibilityLabel={field.label}
        >
          {options.map((option) => (
            <OptionCard
              key={option}
              label={option}
              isSelected={selectedValue === option}
              onPress={() => handleSelect(option)}
            />
          ))}
        </View>
      </Animated.View>

      {/* Back button */}
      {currentIndex > 0 && (
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          accessibilityLabel="Go to previous question"
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

function CounterRow({
  iaAnswered,
  iaTotal,
  iaOften,
  hiAnswered,
  hiTotal,
  hiOften,
}: {
  iaAnswered: number;
  iaTotal: number;
  iaOften: number;
  hiAnswered: number;
  hiTotal: number;
  hiOften: number;
}) {
  return (
    <View style={styles.counterRow}>
      <CounterPill
        label="Inattention"
        answered={iaAnswered}
        total={iaTotal}
        oftenCount={iaOften}
        accent={IA_ACCENT}
        accentLight={IA_ACCENT_LIGHT}
      />
      <CounterPill
        label="HI"
        answered={hiAnswered}
        total={hiTotal}
        oftenCount={hiOften}
        accent={HI_ACCENT}
        accentLight={HI_ACCENT_LIGHT}
      />
    </View>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.progressBarBg}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${Math.round(progress * 100)}%` },
        ]}
      />
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Counter row
  counterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  counterPill: {
    flex: 1,
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  counterValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginVertical: 2,
  },
  counterOften: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    opacity: 0.8,
  },

  // Progress bar
  progressBarBg: {
    height: 3,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },

  // Question screen
  questionNumber: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  questionContainer: {
    flex: 1,
  },
  domainBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  domainBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },

  // Option cards
  optionsList: {
    gap: Spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  optionCardSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  optionLabel: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  optionLabelSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },

  // Back button (question screen)
  backButton: {
    marginTop: Spacing.lg,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonPressed: {
    backgroundColor: Colors.border,
  },
  backButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Transition screen
  transitionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  continueButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },

  // Summary screen
  summaryContent: {
    paddingBottom: Spacing.xxl,
  },
  summaryHeading: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryDomainLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  summaryDomainValue: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  summaryTotalLabel: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginLeft: 10 + Spacing.sm, // align with domain text
  },
  summaryTotalValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Interpretation
  interpretationCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  interpretationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  interpretationKey: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  interpretationText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  // Supplementary
  supplementarySection: {
    marginBottom: Spacing.lg,
  },
  supplementaryHeading: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Summary nav
  summaryNavRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  navButton: {
    borderRadius: Radii.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  navButtonBack: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navButtonBackPressed: {
    backgroundColor: Colors.border,
  },
  navButtonBackText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  navButtonSubmit: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  navButtonSubmitPressed: {
    backgroundColor: Colors.primaryDark,
  },
  navButtonSubmitText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  xpHint: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primaryLight,
    marginTop: 2,
  },
});
