import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Colors, FontSizes } from '@/lib/constants';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: focused ? '||' : '||',
    Log: focused ? '+' : '+',
    Modules: focused ? '[]' : '[]',
    Profile: focused ? '@' : '@',
  };

  return (
    <Text
      style={[
        styles.icon,
        { color: focused ? Colors.primary : Colors.textTertiary },
      ]}
    >
      {icons[label] ?? '?'}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarIcon: ({ focused }) => <TabIcon label="Log" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          title: 'Modules',
          tabBarIcon: ({ focused }) => <TabIcon label="Modules" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.borderLight,
    borderTopWidth: 1,
    paddingTop: 6,
    height: 80,
  },
  tabLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  icon: {
    fontSize: 22,
    fontWeight: '700',
  },
});
