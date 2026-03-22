import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FayContextBubble } from '@/components/adhd-ux/FayContextBubble';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

// ── Types ────────────────────────────────────────────────────────────

interface ContentBlock {
  heading?: string;
  body?: string;
  type?: 'text' | 'key_point' | 'example' | 'callout';
}

export interface LearnExperienceProps {
  contentItem: {
    id: string;
    module_id: string;
    title: string;
    instructions: string | null;
    schema: {
      content_blocks?: ContentBlock[];
      clinician_notes?: string;
      summary?: string;
    };
    xp_value: number;
  };
  onComplete: () => void;
  onBack: () => void;
}

// ── Constants ────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const READING_PROGRESS_KEY = 'psychoed_read_progress_';
const WORD_SPLIT_THRESHOLD = 300;

// ── Helpers ──────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateReadingTime(blocks: ContentBlock[]): number {
  const totalWords = blocks.reduce((sum, b) => {
    return sum + countWords((b.heading ?? '') + ' ' + (b.body ?? ''));
  }, 0);
  return Math.max(1, Math.ceil(totalWords / 200));
}

/**
 * Split a body string at a sentence boundary near the midpoint.
 * Returns [firstHalf, secondHalf].
 */
function splitAtSentenceBoundary(text: string): [string, string] {
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g);
  if (!sentences || sentences.length < 2) {
    // Fallback: split at the nearest space to the midpoint
    const mid = Math.floor(text.length / 2);
    const spaceAfter = text.indexOf(' ', mid);
    const splitIdx = spaceAfter !== -1 ? spaceAfter : mid;
    return [text.slice(0, splitIdx).trim(), text.slice(splitIdx).trim()];
  }

  const midTarget = Math.ceil(sentences.length / 2);
  const first = sentences.slice(0, midTarget).join('').trim();
  const second = sentences.slice(midTarget).join('').trim();
  return [first, second];
}

/**
 * Expand blocks so that any block with body exceeding WORD_SPLIT_THRESHOLD
 * words is split into two consecutive pages.
 */
function expandBlocks(blocks: ContentBlock[]): ContentBlock[] {
  const result: ContentBlock[] = [];

  for (const block of blocks) {
    const bodyWords = countWords(block.body ?? '');

    if (bodyWords > WORD_SPLIT_THRESHOLD && block.body) {
      const [firstHalf, secondHalf] = splitAtSentenceBoundary(block.body);
      result.push({
        heading: block.heading,
        body: firstHalf,
        type: block.type,
      });
      result.push({
        heading: block.heading ? `${block.heading} (cont.)` : undefined,
        body: secondHalf,
        type: block.type,
      });
    } else {
      result.push(block);
    }
  }

  return result;
}

// ── Component ────────────────────────────────────────────────────────

