import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';
import { FieldRenderer, YBField } from '@/components/WorksheetRenderer';
import { MicroCelebration } from '@/components/MicroCelebration';
import { FayContextBubble } from '@/components/adhd-ux/FayContextBubble';
import { AutoSaveIndicator } from '@/components/adhd-ux/AutoSaveIndicator';
import { BreakNudge } from '@/components/adhd-ux/BreakNudge';
import { useAutoSave } from '@/hooks/useAutoSave';

// ── Types ──────────────────────────────────────────────────────────────

interface ScoringConfig {
  method: string;
  subscales?: Record<string, any>;
  interpretation?: Record<string, string>;
  max_score?: number;
}

interface WorksheetExperienceProps {
  contentItem: {
    id: string;
    title: string;
    instructions: string | null;
    schema: {
      fields?: YBField[];
      scoring?: ScoringConfig;
      instructions_for_patient?: string;
      clinician_notes?: string;
    };
    xp_value: number;
  };
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  onSubmit: () => void;
  onSaveAndExit?: () => void;
  errors?: Record<string, string>;
}

// ── Section parsing ────────────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
  fields: YBField[];
}

/** Parse fields into semantic sections using `type: "text"` fields as section headers */
function parseSections(fields: YBField[]): Section[] {
  const sections: Section[] = [];
  let currentSection: Section = { id: 'default', label: 'Questions', fields: [] };

  for (const field of fields) {
    if (field.type === 'text' && field.id.startsWith('section_')) {
      // Start a new section
      if (currentSection.fields.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        id: field.id,
        label: field.label,
        fields: [],
      };
    } else {
      currentSection.fields.push(field);
    }
  }

  if (currentSection.fields.length > 0) {
    sections.push(currentSection);
  }

  // If no section headers found, treat all as one section
  if (sections.length === 0 && fields.length > 0) {
    sections.push({ id: 'default', label: 'Questions', fields });
  }

  return sections;
}

/** Determine if one-field-at-a-time mode should be used */
function shouldUseOneFieldMode(sections: Section[]): boolean {
  const totalLikert = sections.reduce(
    (sum, s) => sum + s.fields.filter((f) => f.type === 'likert').length,
    0,
  );
  return totalLikert > 10;
}

// ── Live scoring ───────────────────────────────────────────────────────

interface LiveScore {
  label: string;
  current: number;
  max: number;
}

function computeLiveScores(
  scoring: ScoringConfig | undefined,
  fields: YBField[],
  values: Record<string, any>,
): LiveScore[] {
  if (!scoring || scoring.method === 'none') return [];

  const scores: LiveScore[] = [];

  if (scoring.subscales) {
    for (const [key, subscale] of Object.entries(scoring.subscales)) {
      if (typeof subscale !== 'object' || !subscale.items) continue;

      const items: string[] = subscale.items;
      let count = 0;
      for (const itemId of items) {
        const val = values[itemId];
        const field = fields.find((f) => f.id === itemId);
        if (!field || !val) continue;

        if (field.type === 'likert' && field.score_values && field.options) {
          const idx = field.options.indexOf(val);
          if (idx >= 0 && field.score_values[idx] !== undefined) {
            count += field.score_values[idx];
          }
        }
      }

      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      scores.push({
        label,
        current: count,
        max: items.length * 2, // assuming max score per item is 2
      });
    }
  } else if (scoring.method === 'sum') {
    let total = 0;
    let maxTotal = 0;
    for (const field of fields) {
      if (field.score_values && field.options) {
        maxTotal += Math.max(...field.score_values);
        const val = values[field.id];
        if (val) {
          const idx = field.options.indexOf(val);
          if (idx >= 0) total += field.score_values[idx] ?? 0;
        }
      }
    }
    scores.push({
      label: 'Score',
      current: total,
      max: scoring.max_score ?? maxTotal,
    });
  }

  return scores;
}

// ── Component ──────────────────────────────────────────────────────────

