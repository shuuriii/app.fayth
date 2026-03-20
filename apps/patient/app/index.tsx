import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Colors, FontSizes } from '@/lib/constants';

export default function IndexScreen() {
  const { session, user, loading: authLoading } = useAuth();
  const [profileCheck, setProfileCheck] = useState<'loading' | 'has_profile' | 'no_profile'>(
    'loading'
  );

  useEffect(() => {
    if (!user) {
      setProfileCheck('loading');
      return;
    }

    let cancelled = false;

    async function checkProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setProfileCheck('no_profile');
      } else {
        setProfileCheck('has_profile');
      }
    }

    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Still loading auth state
  if (authLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>fayth</Text>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      </View>
    );
  }

  // No session - go to login
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Checking profile
  if (profileCheck === 'loading') {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>fayth</Text>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      </View>
    );
  }

  // No profile - go to onboarding
  if (profileCheck === 'no_profile') {
    return <Redirect href="/(onboarding)/name" />;
  }

  // Has profile - go to home
  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -1,
  },
  spinner: {
    marginTop: 24,
  },
});
