import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

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
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
});
