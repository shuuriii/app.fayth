import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

export default function NameScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [dobText, setDobText] = useState('');
  const [loading, setLoading] = useState(false);

  const isNameValid = fullName.trim().length >= 2;

  // Accept DD/MM/YYYY format
  function formatDobInput(text: string): string {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }

  function parseDob(text: string): Date | null {
    const parts = text.split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    if (!dd || !mm || !yyyy || yyyy.length !== 4) return null;

    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10) - 1;
    const year = parseInt(yyyy, 10);

    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    // Must be at least 18 years old
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    if (age < 18 || age > 120) return null;

    return date;
  }

  const dob = parseDob(dobText);
  const isFormValid = isNameValid && dob !== null;

  function handleContinue() {
    if (!isFormValid || !dob) {
      Alert.alert('Incomplete', 'Please enter your full name and a valid date of birth.');
      return;
    }

    router.push({
      pathname: '/(onboarding)/diagnosis',
      params: {
        fullName: fullName.trim(),
        dob: dob.toISOString(),
      },
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.step}>Step 1 of 2</Text>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            We would like to know a little about you to personalise your experience.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.textTertiary}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            accessibilityLabel="Full name"
          />

          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={Colors.textTertiary}
            value={dobText}
            onChangeText={(text) => setDobText(formatDobInput(text))}
            keyboardType="number-pad"
            maxLength={10}
            returnKeyType="done"
            accessibilityLabel="Date of birth"
          />
          {dobText.length > 0 && !dob && dobText.length === 10 && (
            <Text style={styles.errorText}>Please enter a valid date (you must be 18+)</Text>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            !isFormValid && styles.buttonDisabled,
            pressed && isFormValid && styles.buttonPressed,
          ]}
          onPress={handleContinue}
          disabled={!isFormValid}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 80,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  step: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 'auto',
  },
  buttonDisabled: {
    backgroundColor: Colors.locked,
  },
  buttonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  buttonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
});
