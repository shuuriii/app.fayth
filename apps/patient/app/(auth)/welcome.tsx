import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>fayth</Text>
        <Text style={styles.tagline}>Your companion for managing ADHD</Text>
      </View>

      <View style={styles.cards}>
        <Text style={styles.prompt}>I am...</Text>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push({ pathname: '/(auth)/login', params: { role: 'patient' } })}
          accessibilityRole="button"
          accessibilityLabel="I'm here for myself"
        >
          <Text style={styles.cardEmoji}>🌱</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Here for myself</Text>
            <Text style={styles.cardDesc}>
              Track symptoms, work through modules, and build better habits
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.card, styles.cardProvider, pressed && styles.cardPressed]}
          onPress={() => router.push({ pathname: '/(auth)/login', params: { role: 'provider' } })}
          accessibilityRole="button"
          accessibilityLabel="I'm a healthcare provider"
        >
          <Text style={styles.cardEmoji}>🩺</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>A healthcare provider</Text>
            <Text style={styles.cardDesc}>
              Psychologist, psychiatrist, or counsellor supporting clients
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl + 8,
  },
  logo: {
    fontSize: 52,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  cards: {
    gap: Spacing.md,
  },
  prompt: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardProvider: {
    // subtle visual distinction
  },
  cardPressed: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
