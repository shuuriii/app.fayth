import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { FayEvolutionStage } from '@fayth/types';
import { Fay } from '@/components/Fay';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

interface FayContextBubbleProps {
  message: string;
  position?: 'top' | 'bottom';
  evolutionStage?: FayEvolutionStage;
  onDismiss?: () => void;
}

export function FayContextBubble({
  message,
  position = 'top',
  evolutionStage = 'ember',
  onDismiss,
}: FayContextBubbleProps) {
  return (
    <View
      style={[
        styles.container,
        position === 'bottom' && styles.containerBottom,
      ]}
      accessibilityRole="alert"
      accessibilityLabel={`Fay says: ${message}`}
    >
      {position === 'top' && (
        <View style={styles.bubbleWrapper}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
            {onDismiss && (
              <Pressable
                onPress={onDismiss}
                style={styles.dismiss}
                accessibilityRole="button"
                accessibilityLabel="Dismiss"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.dismissText}>{'\u00D7'}</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.arrowDown} />
        </View>
      )}

      <View style={styles.fayContainer}>
        <Fay
          visualState="present"
          evolutionStage={evolutionStage}
          compact
        />
      </View>

      {position === 'bottom' && (
        <View style={styles.bubbleWrapper}>
          <View style={styles.arrowUp} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
            {onDismiss && (
              <Pressable
                onPress={onDismiss}
                style={styles.dismiss}
                accessibilityRole="button"
                accessibilityLabel="Dismiss"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.dismissText}>{'\u00D7'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  containerBottom: {
    flexDirection: 'column',
  },
  bubbleWrapper: {
    alignItems: 'flex-start',
    marginLeft: Spacing.xl,
  },
  bubble: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    maxWidth: 280,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
    flex: 1,
  },
  dismiss: {
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: FontSizes.lg,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  arrowDown: {
    marginLeft: Spacing.md,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.surface,
  },
  arrowUp: {
    marginLeft: Spacing.md,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.surface,
  },
  fayContainer: {
    marginLeft: Spacing.sm,
  },
});
