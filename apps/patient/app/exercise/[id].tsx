import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useWorksheet, useSubmitWorksheet } from '@/hooks/useWorksheet';
import { ExerciseExperience } from '@/components/experiences/ExerciseExperience';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error: fetchError } = useWorksheet(id);
  const submitMutation = useSubmitWorksheet();

  const contentItem = data?.item ?? null;
  const existingResponse = data?.existingResponse ?? null;

  const headerTitle = contentItem
    ? contentItem.title.length > 30
      ? contentItem.title.slice(0, 28) + '...'
      : contentItem.title
    : 'Exercise';

  const stackScreenOptions = {
    headerShown: true,
    headerTitle,
    headerBackTitle: 'Back',
    headerTintColor: Colors.primary,
    headerStyle: { backgroundColor: Colors.background },
    headerTitleStyle: { color: Colors.text, fontWeight: '600' as const },
  };

  async function handleSubmit(values: Record<string, any>) {
    if (!contentItem || !id) return;

    try {
      await submitMutation.mutateAsync({
        contentItemId: id,
        responseData: values,
        xpValue: contentItem.xp_value,
      });
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong. Please try again.');
      throw err; // Re-throw so ExerciseExperience can handle it
    }
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={stackScreenOptions} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading exercise...</Text>
        </View>
      </>
    );
  }

  if (fetchError || !contentItem) {
    return (
      <>
        <Stack.Screen options={stackScreenOptions} />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Could not load this exercise</Text>
          <Text style={styles.errorSubtext}>Please go back and try again.</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={stackScreenOptions} />
      <ExerciseExperience
        contentItem={contentItem}
        existingResponse={existingResponse}
        onSubmit={handleSubmit}
        onBack={() => router.back()}
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
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  errorSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: Radii.md,
  },
  backButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
});
