import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';
import { useMarkPsychoeducationRead } from '@/hooks/useWorksheet';

interface ContentBlock {
  heading?: string;
  body?: string;
}

interface PsychoeducationCardProps {
  contentItemId: string;
  blocks: ContentBlock[];
  alreadyRead: boolean;
}

export function PsychoeducationCard({
  contentItemId,
  blocks,
  alreadyRead,
}: PsychoeducationCardProps) {
  const markRead = useMarkPsychoeducationRead();

  useEffect(() => {
    if (!alreadyRead) {
      markRead.mutate(contentItemId);
    }
  }, [contentItemId, alreadyRead]);

  if (!blocks || blocks.length === 0) return null;

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => (
        <View key={index} style={styles.block}>
          {block.heading ? (
            <Text style={styles.heading}>{block.heading}</Text>
          ) : null}
          {block.body ? (
            <Text style={styles.body}>{block.body}</Text>
          ) : null}
        </View>
      ))}
      {!alreadyRead && (
        <View style={styles.readBadge}>
          <Text style={styles.readBadgeText}>Marked as read</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xs,
  },
  block: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  heading: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  body: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  readBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
    marginBottom: Spacing.sm,
  },
  readBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.success,
  },
});
