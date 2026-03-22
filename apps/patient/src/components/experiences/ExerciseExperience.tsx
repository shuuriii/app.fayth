import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';
import { FieldRenderer, YBField } from '@/components/WorksheetRenderer';
import { ProgressRing } from '@/components/adhd-ux/ProgressRing';
import { AutoSaveIndicator } from '@/components/adhd-ux/AutoSaveIndicator';
import { SkipField } from '@/components/adhd-ux/SkipField';
import { FayContextBubble } from '@/components/adhd-ux/FayContextBubble';
import { BreakNudge } from '@/components/adhd-ux/BreakNudge';
import { useAutoSave } from '@/hooks/useAutoSave';

// ── Types ──────────────────────────────────────────────────────────────

interface ExerciseExperienceProps {
  contentItem: {
    id: string;
    module_id: string;
    title: string;
    instructions: string | null;
    schema: {
      fields?: YBField[];
      instructions_for_patient?: string;
      clinician_notes?: string;
    };
    xp_value: number;
  };
  existingResponse?: { response_data: Record<string, any> } | null;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onBack: () => void;
}

type ScreenPhase =
  | 'intro'
  | 'question'
  | 'chapter_complete'
  | 'review'
  | 'submitting'
  | 'success';

interface Chapter {
  id: string;
  label: string;
  fields: YBField[];
}

// ── Sensitive chapter keywords ─────────────────────────────────────────

const SENSITIVE_KEYWORDS = [
  'emotional',
  'relationship',
  'mental_health',
  'trauma',
  'abuse',
  'grief',
  'loss',
  'anger',
  'depression',
  'anxiety',
  'self_harm',
];

function isSensitiveChapter(chapter: Chapter): boolean {
  const idLower = chapter.id.toLowerCase();
  return SENSITIVE_KEYWORDS.some((keyword) => idLower.includes(keyword));
}

// ── Chapter parsing ────────────────────────────────────────────────────

function parseChapters(fields: YBField[]): Chapter[] {
  const chapters: Chapter[] = [];
  let currentChapter: Chapter | null = null;

  for (const field of fields) {
    const isSectionHeader = field.type === 'text' && field.id.startsWith('section_');

    if (isSectionHeader) {
      // Start a new chapter
      if (currentChapter && currentChapter.fields.length > 0) {
        chapters.push(currentChapter);
      }
      currentChapter = {
        id: field.id,
        label: field.label,
        fields: [],
      };
    } else {
      if (!currentChapter) {
        currentChapter = {
          id: 'default',
          label: 'Questions',
          fields: [],
        };
      }
      currentChapter.fields.push(field);
    }
  }

  // Push the last chapter
  if (currentChapter && currentChapter.fields.length > 0) {
    chapters.push(currentChapter);
  }

  // If no chapters were created, wrap all fields into one
  if (chapters.length === 0 && fields.length > 0) {
    chapters.push({
      id: 'default',
      label: 'Questions',
      fields: fields.filter(
        (f) => !(f.type === 'text' && f.id.startsWith('section_'))
      ),
    });
  }

  return chapters;
}

// ── Helpers ────────────────────────────────────────────────────────────

function fieldHasValue(value: any): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

function getTotalFieldCount(chapters: Chapter[]): number {
  return chapters.reduce((sum, ch) => sum + ch.fields.length, 0);
}

function getAnsweredFieldCount(
  chapters: Chapter[],
  values: Record<string, any>
): number {
  return chapters.reduce(
    (sum, ch) =>
      sum + ch.fields.filter((f) => fieldHasValue(values[f.id])).length,
    0
  );
}

function getGlobalFieldIndex(
  chapters: Chapter[],
  chapterIndex: number,
  fieldIndex: number
): number {
  let count = 0;
  for (let i = 0; i < chapterIndex; i++) {
    count += chapters[i].fields.length;
  }
  return count + fieldIndex + 1;
}

