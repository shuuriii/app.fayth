import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';
import type { ModuleStatus } from '@fayth/types';

interface ModuleCardProps {
  chapterNumber: number;
  title: string;
  status: ModuleStatus;
  onPress: () => void;
}

const STATUS_CONFIG: Record<
  ModuleStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  locked: {
    label: 'Locked',
    bgColor: Colors.lockedBg,
    textColor: Colors.locked,
  },
  assigned: {
    label: 'Assigned',
    bgColor: Colors.warningLight,
    textColor: Colors.warning,
  },
  active: {
    label: 'In Progress',
    bgColor: Colors.primaryLight,
    textColor: Colors.primary,
  },
  complete: {
    label: 'Complete',
    bgColor: Colors.successLight,
    textColor: Colors.success,
  },
};

export function ModuleCard({ chapterNumber, title, status, onPress }: ModuleCardProps) {
  const isLocked = status === 'locked';
  const config = STATUS_CONFIG[status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isLocked && styles.cardLocked,
        pressed && !isLocked && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Module ${chapterNumber}: ${title}. Status: ${config.label}`}
    >
      <View style={[styles.chapterBadge, isLocked && styles.chapterBadgeLocked]}>
        {isLocked ? (
          <Text style={styles.lockIcon}>{'🔒'}</Text>
        ) : (
          <Text style={[styles.chapterNumber, isLocked && styles.textLocked]}>
            {chapterNumber}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, isLocked && styles.textLocked]} numberOfLines={2}>
          {title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
          <Text style={[styles.statusText, { color: config.textColor }]}>{config.label}</Text>
        </View>
      </View>

      <View style={styles.chevron}>
        <Text style={[styles.chevronText, isLocked && styles.textLocked]}>{'>'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardLocked: {
    opacity: 0.55,
  },
  cardPressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  chapterBadge: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  chapterBadgeLocked: {
    backgroundColor: Colors.lockedBg,
  },
  chapterNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  lockIcon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  textLocked: {
    color: Colors.locked,
  },
  chevron: {
    paddingLeft: Spacing.xs,
  },
  chevronText: {
    fontSize: FontSizes.lg,
    color: Colors.textTertiary,
    fontWeight: '300',
  },
});
