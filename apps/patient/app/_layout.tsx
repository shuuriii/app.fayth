import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Colors } from '@/lib/constants';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen
            name="module/[id]"
            options={{
              headerShown: true,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="worksheet/[id]"
            options={{
              headerShown: true,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="exercise/[id]"
            options={{
              headerShown: true,
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