/** Find the first chapter with unanswered fields, for session resume. */
function findResumeChapterIndex(
  chapters: Chapter[],
  values: Record<string, any>
): number {
  for (let i = 0; i < chapters.length; i++) {
    const hasUnanswered = chapters[i].fields.some(
      (f) => !fieldHasValue(values[f.id])
    );
    if (hasUnanswered) return i;
  }
  return 0;
}

// ── Fay messages for chapter intros ────────────────────────────────────

const CHAPTER_INTRO_MESSAGES = [
  "Let's take this one step at a time.",
  "Ready when you are. No rush.",
  "This part is about understanding your story.",
  "Take a breath. We'll go through this together.",
  "You're doing well. Let's keep going.",
];

function getChapterIntroMessage(index: number): string {
  return CHAPTER_INTRO_MESSAGES[index % CHAPTER_INTRO_MESSAGES.length];
}

const CHAPTER_COMPLETE_MESSAGES = [
  'Section done. You showed up for this.',
  "That's real progress.",
  'One more section behind you.',
  "You're building a picture of your story.",
];

function getChapterCompleteMessage(index: number): string {
  return CHAPTER_COMPLETE_MESSAGES[index % CHAPTER_COMPLETE_MESSAGES.length];
}

// ── Component ──────────────────────────────────────────────────────────

