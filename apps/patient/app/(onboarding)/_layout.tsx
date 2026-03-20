import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '@/lib/constants';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    />
  );
}
