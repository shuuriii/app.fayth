import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useMarkPsychoeducationRead } from '@/hooks/useWorksheet';
import { Colors, FontSizes, Spacing, Radii, FayColors } from '@/lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const READING_PROGRESS_KEY = 'psychoed_read_progress_';

// ── Types ────────────────────────────────────────────────────────────

interface ContentBlock {
  heading?: string;
  body?: string;
}

interface ContentItemData {
  id: string;
  module_id: string;
  title: string;
  instructions: string | null;
  schema: {
    content_blocks?: ContentBlock[];
    clinician_notes?: string;
  };
  xp_value: number;
}

// ── Data Fetching ────────────────────────────────────────────────────

async function fetchContentItem(contentItemId: string): Promise<ContentItemData> {
  const { data, error } = await supabase
    .from('yb_content_items')
    .select('id, module_id, title, instructions, schema, xp_value')
    .eq('id', contentItemId)
    .single();

  if (error) throw error;
  return data as ContentItemData;
}

// ── Reading Time Estimate ────────────────────────────────────────────

function estimateReadingTime(blocks: ContentBlock[]): number {
  const totalWords = blocks.reduce((sum, b) => {
    const words = ((b.heading ?? '') + ' ' + (b.body ?? '')).split(/\s+/).length;
    return sum + words;
  }, 0);
  return Math.max(1, Math.ceil(totalWords / 200)); // ~200 wpm
}

// ── Main Screen ──────────────────────────────────────────────────────