export function ExerciseExperience({
  contentItem,
  existingResponse,
  onSubmit,
  onBack,
}: ExerciseExperienceProps) {
  const allFields = contentItem.schema.fields ?? [];
  const chapters = useMemo(() => parseChapters(allFields), [allFields]);
  const totalFields = useMemo(() => getTotalFieldCount(chapters), [chapters]);

  // ── State ──────────────────────────────────────────────────────────

  const [values, setValues] = useState<Record<string, any>>(
    existingResponse?.response_data ?? {}
  );
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [screenPhase, setScreenPhase] = useState<ScreenPhase>('intro');
  const [draftResumeMessage, setDraftResumeMessage] = useState<string | null>(
    null
  );
  const [breakNudgeVisible, setBreakNudgeVisible] = useState(false);
  const breakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breakMinutes = useRef(0);

  // BreakNudge — show after 10 minutes for exercises (emotionally intensive)
  useEffect(() => {
    breakTimerRef.current = setTimeout(() => {
      breakMinutes.current = 10;
      setBreakNudgeVisible(true);
    }, 10 * 60 * 1000);
    return () => { if (breakTimerRef.current) clearTimeout(breakTimerRef.current); };
  }, []);
  const [showSensitiveWarning, setShowSensitiveWarning] = useState(false);
  const [autoSaveVisible, setAutoSaveVisible] = useState(false);

  // ── Animation refs ─────────────────────────────────────────────────

  const fieldOpacity = useRef(new Animated.Value(1)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0.3)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // ── Auto-save ──────────────────────────────────────────────────────

  const {
    draftRestored,
    draftSavedOpacity,
    restoreDraft,
    clearDraft,
  } = useAutoSave({
    key: `exercise_${contentItem.id}`,
    values,
    enabled: screenPhase !== 'submitting' && screenPhase !== 'success',
  });

  // Watch draftSavedOpacity to toggle AutoSaveIndicator visibility
  useEffect(() => {
    const listenerId = draftSavedOpacity.addListener(({ value }) => {
      setAutoSaveVisible(value > 0.1);
    });
    return () => draftSavedOpacity.removeListener(listenerId);
  }, [draftSavedOpacity]);

  // ── Restore draft on mount ─────────────────────────────────────────

  useEffect(() => {
    if (existingResponse?.response_data) {
      // Already have a server response, use that
      return;
    }

    restoreDraft().then((draft) => {
      if (draft && Object.keys(draft).length > 0) {
        setValues(draft);
        const resumeIndex = findResumeChapterIndex(chapters, draft);
        const chapterLabel = chapters[resumeIndex]?.label ?? 'the beginning';
        setDraftResumeMessage(
          `Welcome back. You left off at "${chapterLabel}".`
        );
        setCurrentChapterIndex(resumeIndex);
      }
    });
  }, []); // Run once on mount

  // ── Derived state ──────────────────────────────────────────────────

  const currentChapter = chapters[currentChapterIndex];
  const currentField = currentChapter?.fields[currentFieldIndex];
  const answeredCount = getAnsweredFieldCount(chapters, values);
  const isLastChapter = currentChapterIndex === chapters.length - 1;
  const isLastFieldInChapter =
    currentChapter && currentFieldIndex === currentChapter.fields.length - 1;

  // ── Handlers ───────────────────────────────────────────────────────

  const handleChange = useCallback((fieldId: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const animateFieldTransition = useCallback(
    (callback: () => void) => {
      Animated.timing(fieldOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        callback();
        Animated.timing(fieldOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    },
    [fieldOpacity]
  );

  const animateScreenTransition = useCallback(
    (callback: () => void) => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        callback();
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    },
    [screenOpacity]
  );

  const advanceToNextField = useCallback(() => {
    if (!currentChapter) return;

    if (isLastFieldInChapter) {
      // End of chapter
      if (isLastChapter) {
        animateScreenTransition(() => setScreenPhase('review'));
      } else {
        animateScreenTransition(() => {
          setScreenPhase('chapter_complete');
        });
      }
    } else {
      animateFieldTransition(() => {
        setCurrentFieldIndex((prev) => prev + 1);
      });
    }
  }, [
    currentChapter,
    isLastFieldInChapter,
    isLastChapter,
    animateFieldTransition,
    animateScreenTransition,
  ]);

  const goToPreviousField = useCallback(() => {
    if (currentFieldIndex > 0) {
      animateFieldTransition(() => {
        setCurrentFieldIndex((prev) => prev - 1);
      });
    } else if (currentChapterIndex > 0) {
      // Go back to previous chapter's last field
      animateScreenTransition(() => {
        const prevChapter = chapters[currentChapterIndex - 1];
        setCurrentChapterIndex((prev) => prev - 1);
        setCurrentFieldIndex(prevChapter.fields.length - 1);
        setScreenPhase('question');
      });
    }
  }, [
    currentFieldIndex,
    currentChapterIndex,
    chapters,
    animateFieldTransition,
    animateScreenTransition,
  ]);

  const startChapter = useCallback(() => {
    setShowSensitiveWarning(false);
    animateScreenTransition(() => {
      setCurrentFieldIndex(0);
      setScreenPhase('question');
    });
  }, [animateScreenTransition]);

  const proceedToNextChapter = useCallback(() => {
    const nextIndex = currentChapterIndex + 1;
    if (nextIndex < chapters.length) {
      animateScreenTransition(() => {
        setCurrentChapterIndex(nextIndex);
        setCurrentFieldIndex(0);
        // Check if next chapter is sensitive
        if (isSensitiveChapter(chapters[nextIndex])) {
          setShowSensitiveWarning(true);
        }
        setScreenPhase('intro');
      });
    } else {
      animateScreenTransition(() => setScreenPhase('review'));
    }
  }, [currentChapterIndex, chapters, animateScreenTransition]);

  const handleIDontKnow = useCallback(() => {
    if (!currentField) return;
    handleChange(currentField.id, "I don't know");
    advanceToNextField();
  }, [currentField, handleChange, advanceToNextField]);

  const handleIllAskSomeone = useCallback(() => {
    if (!currentField) return;
    handleChange(currentField.id, "I'll ask someone about this");
    advanceToNextField();
  }, [currentField, handleChange, advanceToNextField]);

  const handleSkip = useCallback(() => {
    advanceToNextField();
  }, [advanceToNextField]);

  const handleSubmit = useCallback(async () => {
    setScreenPhase('submitting');
    try {
      await onSubmit(values);
      await clearDraft();

      // Animate success
      successOpacity.setValue(0);
      successScale.setValue(0.3);
      setScreenPhase('success');

      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-navigate back after celebration
      setTimeout(() => {
        onBack();
      }, 2200);
    } catch {
      // Allow retry
      setScreenPhase('review');
    }
  }, [values, onSubmit, clearDraft, onBack, successScale, successOpacity]);

  const handleStartExercise = useCallback(() => {
    if (isSensitiveChapter(chapters[0])) {
      setShowSensitiveWarning(true);
    }
    animateScreenTransition(() => {
      setScreenPhase('intro');
    });
  }, [chapters, animateScreenTransition]);

  // ── Jump to a chapter from the review screen ──────────────────────

  const jumpToChapter = useCallback(
    (chapterIndex: number) => {
      animateScreenTransition(() => {
        setCurrentChapterIndex(chapterIndex);
        setCurrentFieldIndex(0);
        setScreenPhase('intro');
      });
    },
    [animateScreenTransition]
  );

  // ── Render: Landing screen ─────────────────────────────────────────

  if (screenPhase === 'intro' && currentChapterIndex === 0 && !draftResumeMessage && currentFieldIndex === 0) {
    // Show the very first intro for the whole exercise
    return (
      <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
        <ScrollView
          contentContainerStyle={styles.screenContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable
              onPress={onBack}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>{'<'} Back</Text>
            </Pressable>
            <AutoSaveIndicator visible={autoSaveVisible} />
          </View>

          <View style={styles.introContainer}>
            <Text style={styles.exerciseTitle}>{contentItem.title}</Text>

            {contentItem.instructions && (
              <Text style={styles.exerciseInstructions}>
                {contentItem.instructions}
              </Text>
            )}

            {contentItem.schema.instructions_for_patient && (
              <FayContextBubble
                message={contentItem.schema.instructions_for_patient}
              />
            )}

            <View style={styles.chapterOverview}>
              <Text style={styles.chapterOverviewTitle}>
                {chapters.length} {chapters.length === 1 ? 'section' : 'sections'}, {totalFields}{' '}
                {totalFields === 1 ? 'question' : 'questions'}
              </Text>
              {chapters.map((ch, i) => (
                <View key={ch.id} style={styles.chapterOverviewRow}>
                  <View style={styles.chapterDot} />
                  <Text style={styles.chapterOverviewLabel}>
                    {ch.label}{' '}
                    <Text style={styles.chapterOverviewCount}>
                      ({ch.fields.length})
                    </Text>
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={handleStartExercise}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Begin exercise"
            >
              <Text style={styles.primaryButtonText}>Begin</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  // ── Render: Chapter intro ──────────────────────────────────────────

  if (screenPhase === 'intro') {
    return (
      <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
        <ScrollView
          contentContainerStyle={styles.screenContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable
              onPress={onBack}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>{'<'} Back</Text>
            </Pressable>
            <ProgressRing
              current={answeredCount}
              total={totalFields}
              size={48}
              strokeWidth={4}
            />
          </View>

          <View style={styles.chapterIntroContainer}>
            <Text style={styles.chapterNumber}>
              Section {currentChapterIndex + 1} of {chapters.length}
            </Text>
            <Text style={styles.chapterTitle}>{currentChapter?.label}</Text>

            {draftResumeMessage && currentChapterIndex === findResumeChapterIndex(chapters, values) && (
              <View style={styles.resumeBubble}>
                <FayContextBubble message={draftResumeMessage} />
              </View>
            )}

            {showSensitiveWarning && (
              <View style={styles.sensitiveWarning}>
                <FayContextBubble
                  message="This next section asks about difficult experiences. Take your time. You can skip anything."
                />
              </View>
            )}

            {!showSensitiveWarning && (
              <FayContextBubble
                message={getChapterIntroMessage(currentChapterIndex)}
              />
            )}

            <Pressable
              onPress={startChapter}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Start section: ${currentChapter?.label}`}
            >
              <Text style={styles.primaryButtonText}>Start</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  // ── Render: One question per page ──────────────────────────────────

  if (screenPhase === 'question' && currentField) {
    const globalIndex = getGlobalFieldIndex(
      chapters,
      currentChapterIndex,
      currentFieldIndex
    );
    const showIDontKnow =
      currentField.type === 'textarea' && !currentField.required;
    const showSkip = !currentField.required && !showIDontKnow;
    const hasValue = fieldHasValue(values[currentField.id]);

    return (
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <Animated.View
          style={[styles.screenFlex, { opacity: screenOpacity }]}
        >
          {/* Header */}
          <View style={styles.questionHeader}>
            <View style={styles.headerRow}>
              <Pressable
                onPress={goToPreviousField}
                style={styles.backButton}
                accessibilityLabel="Previous question"
                accessibilityRole="button"
                disabled={
                  currentFieldIndex === 0 && currentChapterIndex === 0
                }
              >
                <Text
                  style={[
                    styles.backButtonText,
                    currentFieldIndex === 0 &&
                      currentChapterIndex === 0 &&
                      styles.backButtonDisabled,
                  ]}
                >
                  {'<'} Back
                </Text>
              </Pressable>

              <View style={styles.headerRight}>
                <AutoSaveIndicator visible={autoSaveVisible} />
                <ProgressRing
                  current={answeredCount}
                  total={totalFields}
                  size={48}
                  strokeWidth={4}
                />
              </View>
            </View>

            <Text style={styles.questionCounter}>
              Question {globalIndex} of {totalFields}
            </Text>
            <Text style={styles.chapterLabel}>{currentChapter.label}</Text>
          </View>

          {/* Field */}
          <ScrollView
            contentContainerStyle={styles.questionScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ opacity: fieldOpacity }}>
              <FieldRenderer
                field={currentField}
                value={values[currentField.id]}
                onChange={(val) => handleChange(currentField.id, val)}
              />

              {/* "I don't know" / "I'll ask someone" for textarea */}
              {showIDontKnow && (
                <View style={styles.uncertaintyActions}>
                  <Pressable
                    onPress={handleIDontKnow}
                    style={styles.textLinkButton}
                    accessibilityRole="button"
                    accessibilityLabel="I don't know"
                  >
                    <Text style={styles.textLinkLabel}>I don't know</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleIllAskSomeone}
                    style={styles.textLinkButton}
                    accessibilityRole="button"
                    accessibilityLabel="I'll ask someone about this"
                  >
                    <Text style={styles.textLinkLabel}>
                      I'll ask someone
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Skip for non-required fields that aren't textarea */}
              {showSkip && (
                <SkipField onSkip={handleSkip} />
              )}
            </Animated.View>
          </ScrollView>

          {/* Next button */}
          <View style={styles.questionFooter}>
            <Pressable
              onPress={advanceToNextField}
              style={({ pressed }) => [
                styles.primaryButton,
                !hasValue && !showSkip && !showIDontKnow && styles.primaryButtonMuted,
                pressed && styles.primaryButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                isLastFieldInChapter
                  ? isLastChapter
                    ? 'Review responses'
                    : 'Complete section'
                  : 'Next question'
              }
            >
              <Text style={styles.primaryButtonText}>
                {isLastFieldInChapter
                  ? isLastChapter
                    ? 'Review'
                    : 'Complete section'
                  : 'Next'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Break nudge */}
        <BreakNudge
          visible={breakNudgeVisible}
          onContinue={() => {
            setBreakNudgeVisible(false);
            breakTimerRef.current = setTimeout(() => {
              breakMinutes.current += 5;
              setBreakNudgeVisible(true);
            }, 5 * 60 * 1000);
          }}
          onSaveAndExit={() => {
            setBreakNudgeVisible(false);
            onBack();
          }}
          minutesElapsed={breakMinutes.current}
        />
      </KeyboardAvoidingView>
    );
  }

  // ── Render: Chapter complete ───────────────────────────────────────

  if (screenPhase === 'chapter_complete') {
    const chapterFieldCount = currentChapter?.fields.length ?? 0;
    const chapterAnswered = currentChapter
      ? currentChapter.fields.filter((f) => fieldHasValue(values[f.id])).length
      : 0;

    return (
      <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
        <ScrollView contentContainerStyle={styles.screenContent}>
          <View style={styles.chapterCompleteContainer}>
            <View style={styles.chapterCompleteBadge}>
              <Text style={styles.chapterCompleteCheck}>{'✓'}</Text>
            </View>

            <Text style={styles.chapterCompleteTitle}>
              {currentChapter?.label}
            </Text>
            <Text style={styles.chapterCompleteSubtitle}>
              {chapterAnswered} of {chapterFieldCount} answered
            </Text>

            <FayContextBubble
              message={getChapterCompleteMessage(currentChapterIndex)}
            />

            <View style={styles.chapterCompleteProgress}>
              <ProgressRing
                current={currentChapterIndex + 1}
                total={chapters.length}
                size={56}
                strokeWidth={4}
              />
              <Text style={styles.chapterCompleteProgressLabel}>
                {chapters.length - currentChapterIndex - 1}{' '}
                {chapters.length - currentChapterIndex - 1 === 1
                  ? 'section'
                  : 'sections'}{' '}
                remaining
              </Text>
            </View>

            <Pressable
              onPress={proceedToNextChapter}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Continue to next section"
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  // ── Render: Review ─────────────────────────────────────────────────

  if (screenPhase === 'review') {
    return (
      <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
        <ScrollView
          contentContainerStyle={styles.screenContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable
              onPress={onBack}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>{'<'} Back</Text>
            </Pressable>
            <ProgressRing
              current={answeredCount}
              total={totalFields}
              size={48}
              strokeWidth={4}
            />
          </View>

          <Text style={styles.reviewTitle}>Review your responses</Text>
          <Text style={styles.reviewSubtitle}>
            {answeredCount} of {totalFields} questions answered
          </Text>

          {chapters.map((chapter, chapterIdx) => {
            const chapterAnswered = chapter.fields.filter((f) =>
              fieldHasValue(values[f.id])
            ).length;
            const isComplete = chapterAnswered === chapter.fields.length;

            return (
              <Pressable
                key={chapter.id}
                onPress={() => jumpToChapter(chapterIdx)}
                style={({ pressed }) => [
                  styles.reviewChapterRow,
                  pressed && styles.reviewChapterRowPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${chapter.label}: ${chapterAnswered} of ${chapter.fields.length} answered. Tap to edit.`}
              >
                <View
                  style={[
                    styles.reviewChapterStatus,
                    isComplete && styles.reviewChapterStatusComplete,
                  ]}
                >
                  {isComplete ? (
                    <Text style={styles.reviewChapterCheck}>{'✓'}</Text>
                  ) : (
                    <Text style={styles.reviewChapterPartial}>
                      {chapterAnswered}
                    </Text>
                  )}
                </View>

                <View style={styles.reviewChapterInfo}>
                  <Text style={styles.reviewChapterLabel}>
                    {chapter.label}
                  </Text>
                  <Text style={styles.reviewChapterCount}>
                    {chapterAnswered}/{chapter.fields.length} answered
                  </Text>
                </View>

                <Text style={styles.reviewChapterArrow}>{'>'}</Text>
              </Pressable>
            );
          })}

          <View style={styles.reviewFooter}>
            {contentItem.xp_value > 0 && (
              <Text style={styles.reviewXpHint}>
                +{contentItem.xp_value} XP
              </Text>
            )}
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Save my responses"
            >
              <Text style={styles.primaryButtonText}>Save my responses</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  // ── Render: Submitting ─────────────────────────────────────────────

  if (screenPhase === 'submitting') {
    return (
      <View style={[styles.screen, styles.centeredScreen]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.submittingText}>Saving your responses...</Text>
      </View>
    );
  }

  // ── Render: Success ────────────────────────────────────────────────

  if (screenPhase === 'success') {
    return (
      <View style={[styles.screen, styles.centeredScreen]}>
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: successOpacity,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          <View style={styles.successBadge}>
            <Text style={styles.successCheck}>{'✓'}</Text>
          </View>

          {contentItem.xp_value > 0 && (
            <View style={styles.successXpContainer}>
              <Text style={styles.successXpNumber}>
                +{contentItem.xp_value}
              </Text>
              <Text style={styles.successXpLabel}>XP</Text>
            </View>
          )}

          <Text style={styles.successMessage}>Exercise complete</Text>
          <Text style={styles.successSubtext}>
            That took real effort. Well done.
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Fallback (should not reach here)
  return null;
}

// ── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenFlex: {
    flex: 1,
  },
  centeredScreen: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  screenContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // ── Header ─────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  backButtonDisabled: {
    color: Colors.textTertiary,
  },

  // ── Landing intro ──────────────────────────────────────────────────
  introContainer: {
    gap: Spacing.lg,
  },
  exerciseTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 36,
  },
  exerciseInstructions: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  chapterOverview: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  chapterOverviewTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  chapterOverviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chapterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  chapterOverviewLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  chapterOverviewCount: {
    color: Colors.textTertiary,
    fontWeight: '400',
  },

  // ── Chapter intro ──────────────────────────────────────────────────
  chapterIntroContainer: {
    gap: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  chapterNumber: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chapterTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 30,
  },
  resumeBubble: {
    marginVertical: Spacing.sm,
  },
  sensitiveWarning: {
    marginVertical: Spacing.sm,
  },

  // ── Question screen ────────────────────────────────────────────────
  questionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  questionCounter: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  chapterLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  questionScrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // ── Uncertainty actions (I don't know / I'll ask someone) ──────────
  uncertaintyActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  textLinkButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  textLinkLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    fontWeight: '500',
  },

  // ── Question footer ────────────────────────────────────────────────
  questionFooter: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },

  // ── Chapter complete ───────────────────────────────────────────────
  chapterCompleteContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 1.5,
    gap: Spacing.md,
  },
  chapterCompleteBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: Spacing.sm,
  },
  chapterCompleteCheck: {
    fontSize: FontSizes.xxl,
    color: Colors.primary,
    fontWeight: '700',
  },
  chapterCompleteTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  chapterCompleteSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  chapterCompleteProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  chapterCompleteProgressLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // ── Review ─────────────────────────────────────────────────────────
  reviewTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  reviewSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  reviewChapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  reviewChapterRowPressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  reviewChapterStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewChapterStatusComplete: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  reviewChapterCheck: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '700',
  },
  reviewChapterPartial: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  reviewChapterInfo: {
    flex: 1,
    gap: 2,
  },
  reviewChapterLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewChapterCount: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  reviewChapterArrow: {
    fontSize: FontSizes.md,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  reviewFooter: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  reviewXpHint: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },

  // ── Submitting ─────────────────────────────────────────────────────
  submittingText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '500',
  },

  // ── Success ────────────────────────────────────────────────────────
  successContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  successCheck: {
    fontSize: FontSizes.hero,
    color: Colors.primary,
    fontWeight: '700',
  },
  successXpContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  successXpNumber: {
    fontSize: FontSizes.hero,
    fontWeight: '800',
    color: Colors.primary,
  },
  successXpLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  successMessage: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  successSubtext: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── Shared buttons ─────────────────────────────────────────────────
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  primaryButtonMuted: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
});
