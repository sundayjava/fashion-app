/**
 * Fashionistar Design System — Theme
 * Re-exports the full token set and provides navigation theme objects.
 */

import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { ThemeColors, Palette } from './colors';

export { ThemeColors, Palette };
export type { AppThemeColors, ColorScheme } from './colors';
export { FontFamily, FontSize, LineHeight, LetterSpacing, FontWeight, TextVariants } from './typography';
export type { TextVariant } from './typography';
export { Spacing, BorderRadius, Shadow } from './spacing';
export type { SpacingKey, BorderRadiusKey } from './spacing';

// Backward-compat "Colors" export consumed by existing tab layout
export const Colors = ThemeColors;

/** React Navigation theme wrappers */
export const NavigationLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.primary,
    background: ThemeColors.light.background,
    card: ThemeColors.light.surface,
    text: ThemeColors.light.text,
    border: ThemeColors.light.border,
    notification: Palette.accent,
  },
};

export const NavigationDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Palette.primaryLight,
    background: ThemeColors.dark.background,
    card: ThemeColors.dark.surface,
    text: ThemeColors.dark.text,
    border: ThemeColors.dark.border,
    notification: Palette.accent,
  },
};
