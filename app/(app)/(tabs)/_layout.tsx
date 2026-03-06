import { AddShapeCircleIcon } from '@/assets/icons/AddShapedCircleIcon';
import { HomeIcon } from '@/assets/icons/HomeIcon';
import { NotesIcon } from '@/assets/icons/NotesIcon';
import { PersonAccountIcon } from '@/assets/icons/PersonAccountIcon';
import { SettingIcon } from '@/assets/icons/SettingsIcon';
import { GlassTabBar } from '@/components/ui/GlassTabBar';
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

  //Android
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} width={size} height={size}/>,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => <PersonAccountIcon color={color} width={26} height={26}/>,
        }}
      />
      <Tabs.Screen
        name="add-post"
        options={{
          title: '',
          tabBarIcon: () => <AddShapeCircleIcon color={colors.text} width={42} height={42}/>,
          href: '/(app)/(post)/add-post',
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => <NotesIcon color={color} width={size} height={size}/>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingIcon color={color} width={size} height={size}/>,
        }}
      />
    </Tabs>
  );
}
