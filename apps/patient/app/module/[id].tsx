import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { useCompleteModule } from '@/hooks/useCompleteModule';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';
import type { ContentItem } from '@/hooks/useModuleDetail';

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  worksheet: { label: 'Worksheet', color: Colors.primary, bg: Colors.primaryLight },
  psychoeducation: { label: 'Learn', color: '#B8935A', bg: '#FDF6E8' },
  exercise: { label: 'Exercise', color: '#e08a52', bg: '#fff7ed' },
  diary: { label: 'Diary', color: '#e6a817', bg: Colors.warningLight },
  table: { label: 'Table', color: Colors.textSecondary, bg: Colors.surfaceAlt },
};

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useModuleDetail(id);
  const completeModule = useCompleteModule();

  const module = data?.module ?? null;
  const items = data?.items ?? [];
  const responses = data?.responses ?? new Map();

  // Refetch when screen regains focus (e.g. returning from reader/worksheet)
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Auto-completion: detect when all items are done
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const completionTriggered = useRef(false);
  const celebrateOpacity = useRef(new Animated.Value(0)).current;

  const completedCount = items.filter((i) => responses.has(i.id)).length;
  const allDone = items.length > 0 && completedCount === items.length;

  useEffect(() => {
    if (allDone && !completionTriggered.current && id) {
      completionTriggered.current = true;
      completeModule
        .mutateAsync(id)
        .then(() => {
          setModuleCompleted(true);
          Animated.timing(celebrateOpacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
        })
        .catch(() => {
          // Module may already be complete — that's fine
          completionTriggered.current = false;
        });
    }
  }, [allDone, id]);

  function handleItemPress(item: ContentItem) {
    if (item.type === 'psychoeducation') {
      router.push(`/module/${item.module_id}/read/${item.id}`);
      return;
    }
    if (item.type === 'exercise') {
      router.push(`/exercise/${item.id}`);
      return;
    }
    router.push(`/worksheet/${item.id}`);
  }

  function renderContentItem({ item }: { item: ContentItem }) {
    const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.table;
    const hasResponse = responses.has(item.id);
    const isPsychoed = item.type === 'psychoeducation';

    return (
      <Pressable
        onPress={() => handleItemPress(item)}
        style={({ pressed }) => [
          styles.itemCard,
          hasResponse && styles.itemCardCompleted,
          pressed && styles.itemCardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${config.label}: ${item.title}. ${hasResponse ? 'Completed' : 'Not started'}`}
      >
        <View style={styles.itemContent}>
          <View style={styles.itemTop}>
            <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
              <Text style={[styles.typeBadgeText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
            {item.xp_value > 0 && (
              <Text style={styles.xpText}>{item.xp_value} XP</Text>
            )}
          </View>

          <Text style={styles.itemTitle}>{item.title}</Text>

          {item.instructions ? (
            <Text style={styles.itemInstructions} numberOfLines={2}>
              {item.instructions}
            </Text>
          ) : null}

          <View style={styles.itemBottom}>
            {hasResponse && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>{isPsychoed ? 'Read' : 'Completed'}</Text>
              </View>
            )}
            {!hasResponse && (
              <Text style={styles.startHint}>
                {isPsychoed ? 'Read' : 'Start'}
              </Text>
            )}
            {hasResponse && !isPsychoed && (
              <Text style={styles.startHint}>Review</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  const headerOptions = {
    headerShown: true,
    headerTitle: module ? `Module ${module.chapter_number}` : 'Loading...',
    headerBackTitle: 'Modules',
    headerTintColor: Colors.primary,
    headerStyle: { backgroundColor: Colors.background },
    headerTitleStyle: { color: Colors.text, fontWeight: '600' as const },
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </>
    );
  }

  if (!module) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Module not found.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={headerOptions} />
      {moduleCompleted && (
        <Animated.View style={[styles.completionBanner, { opacity: celebrateOpacity }]}>
          <Text style={styles.completionEmoji}>+500 XP</Text>
          <Text style={styles.completionTitle}>Module Complete!</Text>
          <Text style={styles.completionSubtext}>
            Great work finishing all the activities.
          </Text>
        </Animated.View>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderContentItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            {module.description ? (
              <Text style={styles.moduleDescription}>{module.description}</Text>
            ) : null}

            {items.length > 0 && (
              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(completedCount / items.length) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedCount} of {items.length} explored
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No content items yet.</Text>
            <Text style={styles.emptySubtext}>
              Your provider will add activities to this module soon.
            </Text>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  moduleTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  moduleDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
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
    fontWeight: '600',
    color: Colors.textSecondary,
    minWidth: 55,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  itemCardCompleted: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  itemCardPressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  itemContent: {},
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  typeBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  xpText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  itemTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  itemInstructions: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  completedText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.success,
  },
  startHint: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '500',
  },
  completionBanner: {
    backgroundColor: Colors.successLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.success,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  completionEmoji: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  completionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.success,
  },
  completionSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
