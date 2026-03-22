import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

interface BreakNudgeProps {
  visible: boolean;
  onContinue: () => void;
  onSaveAndExit: () => void;
  minutesElapsed?: number;
}

export function BreakNudge({
  visible,
  onContinue,
  onSaveAndExit,
  minutesElapsed,
}: BreakNudgeProps) {
  const elapsed = minutesElapsed ?? 20;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onContinue}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Time for a breather?</Text>
          <Text style={styles.message}>
            You've been at this for {elapsed} minutes. Keep going, or save and
            come back?
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onContinue}
              style={[styles.button, styles.continueButton]}
              accessibilityRole="button"
              accessibilityLabel="Continue for 5 more minutes"
            >
              <Text style={styles.continueText}>5 more minutes</Text>
            </Pressable>

            <Pressable
              onPress={onSaveAndExit}
              style={[styles.button, styles.saveButton]}
              accessibilityRole="button"
              accessibilityLabel="Save and come back later"
            >
              <Text style={styles.saveText}>Save & come back</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    gap: Spacing.sm,
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: Colors.surfaceAlt,
  },
  continueText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
});
