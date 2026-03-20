import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useContentItems, ContentItem, ContentResponse } from '@/hooks/useContentItems';
import { PsychoeducationBlock } from '@/components/PsychoeducationBlock';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

interface ModuleInfo {
  id: number;
  chapter_number: number;
  title: string;
  description: string;
}

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
  const { fetchContentItems, getResponsesForModule } = useContentItems();

  const [module, setModule] = useState<ModuleInfo | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [responses, setResponses] = useState<Map<string, ContentResponse>>(new Map());
  const [expandedPsychoed, setExpandedPsychoed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadModuleData();
  }, [id]);

  async function loadModuleData() {
    setLoading(true);
    try {
      // Fetch module info
      const { data: modData, error: modError } = await supabase
        .from('yb_modules')
        .select('id, chapter_number, title, description')
        .eq('id', Number(id))
        .single();

      if (modError) throw modError;
      setModule(modData);

      // Fetch content items for this module
      const contentItems = await fetchContentItems(id);
      setItems(contentItems);

      // Fetch existing responses for all items
      if (contentItems.length > 0) {
        const itemIds = contentItems.map((ci) => ci.id);
        const responseMap = await getResponsesForModule(itemIds);
        setResponses(responseMap);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to load module');
    } finally {
      setLoading(false);
    }
  }

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

    // Navigate to worksheet screen for interactive types
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
            <PsychoeducationBlock blocks={item.schema.content_blocks} />
          </View>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Loading...',
            headerBackTitle: 'Modules',
            headerTintColor: Colors.primary,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </>
    );
  }

  if (!module) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Module',
            headerBackTitle: 'Modules',
            headerTintColor: Colors.primary,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Module not found.</Text>
        </View>
      </>
    );
  }

  const completedCount = items.filter((i) => responses.has(i.id)).length;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: `Module ${module.chapter_number}`,
          headerBackTitle: 'Modules',
          headerTintColor: Colors.primary,
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.text, fontWeight: '600' },
        }}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderContentItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
                      { width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` },
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

  // Header
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

  // Content items
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

  // Psychoeducation expanded content
  psychoedContent: {
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
    marginTop: -Spacing.xs,
  },

  // Empty state
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
