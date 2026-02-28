import { GlassTabBar } from '@/components/ui/GlassTabBar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/ThemeContext';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { colors, isDark } = useAppTheme();

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs
        blurEffect="systemMaterial"
        tintColor={isDark ? colors.primaryLight : colors.primary}
        iconColor={{
          default: colors.tabIconDefault,
          selected: isDark ? colors.primaryLight : colors.primary,
        }}
        labelStyle={{
          default: { color: colors.tabIconDefault },
          selected: { color: isDark ? colors.primaryLight : colors.primary },
        }}
      >
        <NativeTabs.Trigger name="index" options={{ title: 'Home', icon: { sf: 'house.fill' } }} />
        <NativeTabs.Trigger name="portfolio" options={{ title: 'Portfolio', icon: { sf: 'person' } }} />
        <NativeTabs.Trigger name="add-post" options={{ title: 'Add Post', icon: { sf: 'plus' } }} />
        <NativeTabs.Trigger name="notes" options={{ title: 'Notes', icon: { sf: 'note' } }} />
        <NativeTabs.Trigger name="settings" options={{ title: 'Settings', icon: { sf: 'gearshape.fill' } }} />
      </NativeTabs>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <IconSymbol size={size} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color, size }) => <IconSymbol size={size} name="person" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-post"
        options={{
          title: 'Add Post',
          tabBarIcon: ({ color, size }) => <IconSymbol size={size} name="plus" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => <IconSymbol size={size} name="note" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <IconSymbol size={size} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
