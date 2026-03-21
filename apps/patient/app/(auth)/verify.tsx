import React, { useState, useRef } from 'react';
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

const OTP_LENGTH = 6;

export default function VerifyScreen() {
  const router = useRouter();
  const { phone, role } = useLocalSearchParams<{ phone: string; role?: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isValid = otp.length === OTP_LENGTH;

  async function handleVerify() {
    if (!isValid || !phone) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        Alert.alert('Verification Failed', error.message);
        return;
      }

      // Auth state change listener in useAuth will pick up the session.
      // Check if profile exists to decide routing.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Could not retrieve user after verification.');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        router.replace('/(tabs)/home');
      } else {
        router.replace({
          pathname: '/(onboarding)/name',
          params: { role: role ?? 'patient' },
        });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!phone) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong');
    } finally {
      setResending(false);
    }
  }

  // Render OTP boxes visually based on the single hidden input
  const otpDigits = otp.split('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneHighlight}>{phone}</Text>
          </Text>
        </View>

        <Pressable style={styles.otpContainer} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[styles.otpBox, i === otp.length && styles.otpBoxActive]}
            >
              <Text style={styles.otpDigit}>{otpDigits[i] ?? ''}</Text>
            </View>
          ))}
        </Pressable>

        {/* Hidden input to capture keyboard */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, OTP_LENGTH))}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            !isValid && styles.buttonDisabled,
            pressed && isValid && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={!isValid || loading}
          accessibilityRole="button"
          accessibilityLabel="Verify OTP"
        >
          {loading ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleResendOtp}
          disabled={resending}
          style={styles.resendButton}
          accessibilityRole="button"
        >
          <Text style={styles.resendText}>
            {resending ? 'Sending...' : "Didn't receive the code? Resend"}
          </Text>
        </Pressable>
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
    marginBottom: Spacing.xl,
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
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: Colors.text,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: Spacing.xl,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: Radii.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: Colors.primary,
  },
  otpDigit: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
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
  resendButton: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  resendText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
});