export function WorksheetExperience({
  contentItem,
  values,
  onChange,
  onSubmit,
  onSaveAndExit,
  errors,
}: WorksheetExperienceProps) {
  const fields = contentItem.schema?.fields ?? [];
  const scoring = contentItem.schema?.scoring;

  // Auto-save
  const { draftSavedOpacity, restoreDraft, clearDraft, draftRestored } = useAutoSave({
    key: `worksheet_${contentItem.id}`,
    values,
    enabled: true,
  });

  // Restore draft on mount
  useEffect(() => {
    restoreDraft().then((draft) => {
      if (draft) {
        Object.entries(draft).forEach(([k, v]) => onChange(k, v));
      }
    });
  }, []);

  // BreakNudge — show after 15 minutes
  const [breakNudgeVisible, setBreakNudgeVisible] = useState(false);
  const breakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breakMinutes = useRef(0);

  useEffect(() => {
    const startTime = Date.now();
    breakTimerRef.current = setTimeout(() => {
      breakMinutes.current = 15;
      setBreakNudgeVisible(true);
    }, 15 * 60 * 1000);
    return () => { if (breakTimerRef.current) clearTimeout(breakTimerRef.current); };
  }, []);

  function handleBreakContinue() {
    setBreakNudgeVisible(false);
    breakTimerRef.current = setTimeout(() => {
      breakMinutes.current += 5;
      setBreakNudgeVisible(true);
    }, 5 * 60 * 1000);
  }

  function handleBreakExit() {
    setBreakNudgeVisible(false);
    onSaveAndExit?.();
  }

  // Fay messages
  const [fayDismissed, setFayDismissed] = useState(false);

  const sections = useMemo(() => parseSections(fields), [fields]);
  const oneFieldMode = useMemo(() => shouldUseOneFieldMode(sections), [sections]);
  const allFields = useMemo(() => sections.flatMap((s) => s.fields), [sections]);

  // State
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const [skippedFields, setSkippedFields] = useState<Set<string>>(new Set());
  const [showSectionCelebration, setShowSectionCelebration] = useState(false);
  const [sectionCelebrationData, setSectionCelebrationData] = useState({
    sectionLabel: '',
    completedSections: 0,
    totalSections: 0,
  });

  // Animation
  const fieldOpacity = useRef(new Animated.Value(1)).current;

  const activeSection = sections[activeSectionIndex];
  const activeField = oneFieldMode
    ? activeSection?.fields[activeFieldIndex]
    : null;

  // Compute live scores
  const liveScores = useMemo(
    () => computeLiveScores(scoring, allFields, values),
    [scoring, allFields, values],
  );

  // Progress calculation
  const answeredCount = allFields.filter((f) => {
    const v = values[f.id];
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }).length;

  const totalFieldCount = allFields.length;

  // Completed sections
  const completedSections = sections.filter((section) =>
    section.fields.every((f) => {
      if (!f.required) return true;
      const v = values[f.id];
      if (v === undefined || v === null || v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    }),
  );

  // ── Navigation ────────────────────────────────────────────────────

  function animateFieldTransition(callback: () => void) {
    Animated.sequence([
      Animated.timing(fieldOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fieldOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
        delay: 50,
      }),
    ]).start();
    setTimeout(callback, 140);
  }

  function handleNext() {
    if (!oneFieldMode) {
      // Section-by-section mode
      if (activeSectionIndex < sections.length - 1) {
        // Show section celebration
        setSectionCelebrationData({
          sectionLabel: activeSection?.label ?? '',
          completedSections: activeSectionIndex + 1,
          totalSections: sections.length,
        });
        setShowSectionCelebration(true);
      }
      return;
    }

    // One-field-at-a-time mode
    if (activeFieldIndex < (activeSection?.fields.length ?? 0) - 1) {
      animateFieldTransition(() => setActiveFieldIndex((i) => i + 1));
    } else if (activeSectionIndex < sections.length - 1) {
      // End of section — show celebration
      setSectionCelebrationData({
        sectionLabel: activeSection?.label ?? '',
        completedSections: activeSectionIndex + 1,
        totalSections: sections.length,
      });
      setShowSectionCelebration(true);
    }
  }

  function handleSectionCelebrationDismiss() {
    setShowSectionCelebration(false);
    animateFieldTransition(() => {
      setActiveSectionIndex((i) => i + 1);
      setActiveFieldIndex(0);
    });
  }

  function handleBack() {
    if (oneFieldMode && activeFieldIndex > 0) {
      animateFieldTransition(() => setActiveFieldIndex((i) => i - 1));
    } else if (activeSectionIndex > 0) {
      animateFieldTransition(() => {
        setActiveSectionIndex((i) => i - 1);
        if (oneFieldMode) {
          const prevSection = sections[activeSectionIndex - 1];
          setActiveFieldIndex(prevSection ? prevSection.fields.length - 1 : 0);
        }
      });
    }
  }

  function handleSkip(fieldId: string) {
    setSkippedFields((prev) => new Set(prev).add(fieldId));
    handleNext();
  }

  function handleSectionPress(index: number) {
    if (index <= activeSectionIndex || completedSections.length >= index) {
      animateFieldTransition(() => {
        setActiveSectionIndex(index);
        setActiveFieldIndex(0);
      });
    }
  }

  // Is this the last field/section?
  const isLastSection = activeSectionIndex === sections.length - 1;
  const isLastField = oneFieldMode
    ? isLastSection && activeFieldIndex === (activeSection?.fields.length ?? 1) - 1
    : isLastSection;

  // Global field position for progress
  const globalFieldIndex = oneFieldMode
    ? sections
        .slice(0, activeSectionIndex)
        .reduce((sum, s) => sum + s.fields.length, 0) + activeFieldIndex
    : 0;

  // ── Render ────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Section indicator */}
      <View style={styles.sectionIndicator}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionScrollContent}
        >
          {sections.map((section, i) => {
            const isActive = i === activeSectionIndex;
            const isCompleted = i < activeSectionIndex || completedSections.includes(section);
            return (
              <Pressable
                key={section.id}
                onPress={() => handleSectionPress(i)}
                style={[
                  styles.sectionChip,
                  isActive && styles.sectionChipActive,
                  isCompleted && !isActive && styles.sectionChipCompleted,
                ]}
              >
                {isCompleted && !isActive && (
                  <Text style={styles.sectionCheckmark}>{'✓ '}</Text>
                )}
                <Text
                  style={[
                    styles.sectionChipText,
                    isActive && styles.sectionChipTextActive,
                    isCompleted && !isActive && styles.sectionChipTextCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {section.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Progress bar */}
      <View style={styles.progressRow}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${totalFieldCount > 0
                  ? (answeredCount / totalFieldCount) * 100
                  : 0
                }%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {answeredCount}/{totalFieldCount} answered
        </Text>
      </View>

      {/* Live scores */}
      {liveScores.length > 0 && (
        <View style={styles.liveScoreRow}>
          {liveScores.map((score) => (
            <View key={score.label} style={styles.liveScoreBadge}>
              <Text style={styles.liveScoreLabel}>{score.label}</Text>
              <Text style={styles.liveScoreValue}>
                {score.current}
                <Text style={styles.liveScoreMax}>/{score.max}</Text>
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Auto-save indicator */}
      <AutoSaveIndicator visible={draftSavedOpacity as any} />

      {/* Fay encouragement */}
      {!fayDismissed && activeSectionIndex === 0 && (oneFieldMode ? activeFieldIndex === 0 : true) && (
        <View style={styles.fayContainer}>
          <FayContextBubble
            message={contentItem.schema?.instructions_for_patient ?? "No right answers here. Just your experience."}
            position="top"
            onDismiss={() => setFayDismissed(true)}
          />
        </View>
      )}

      {/* Fields */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {oneFieldMode && activeField ? (
          /* One field at a time */
          <Animated.View style={{ opacity: fieldOpacity }}>
            <Text style={styles.fieldPosition}>
              Question {activeFieldIndex + 1} of {activeSection.fields.length}
            </Text>
            <FieldRenderer
              field={activeField}
              value={values[activeField.id]}
              onChange={(val) => onChange(activeField.id, val)}
              error={errors?.[activeField.id]}
            />
            {!activeField.required && (
              <Pressable
                onPress={() => handleSkip(activeField.id)}
                style={styles.skipButton}
                accessibilityLabel="Skip this field for now"
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </Pressable>
            )}
          </Animated.View>
        ) : activeSection ? (
          /* Section-at-a-time */
          <Animated.View style={{ opacity: fieldOpacity }}>
            <Text style={styles.sectionTitle}>{activeSection.label}</Text>
            {activeSection.fields.map((field) => (
              <View key={field.id}>
                <FieldRenderer
                  field={field}
                  value={values[field.id]}
                  onChange={(val) => onChange(field.id, val)}
                  error={errors?.[field.id]}
                />
                {!field.required && !skippedFields.has(field.id) && (
                  <Pressable
                    onPress={() => handleSkip(field.id)}
                    style={styles.skipButton}
                    accessibilityLabel={`Skip ${field.label} for now`}
                  >
                    <Text style={styles.skipButtonText}>Skip for now</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </Animated.View>
        ) : null}

        {/* Skipped fields reminder at end */}
        {isLastField && skippedFields.size > 0 && (
          <View style={styles.skippedReminder}>
            <Text style={styles.skippedReminderText}>
              You skipped {skippedFields.size} field{skippedFields.size > 1 ? 's' : ''}.
              You can go back to fill them in, or submit as-is.
            </Text>
          </View>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        {(activeSectionIndex > 0 || (oneFieldMode && activeFieldIndex > 0)) ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.navBtn,
              styles.navBtnBack,
              pressed && styles.navBtnBackPressed,
            ]}
            accessibilityLabel="Go to previous"
          >
            <Text style={styles.navBtnBackText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.navBtnSpacer} />
        )}

        {isLastField ? (
          <Pressable
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.navBtn,
              styles.navBtnSubmit,
              pressed && styles.navBtnSubmitPressed,
            ]}
            accessibilityLabel="Save my responses"
          >
            <Text style={styles.navBtnSubmitText}>Save my responses</Text>
            {contentItem.xp_value > 0 && (
              <Text style={styles.navBtnXpHint}>+{contentItem.xp_value} XP</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.navBtn,
              styles.navBtnNext,
              pressed && styles.navBtnNextPressed,
            ]}
            accessibilityLabel="Go to next"
          >
            <Text style={styles.navBtnNextText}>Next</Text>
          </Pressable>
        )}
      </View>

      {/* Section celebration overlay */}
      {showSectionCelebration && (
        <MicroCelebration
          visible={showSectionCelebration}
          xpEarned={0}
          completedCount={sectionCelebrationData.completedSections}
          totalCount={sectionCelebrationData.totalSections}
          onDismiss={handleSectionCelebrationDismiss}
          autoDismissMs={1200}
        />
      )}

      {/* Break nudge */}
      <BreakNudge
        visible={breakNudgeVisible}
        onContinue={handleBreakContinue}
        onSaveAndExit={handleBreakExit}
        minutesElapsed={breakMinutes.current}
      />
    </KeyboardAvoidingView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Section indicator
  sectionIndicator: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  sectionChipCompleted: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  sectionCheckmark: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    fontWeight: '700',
  },
  sectionChipText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    maxWidth: 140,
  },
  sectionChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  sectionChipTextCompleted: {
    color: Colors.success,
    fontWeight: '600',
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
  fayContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },

  // Live scores
  liveScoreRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  liveScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  liveScoreLabel: {
    fontSize: FontSizes.xs,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  liveScoreValue: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '800',
  },
  liveScoreMax: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Content
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  fieldPosition: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  // Skip
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
  skipButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    fontWeight: '500',
  },

  // Skipped reminder
  skippedReminder: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  skippedReminderText: {
    fontSize: FontSizes.sm,
    color: '#92400e',
    lineHeight: 20,
  },

  // Navigation
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  navBtn: {
    borderRadius: Radii.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  navBtnSpacer: {
    width: 80,
  },
  navBtnBack: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navBtnBackPressed: {
    backgroundColor: Colors.border,
  },
  navBtnBackText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  navBtnNext: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  navBtnNextPressed: {
    backgroundColor: Colors.primaryDark,
  },
  navBtnNextText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  navBtnSubmit: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  navBtnSubmitPressed: {
    backgroundColor: Colors.primaryDark,
  },
  navBtnSubmitText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  navBtnXpHint: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primaryLight,
    marginTop: 2,
  },
});