export function LearnExperience({
  contentItem,
  onComplete,
  onBack,
}: LearnExperienceProps) {
  const rawBlocks = contentItem.schema?.content_blocks ?? [];
  const pages = useMemo(() => expandBlocks(rawBlocks), [rawBlocks]);
  const totalPages = pages.length;

  const [currentPage, setCurrentPage] = useState(0);
  const [visitedPages, setVisitedPages] = useState<Set<number>>(new Set([0]));
  const [isCompleted, setIsCompleted] = useState(false);
  const [initialPageRestored, setInitialPageRestored] = useState(false);
  const [fayFirstDismissed, setFayFirstDismissed] = useState(false);
  const [fayLastDismissed, setFayLastDismissed] = useState(false);

  // Animations
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const xpTranslateY = useRef(new Animated.Value(20)).current;
  const dotScales = useRef<Animated.Value[]>([]).current;
  const pageOpacity = useRef(new Animated.Value(1)).current;

  const flatListRef = useRef<FlatList>(null);

  const readingTime = useMemo(() => estimateReadingTime(rawBlocks), [rawBlocks]);

  // ── Dot scale initialization ─────────────────────────────────────

  useEffect(() => {
    while (dotScales.length < totalPages) {
      dotScales.push(new Animated.Value(dotScales.length === 0 ? 1.3 : 1));
    }
  }, [totalPages, dotScales]);

  // ── Progress persistence ─────────────────────────────────────────

  useEffect(() => {
    if (initialPageRestored || totalPages === 0) return;

    AsyncStorage.getItem(`${READING_PROGRESS_KEY}${contentItem.id}`)
      .then((saved) => {
        if (saved) {
          const pageIndex = parseInt(saved, 10);
          if (!isNaN(pageIndex) && pageIndex > 0 && pageIndex < totalPages) {
            setCurrentPage(pageIndex);
            const visited = new Set<number>();
            for (let i = 0; i <= pageIndex; i++) visited.add(i);
            setVisitedPages(visited);
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: pageIndex,
                animated: false,
              });
            }, 100);
          }
        }
        setInitialPageRestored(true);
      })
      .catch(() => setInitialPageRestored(true));
  }, [contentItem.id, totalPages, initialPageRestored]);

  useEffect(() => {
    if (!initialPageRestored) return;
    AsyncStorage.setItem(
      `${READING_PROGRESS_KEY}${contentItem.id}`,
      String(currentPage),
    ).catch(() => {});
  }, [currentPage, contentItem.id, initialPageRestored]);

  // ── Page change handling ─────────────────────────────────────────

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const newPage = viewableItems[0].index;

        // Crossfade transition
        Animated.sequence([
          Animated.timing(pageOpacity, {
            toValue: 0.4,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(pageOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        setCurrentPage(newPage);
        setVisitedPages((prev) => {
          const next = new Set(prev);
          next.add(newPage);
          return next;
        });

        // Animate dot scales
        dotScales.forEach((scale, i) => {
          Animated.spring(scale, {
            toValue: i === newPage ? 1.3 : 1,
            useNativeDriver: true,
            friction: 8,
          }).start();
        });
      }
    },
    [dotScales, pageOpacity],
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  // ── Navigation ───────────────────────────────────────────────────

  const goToPage = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalPages) return;
      flatListRef.current?.scrollToIndex({ index, animated: true });
    },
    [totalPages],
  );

  // ── Completion ───────────────────────────────────────────────────

  const handleComplete = useCallback(() => {
    if (isCompleted) return;
    setIsCompleted(true);

    // Clear saved progress
    AsyncStorage.removeItem(
      `${READING_PROGRESS_KEY}${contentItem.id}`,
    ).catch(() => {});

    // XP celebration animation
    Animated.parallel([
      Animated.timing(xpOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(xpTranslateY, {
        toValue: -40,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
    ]).start();

    // Notify parent
    onComplete();

    // Auto-navigate back
    setTimeout(() => {
      onBack();
    }, 1800);
  }, [isCompleted, contentItem.id, xpOpacity, xpTranslateY, onComplete, onBack]);

  // ── Derived state ────────────────────────────────────────────────

  const allPagesVisited = visitedPages.size >= totalPages;
  const isLastPage = currentPage === totalPages - 1;
  const isFirstPage = currentPage === 0;

  const showFayFirst = isFirstPage && !fayFirstDismissed && !isCompleted;
  const showFayLast =
    isLastPage && allPagesVisited && !fayLastDismissed && !isCompleted;

  // ── Empty state ──────────────────────────────────────────────────

  if (totalPages === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No content available.</Text>
        <Pressable
          onPress={onBack}
          style={styles.emptyBackBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.emptyBackBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // ── Block style resolver ─────────────────────────────────────────

  function getBlockStyles(type?: string) {
    switch (type) {
      case 'key_point':
        return {
          card: styles.cardKeyPoint,
          body: styles.bodyKeyPoint,
        };
      case 'example':
        return {
          card: styles.cardExample,
          body: styles.bodyExample,
        };
      case 'callout':
        return {
          card: styles.cardCallout,
          body: styles.bodyCallout,
        };
      default:
        return {
          card: undefined,
          body: undefined,
        };
    }
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Top bar: reading time + page indicator */}
      <View style={styles.topBar}>
        <Text style={styles.readingTime}>
          ~{readingTime} min read
        </Text>
        <Text style={styles.pageIndicator}>
          {currentPage + 1} of {totalPages}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentPage + 1) / totalPages) * 100}%` },
          ]}
        />
      </View>

      {/* Fay bubble - top position (first page) */}
      {showFayFirst && (
        <View style={styles.fayTopContainer}>
          <FayContextBubble
            message="Take your time with this. No rush."
            position="top"
            onDismiss={() => setFayFirstDismissed(true)}
          />
        </View>
      )}

      {/* Content pages */}
      <Animated.View style={[styles.flatListWrapper, { opacity: pageOpacity }]}>
        <FlatList
          ref={flatListRef}
          data={pages}
          keyExtractor={(_, index) => `page-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item: block }) => {
            const blockType = block.type ?? 'text';
            const blockStyles = getBlockStyles(blockType);

            return (
              <View style={[styles.page, { width: SCREEN_WIDTH }]}>
                <View style={[styles.pageContent, blockStyles.card]}>
                  <ScrollView
                    showsVerticalScrollIndicator
                    bounces
                    nestedScrollEnabled
                    contentContainerStyle={styles.pageScrollContent}
                  >
                    {block.heading && (
                      <Text style={styles.heading}>{block.heading}</Text>
                    )}
                    {block.body && (
                      <Text style={[styles.body, blockStyles.body]}>
                        {block.body}
                      </Text>
                    )}
                  </ScrollView>
                </View>
              </View>
            );
          }}
        />
      </Animated.View>

      {/* Fay bubble - bottom position (last page, all visited) */}
      {showFayLast && (
        <View style={styles.fayBottomContainer}>
          <FayContextBubble
            message="Nice work getting through that."
            position="bottom"
            onDismiss={() => setFayLastDismissed(true)}
          />
        </View>
      )}

      {/* XP celebration overlay */}
      {isCompleted && (
        <Animated.View
          style={[
            styles.xpOverlay,
            {
              opacity: xpOpacity,
              transform: [{ translateY: xpTranslateY }],
            },
          ]}
          accessibilityLabel={`Earned ${contentItem.xp_value} experience points`}
        >
          <View style={styles.xpBadge}>
            <Text style={styles.xpNumber}>+{contentItem.xp_value}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </Animated.View>
      )}

      {/* Bottom navigation */}
      <View style={styles.bottomBar}>
        {/* Page dots */}
        <View
          style={styles.dotsRow}
          accessibilityRole="tablist"
          accessibilityLabel={`Page ${currentPage + 1} of ${totalPages}`}
        >
          {pages.map((_, i) => {
            const isVisited = visitedPages.has(i);
            const isCurrent = i === currentPage;
            return (
              <Pressable
                key={i}
                onPress={() => goToPage(i)}
                hitSlop={8}
                style={styles.dotTouchTarget}
                accessibilityRole="tab"
                accessibilityLabel={`Page ${i + 1}`}
                accessibilityState={{ selected: isCurrent }}
              >
                <Animated.View
                  style={[
                    styles.dot,
                    isVisited && styles.dotVisited,
                    isCurrent && styles.dotCurrent,
                    dotScales[i]
                      ? { transform: [{ scale: dotScales[i] }] }
                      : undefined,
                  ]}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          {currentPage > 0 ? (
            <Pressable
              onPress={() => goToPage(currentPage - 1)}
              style={({ pressed }) => [
                styles.navBtn,
                styles.navBtnBack,
                pressed && styles.navBtnBackPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Previous page"
            >
              <Text style={styles.navBtnBackText}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.navBtnSpacer} />
          )}

          {isLastPage ? (
            <Pressable
              onPress={handleComplete}
              disabled={!allPagesVisited || isCompleted}
              style={({ pressed }) => [
                styles.navBtn,
                styles.navBtnGotIt,
                pressed && !isCompleted && styles.navBtnGotItPressed,
                (!allPagesVisited || isCompleted) && styles.navBtnDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Mark as understood"
              accessibilityState={{ disabled: !allPagesVisited || isCompleted }}
            >
              <Text
                style={[
                  styles.navBtnGotItText,
                  (!allPagesVisited || isCompleted) && styles.navBtnDisabledText,
                ]}
              >
                {isCompleted
                  ? 'Done!'
                  : allPagesVisited
                    ? 'Got it'
                    : 'Read all pages first'}
              </Text>
              {!isCompleted && allPagesVisited && contentItem.xp_value > 0 && (
                <Text style={styles.navBtnXpHint}>
                  +{contentItem.xp_value} XP
                </Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={() => goToPage(currentPage + 1)}
              style={({ pressed }) => [
                styles.navBtn,
                styles.navBtnNext,
                pressed && styles.navBtnNextPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Next page"
            >
              <Text style={styles.navBtnNextText}>Next</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

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
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  emptyBackBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radii.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBackBtnText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  readingTime: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  pageIndicator: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Progress bar
  progressBarBg: {
    height: 3,
    backgroundColor: Colors.surfaceAlt,
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },

  // Fay positioning
  fayTopContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  fayBottomContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },

  // FlatList wrapper for crossfade
  flatListWrapper: {
    flex: 1,
  },

  // Pages
  page: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  pageContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  pageScrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xl + 8,
  },
  heading: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    lineHeight: 30,
  },
  body: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 26,
  },

  // Block type: key_point
  cardKeyPoint: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  bodyKeyPoint: {
    fontWeight: '500',
    color: Colors.text,
  },

  // Block type: example
  cardExample: {
    backgroundColor: Colors.surfaceAlt,
  },
  bodyExample: {
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },

  // Block type: callout
  cardCallout: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  bodyCallout: {
    color: Colors.primaryDark,
  },

  // XP overlay
  xpOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  xpBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  xpNumber: {
    fontSize: FontSizes.hero,
    fontWeight: '800',
    color: Colors.primary,
  },
  xpLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginTop: 2,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dotTouchTarget: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceAlt,
  },
  dotVisited: {
    backgroundColor: Colors.primaryLight,
  },
  dotCurrent: {
    backgroundColor: Colors.primary,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
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
  navBtnGotIt: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  navBtnGotItPressed: {
    backgroundColor: Colors.primaryDark,
  },
  navBtnGotItText: {
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
  navBtnDisabled: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navBtnDisabledText: {
    color: Colors.textTertiary,
  },
});
