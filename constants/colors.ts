/**
 * Fashionistar Design System — Color Palette
 */

export const Palette = {
  // Brand
  primary: '#9056b9',       // Purple
  primaryLight: '#a97fcb',  // Lighter purple
  primaryDark: '#6b3e8f',   // Darker purple
  accent: '#e9992c',        // Amber/orange
  accentLight: '#f0b05a',   // Lighter amber
  accentDark: '#c07010',    // Darker amber

  // Neutrals — Light Mode
  white: '#FFFFFF',
  offWhite: '#F8F8F8',
  lightGray: '#E5E5E5',
  midGray: '#AEAEAE',
  darkGray: '#4A4A4A',
  black: '#000000',

  // Status
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Transparent / Glassmorphism
  glass: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  glassDark: 'rgba(0, 0, 0, 0.12)',
  glassDarkBorder: 'rgba(255, 255, 255, 0.08)',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export type ColorScheme = 'light' | 'dark';

export const ThemeColors: Record<ColorScheme, AppThemeColors> = {
  light: {
    background: Palette.white,
    surface: Palette.offWhite,
    surfaceElevated: Palette.white,
    text: Palette.black,
    textSecondary: Palette.darkGray,
    textTertiary: Palette.midGray,
    textInverse: Palette.white,
    border: Palette.lightGray,
    borderFocused: Palette.primary,
    icon: Palette.darkGray,
    tabIconDefault: Palette.midGray,
    tabIconSelected: Palette.primary,
    tint: Palette.primary,
    primary: Palette.primary,
    primaryLight: Palette.primaryLight,
    primaryDark: Palette.primaryDark,
    accent: Palette.accent,
    accentLight: Palette.accentLight,
    glass: Palette.glass,
    glassBorder: Palette.glassBorder,
    shadow: Palette.shadowColor,
    overlay: Palette.overlay,
    statusBar: 'dark' as const,
    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,
    info: Palette.info,
  },
  dark: {
    background: Palette.black,
    surface: '#111111',
    surfaceElevated: '#1A1A1A',
    text: Palette.white,
    textSecondary: '#CCCCCC',
    textTertiary: Palette.midGray,
    textInverse: Palette.black,
    border: '#2A2A2A',
    borderFocused: Palette.primaryLight,
    icon: '#CCCCCC',
    tabIconDefault: Palette.midGray,
    tabIconSelected: Palette.primaryLight,
    tint: Palette.primaryLight,
    primary: Palette.primary,
    primaryLight: Palette.primaryLight,
    primaryDark: Palette.primaryDark,
    accent: Palette.accent,
    accentLight: Palette.accentLight,
    glass: Palette.glassDark,
    glassBorder: Palette.glassDarkBorder,
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: Palette.overlay,
    statusBar: 'light' as const,
    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,
    info: Palette.info,
  },
};

export interface AppThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderFocused: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  tint: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  glass: string;
  glassBorder: string;
  shadow: string;
  overlay: string;
  statusBar: 'dark' | 'light';
  success: string;
  warning: string;
  error: string;
  info: string;
}
