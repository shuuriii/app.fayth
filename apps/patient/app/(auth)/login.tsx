import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/^0+/, '')}`;

  const isValid = phone.replace(/\D/g, '').replace(/^91/, '').length === 10;

  const isProvider = role === 'provider';

  async function handleSendOtp() {
    if (!isValid) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      router.push({
        pathname: '/(auth)/verify',
        params: { phone: formattedPhone, role: role ?? 'patient' },
      });
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>fayth</Text>
          <Text style={styles.tagline}>
            {isProvider ? 'Sign in as a healthcare provider' : 'Your companion for managing ADHD'}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter your mobile number"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone.replace(/^(\+?91)/, '')}
              onChangeText={(text) => setPhone(text.replace(/\D/g, ''))}
              autoFocus
              accessibilityLabel="Mobile number"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              !isValid && styles.buttonDisabled,
              pressed && isValid && styles.buttonPressed,
            ]}
            onPress={handleSendOtp}
            disabled={!isValid || loading}
            accessibilityRole="button"
            accessibilityLabel="Send OTP"
          >
            {loading ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </Pressable>

          <Text style={styles.disclaimer}>
            We will send a one-time verification code to your mobile number.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  prefix: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRightWidth: 0,
    borderTopLeftRadius: Radii.md,
    borderBottomLeftRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopRightRadius: Radii.md,
    borderBottomRightRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.lg,
    color: Colors.text,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
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
  disclaimer: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 20,
  },
});
