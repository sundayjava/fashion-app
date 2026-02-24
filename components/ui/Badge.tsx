import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Typography } from './Typography';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: Palette.primary + '22', text: Palette.primary },
  accent: { bg: Palette.accent + '22', text: Palette.accentDark },
  success: { bg: Palette.successLight, text: Palette.success },
  warning: { bg: Palette.warningLight, text: Palette.warning },
  error: { bg: Palette.errorLight, text: Palette.error },
  neutral: { bg: Palette.lightGray, text: Palette.darkGray },
};

export function Badge({ label, variant = 'primary', size = 'md', style }: BadgeProps) {
  const { bg, text } = variantColors[variant];

  return (
    <View
      style={[
        styles.container,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: bg },
        style,
      ]}
    >
      <Typography
        variant={size === 'sm' ? 'overline' : 'label'}
        color={text}
        style={size === 'sm' ? styles.smText : undefined}
      >
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
  },
  sm: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
  },
  md: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
  },
  smText: {
    fontSize: 10,
  },
});
