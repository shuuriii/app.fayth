import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useMarkPsychoeducationRead } from '@/hooks/useWorksheet';
import { LearnExperience } from '@/components/experiences/LearnExperience';
import { CBTCycleDiagram } from '@/components/interactive/CBTCycleDiagram';
import { getCustomRenderer } from '@/lib/content-registry';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

// ── Types ────────────────────────────────────────────────────────────

interface ContentItemData {
  id: string;
  module_id: string;
  title: string;
  instructions: string | null;
  schema: {
    content_blocks?: Array<{ heading?: string; body?: string; type?: 'text' | 'key_point' | 'example' | 'callout' }>;
    clinician_notes?: string;
    summary?: string;
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

// ── Main Screen ──────────────────────────────────────────────────────

export default function PsychoeducationReaderScreen() {
  const { moduleId, contentItemId } = useLocalSearchParams<{
    moduleId: string;
    contentItemId: string;
  }>();
  const router = useRouter();
  const markRead = useMarkPsychoeducationRead();

  const { data: contentItem, isLoading } = useQuery({
    queryKey: ['psychoed-reader', contentItemId],
    queryFn: () => fetchContentItem(contentItemId!),
    enabled: !!contentItemId,
    staleTime: 10 * 60 * 1000,
  });

  // Check content registry for custom interactive component
  const customRenderer = contentItemId ? getCustomRenderer(contentItemId) : null;

  const headerTitle = contentItem
    ? contentItem.title.length > 28
      ? contentItem.title.slice(0, 26) + '...'
      : contentItem.title
    : 'Reading';

  const headerOptions = {
    headerShown: true,
    headerTitle,
    headerBackTitle: 'Module',
    headerTintColor: Colors.primary,
    headerStyle: { backgroundColor: Colors.background },
    headerTitleStyle: { color: Colors.text, fontWeight: '600' as const },
  };

  function handleComplete() {
    if (!contentItemId) return;
    markRead.mutate(contentItemId);
    setTimeout(() => router.back(), 1800);
  }

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

  // ── CBTCycleDiagram view mode (ch1_item_02) ─────────────────────────

  if (customRenderer?.component === 'CBTCycleDiagram' && customRenderer.mode === 'view') {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>{contentItem.title}</Text>
          {contentItem.instructions && (
            <Text style={styles.instructions}>{contentItem.instructions}</Text>
          )}
          <CBTCycleDiagram
            mode="view"
            contentBlocks={contentItem.schema?.content_blocks}
          />
          <Pressable
            onPress={() => {
              if (contentItemId) markRead.mutate(contentItemId);
              router.back();
            }}
            style={({ pressed }) => [
              styles.doneBtn,
              pressed && styles.doneBtnPressed,
            ]}
          >
            <Text style={styles.doneBtnText}>Got it</Text>
            {contentItem.xp_value > 0 && (
              <Text style={styles.doneBtnXp}>+{contentItem.xp_value} XP</Text>
            )}
          </Pressable>
        </ScrollView>
      </>
    );
  }

  // ── Default: LearnExperience ────────────────────────────────────────

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <LearnExperience
        contentItem={contentItem}
        onComplete={handleComplete}
        onBack={() => router.back()}
      />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  instructions: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  doneBtnPressed: {
    backgroundColor: Colors.primaryDark,
  },
  doneBtnText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  doneBtnXp: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primaryLight,
    marginTop: 2,
  },
});
