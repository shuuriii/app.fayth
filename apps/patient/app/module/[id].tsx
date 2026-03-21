import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { PsychoeducationCard } from '@/components/PsychoeducationCard';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';
import type { ContentItem } from '@/hooks/useModuleDetail';

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  worksheet: { label: 'Worksheet', color: Colors.primary, bg: Colors.primaryLight },
  psychoeducation: { label: 'Learn', color: '#6366f1', bg: '#eef2ff' },
  exercise: { label: 'Exercise', color: '#e08a52', bg: '#fff7ed' },
  diary: { label: 'Diary', color: '#e6a817', bg: Colors.warningLight },
  table: { label: 'Table', color: Colors.textSecondary, bg: Colors.surfaceAlt },
};

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useModuleDetail(id);

  const [expandedPsychoed, setExpandedPsychoed] = useState<Set<string>>(new Set());

  const module = data?.module ?? null;
  const items = data?.items ?? [];
  const responses = data?.responses ?? new Map();

  function togglePsychoed(itemId: string) {
    setExpandedPsychoed((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  function handleItemPress(item: ContentItem) {
    if (item.type === 'psychoeducation') {
      togglePsychoed(item.id);
      return;
    }
    router.push(`/worksheet/${item.id}`);
  }

  function renderContentItem({ item }: { item: ContentItem }) {
    const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.table;
    const hasResponse = responses.has(item.id);
    const isPsychoed = item.type === 'psychoeducation';
    const isExpanded = expandedPsychoed.has(item.id);

    return (
      <View>
        <Pressable
          onPress={() => handleItemPress(item)}
          style={({ pressed }) => [
            styles.itemCard,
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
              <Text style={styles.itemInstructions} numberOfLines={isPsychoed && !isExpanded ? 2 : undefined}>
                {item.instructions}
              </Text>
            ) : null}

            <View style={styles.itemBottom}>
              {hasResponse && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              )}
              {isPsychoed && (
                <Text style={styles.expandHint}>
                  {isExpanded ? 'Tap to collapse' : 'Tap to read'}
                </Text>
              )}
              {!isPsychoed && !hasResponse && (
                <Text style={styles.startHint}>Tap to start</Text>
              )}
              {!isPsychoed && hasResponse && (
                <Text style={styles.startHint}>Tap to review</Text>
              )}
            </View>
          </View>
        </Pressable>

        {isPsychoed && isExpanded && item.schema?.content_blocks && (
          <View style={styles.psychoedContent}>
            <PsychoeducationCard
              contentItemId={item.id}
              blocks={item.schema.content_blocks}
              alreadyRead={hasResponse}
            />
          </View>
        )}
      </View>
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

  const completedCount = items.filter((i) => responses.has(i.id)).length;

  return (
    <>
      <Stack.Screen options={headerOptions} />
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
                  {completedCount}/{items.length} done
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
  expandHint: {
    fontSize: FontSizes.xs,
    color: '#6366f1',
    fontWeight: '500',
  },
  startHint: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '500',
  },
  psychoedContent: {
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
    marginTop: -Spacing.xs,
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
