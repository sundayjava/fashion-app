import { Badge, Divider, GlassCard, Typography } from '@/components/ui';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOKEN_GROUPS = [
  {
    title: 'Brand Colors',
    items: [
      { name: 'primary', value: Palette.primary },
      { name: 'primaryLight', value: Palette.primaryLight },
      { name: 'primaryDark', value: Palette.primaryDark },
      { name: 'accent', value: Palette.accent },
      { name: 'accentLight', value: Palette.accentLight },
      { name: 'accentDark', value: Palette.accentDark },
    ],
  },
  {
    title: 'Status Colors',
    items: [
      { name: 'success', value: Palette.success },
      { name: 'warning', value: Palette.warning },
      { name: 'error', value: Palette.error },
      { name: 'info', value: Palette.info },
    ],
  },
];

const PACKAGES = [
  { name: '@gorhom/bottom-sheet', desc: 'Feature-rich bottom sheet' },
  { name: 'react-native-toast-message', desc: 'Custom toast notifications' },
  { name: 'expo-blur', desc: 'Glassmorphism blur' },
  { name: '@expo-google-fonts/reddit-sans', desc: 'Reddit Sans typeface' },
  { name: 'react-native-reanimated', desc: 'High-perf animations' },
  { name: 'react-native-gesture-handler', desc: 'Native gesture system' },
  { name: 'expo-router', desc: 'File-based navigation' },
];

export default function ExploreScreen() {
  const { colors } = useAppTheme();
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
        Design Tokens
      </Typography>
      <Typography variant="h2" style={{ marginBottom: Spacing.lg }}>
        Explore
      </Typography>

      {TOKEN_GROUPS.map((group) => (
        <View key={group.title} style={{ marginBottom: Spacing.lg }}>
          <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
            {group.title}
          </Typography>
          <GlassCard>
            {group.items.map((item, i) => (
              <View key={item.name}>
                {i > 0 && <Divider />}
                <View style={styles.tokenRow}>
                  <View style={[styles.swatch, { backgroundColor: item.value }]} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium">{item.name}</Typography>
                    <Typography variant="caption" color={colors.textTertiary}>
                      {item.value}
                    </Typography>
                  </View>
                </View>
              </View>
            ))}
          </GlassCard>
        </View>
      ))}

      <Divider label="stack" style={{ marginBottom: Spacing.lg }} />

      <Typography variant="h4" style={{ marginBottom: Spacing.md }}>
        Third-party Packages
      </Typography>
      <GlassCard>
        {PACKAGES.map((pkg, i) => (
          <View key={pkg.name}>
            {i > 0 && <Divider />}
            <View style={styles.pkgRow}>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium">{pkg.name}</Typography>
                <Typography variant="caption" color={colors.textTertiary}>
                  {pkg.desc}
                </Typography>
              </View>
              <Badge label="installed" variant="success" size="sm" />
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
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  pkgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
});