export default function PsychoeducationReaderScreen() {
  const { moduleId, contentItemId } = useLocalSearchParams<{
    moduleId: string;
    contentItemId: string;
  }>();
  const router = useRouter();
  const markRead = useMarkPsychoeducationRead();

  const [currentPage, setCurrentPage] = useState(0);
  const [visitedPages, setVisitedPages] = useState<Set<number>>(new Set([0]));
  const [isCompleted, setIsCompleted] = useState(false);
  const [initialPageRestored, setInitialPageRestored] = useState(false);

  // Animations
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const xpTranslateY = useRef(new Animated.Value(20)).current;
  const dotScales = useRef<Animated.Value[]>([]).current;

  const flatListRef = useRef<FlatList>(null);

  // Fetch content item
  const { data: contentItem, isLoading } = useQuery({
    queryKey: ['psychoed-reader', contentItemId],
    queryFn: () => fetchContentItem(contentItemId!),
    enabled: !!contentItemId,
    staleTime: 10 * 60 * 1000,
  });

  const blocks = contentItem?.schema?.content_blocks ?? [];
  const totalPages = blocks.length;

  // Initialize dot scales
  useEffect(() => {
    while (dotScales.length < totalPages) {
      dotScales.push(new Animated.Value(dotScales.length === 0 ? 1.3 : 1));
    }
  }, [totalPages]);

  // Restore reading position from AsyncStorage
  useEffect(() => {
    if (!contentItemId || initialPageRestored || totalPages === 0) return;

    AsyncStorage.getItem(`${READING_PROGRESS_KEY}${contentItemId}`)
      .then((saved) => {
        if (saved) {
          const pageIndex = parseInt(saved, 10);
          if (!isNaN(pageIndex) && pageIndex > 0 && pageIndex < totalPages) {
            setCurrentPage(pageIndex);
            // Mark pages up to restored position as visited
            const visited = new Set<number>();
            for (let i = 0; i <= pageIndex; i++) visited.add(i);
            setVisitedPages(visited);
            // Scroll to restored position after render
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: pageIndex, animated: false });
            }, 100);
          }
        }
        setInitialPageRestored(true);
      })
      .catch(() => setInitialPageRestored(true));
  }, [contentItemId, totalPages, initialPageRestored]);

  // Save reading position on page change
  useEffect(() => {
    if (!contentItemId || !initialPageRestored) return;
    AsyncStorage.setItem(
      `${READING_PROGRESS_KEY}${contentItemId}`,
      String(currentPage),
    ).catch(() => {});
  }, [currentPage, contentItemId, initialPageRestored]);

  // Handle page change from scroll
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const newPage = viewableItems[0].index;
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
    [dotScales],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Navigate between pages
  function goToPage(index: number) {
    if (index < 0 || index >= totalPages) return;
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }

  // Complete reading
  async function handleComplete() {
    if (!contentItemId || isCompleted) return;
    setIsCompleted(true);

    // Mark as read in database
    markRead.mutate(contentItemId);

    // Clear reading progress from AsyncStorage
    AsyncStorage.removeItem(`${READING_PROGRESS_KEY}${contentItemId}`).catch(() => {});

    // Play XP animation
    Animated.parallel([
      Animated.timing(xpOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(xpTranslateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate back after delay
    setTimeout(() => {
      router.back();
    }, 1800);
  }

  // Check if all pages visited (required to enable "Got it")
  const allPagesVisited = visitedPages.size >= totalPages;
  const isLastPage = currentPage === totalPages - 1;

  // ── Header ──────────────────────────────────────────────────────────

  const headerOptions = {
    headerShown: true,
    headerTitle: contentItem?.title
      ? contentItem.title.length > 28
        ? contentItem.title.slice(0, 26) + '...'
        : contentItem.title
      : 'Reading',
    headerBackTitle: 'Module',
    headerTintColor: Colors.primary,
    headerStyle: { backgroundColor: Colors.background },
    headerTitleStyle: { color: Colors.text, fontWeight: '600' as const },
  };

  // ── Loading ─────────────────────────────────────────────────────────

  if (isLoading || !contentItem) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </>
    );
  }

  if (blocks.length === 0) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No content available.</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const readingTime = estimateReadingTime(blocks);

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <View style={styles.container}>
        {/* Top bar: reading time + progress */}
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

        {/* Content pages */}
        <FlatList
          ref={flatListRef}
          data={blocks}
          keyExtractor={(_, index) => `block-${index}`}
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
          renderItem={({ item: block, index }) => (
            <View style={[styles.page, { width: SCREEN_WIDTH }]}>
              <View style={styles.pageContent}>
                {block.heading && (
                  <Text style={styles.heading}>{block.heading}</Text>
                )}
                {block.body && (
                  <Text style={styles.body}>{block.body}</Text>
                )}
              </View>
            </View>
          )}
        />

        {/* XP animation overlay (shown after completion) */}
        {isCompleted && (
          <Animated.View
            style={[
              styles.xpOverlay,
              {
                opacity: xpOpacity,
                transform: [{ translateY: xpTranslateY }],
              },
            ]}
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
          <View style={styles.dotsRow}>
            {blocks.map((_, i) => {
              const isVisited = visitedPages.has(i);
              const isCurrent = i === currentPage;
              return (
                <Pressable key={i} onPress={() => goToPage(i)} hitSlop={8}>
                  <Animated.View
                    style={[
                      styles.dot,
                      isVisited && styles.dotVisited,
                      isCurrent && styles.dotCurrent,
                      dotScales[i] ? { transform: [{ scale: dotScales[i] }] } : undefined,
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
                accessibilityLabel="Mark as understood"
              >
                <Text
                  style={[
                    styles.navBtnGotItText,
                    (!allPagesVisited || isCompleted) && styles.navBtnDisabledText,
                  ]}
                >
                  {isCompleted ? 'Done!' : allPagesVisited ? 'Got it' : 'Read all pages first'}
                </Text>
                {!isCompleted && allPagesVisited && contentItem.xp_value > 0 && (
                  <Text style={styles.navBtnXpHint}>+{contentItem.xp_value} XP</Text>
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
                accessibilityLabel="Next page"
              >
                <Text style={styles.navBtnNextText}>Next</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </>
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
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radii.md,
  },
  backBtnText: {
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

  // Pages
  page: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  pageContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxHeight: '85%',
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
