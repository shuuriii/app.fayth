import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[push] Must use physical device for push notifications');
    return null;
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('checkin', {
      name: 'Daily Check-ins',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[push] Permission not granted');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: tokenData } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenData ?? null;
}

/**
 * Registers for Expo push notifications and saves the token to `patients.expo_push_token`.
 * Call once after auth is confirmed and patient record exists.
 */
export function usePushToken(userId: string | undefined) {
  const registered = useRef(false);

  // Configure how notifications appear when the app is foregrounded
  // (moved from module scope to avoid crash if native module isn't ready)
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  useEffect(() => {
    if (!userId || registered.current) return;

    registerForPushNotifications().then(async (token) => {
      if (!token) return;

      registered.current = true;

      // Upsert the token — only write if it changed
      const { error } = await supabase
        .from('patients')
        .update({ expo_push_token: token })
        .eq('user_id', userId);

      if (error) {
        console.warn('[push] Failed to save token:', error.message);
      }
    });
  }, [userId]);
}
