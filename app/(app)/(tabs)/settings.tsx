import { Avatar, Divider, GlassCard, showToast, Typography } from '@/components/ui';
import { Palette } from '@/constants/colors';
import { appName } from '@/constants/settings';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemePreference } from '@/stores/themeStore';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_OPTIONS: { label: string; value: ThemePreference; icon: string; desc: string }[] = [
  { label: 'System', value: 'system', icon: '⚙️', desc: 'Follows your device setting' },
  { label: 'Light', value: 'light', icon: '☀️', desc: 'Always light mode' },
  { label: 'Dark', value: 'dark', icon: '🌙', desc: 'Always dark mode' },
];

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Typography variant="overline" color={colors.textTertiary}>
        Account
      </Typography>
      <Typography variant="h2" style={{ marginBottom: Spacing.lg }}>
        Settings
      </Typography>

      {/* Profile card */}
      <GlassCard style={{ marginBottom: Spacing.lg }}>
        <View style={styles.profileRow}>
          <Avatar initials="FI" size="lg" />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Typography variant="title">{appName} User</Typography>
            <Typography variant="caption" color={colors.textSecondary}>
              user@fashionistar.com
            </Typography>
          </View>
        </View>
      </GlassCard>

      {/* Appearance */}
      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        Appearance
      </Typography>
      <GlassCard style={{ marginBottom: Spacing.lg }}>
        {THEME_OPTIONS.map((opt, i) => {
          const active = preference === opt.value;
          return (
            <View key={opt.value}>
              {i > 0 && <Divider />}
              <Pressable
                onPress={() => {
                  setPreference(opt.value);
                  showToast({
                    type: 'success',
                    text1: `Theme: ${opt.label}`,
                    text2: opt.desc,
                  });
                }}
                style={({ pressed }) => [
                  styles.themeRow,
                  pressed && { opacity: 0.75 },
                  active && { backgroundColor: colors.primary + '10' },
                ]}
              >
                <View style={[styles.optIcon, { backgroundColor: colors.surface }]}>
                  <Typography variant="body" style={{ fontSize: 20 }}>
                    {opt.icon}
                  </Typography>
                </View>
                <View style={{ flex: 1 }}>
                  <Typography
                    variant="bodyMedium"
                    weight={active ? 'semiBold' : 'regular'}
                    color={active ? colors.primary : colors.text}
                  >
                    {opt.label}
                  </Typography>
                  <Typography variant="caption" color={colors.textTertiary}>
                    {opt.desc}
                  </Typography>
                </View>
                {/* Radio indicator */}
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {active && (
                    <View style={[styles.radioDot, { backgroundColor: Palette.white }]} />
                  )}
                </View>
              </Pressable>
            </View>
          );
        })}
      </GlassCard>

      {/* Brand */}
      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        Brand Colors
      </Typography>
      <GlassCard style={{ marginBottom: Spacing.lg }}>
        <View style={styles.swatchRow}>
          {[
            { label: 'Primary', color: Palette.primary },
            { label: 'Accent', color: Palette.accent },
            { label: 'Success', color: Palette.success },
            { label: 'Error', color: Palette.error },
          ].map((item) => (
            <View key={item.label} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: item.color }]} />
              <Typography variant="overline" color={colors.textSecondary}>
                {item.label}
              </Typography>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* About */}
      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        About
      </Typography>
      <GlassCard>
        {[
          { label: 'Version', value: '1.0.0' },
          { label: 'Framework', value: 'Expo SDK 54' },
          { label: 'Navigation', value: 'expo-router v6' },
          { label: 'State', value: 'Zustand' },
          { label: 'Fonts', value: 'Reddit Sans' },
        ].map((item, i) => (
          <View key={item.label}>
            {i > 0 && <Divider />}
            <View style={styles.aboutRow}>
              <Typography variant="bodyMedium">{item.label}</Typography>
              <Typography variant="body" color={colors.textSecondary}>
                {item.value}
              </Typography>
            </View>
          </View>
        ))}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
  },
  optIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  swatchItem: {
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
