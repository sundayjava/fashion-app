import { AppThemeColors, ColorScheme, ThemeColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemePreference, useThemeStore } from '@/stores/themeStore';
import React, { createContext, useContext, useMemo } from 'react';
import { Appearance } from 'react-native';

interface ThemeContextValue {
  colors: AppThemeColors;
  scheme: ColorScheme;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: ThemeColors.light,
  scheme: 'light',
  isDark: false,
  preference: 'system',
  setPreference: () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const { preference, setPreference } = useThemeStore();

  // Derive scheme inline (no memo) so any state change immediately produces
  // the correct value — memoization was masking stale reads on Android.
  const resolvedSystem: ColorScheme =
    (systemScheme ?? Appearance.getColorScheme()) === 'dark' ? 'dark' : 'light';
  const scheme: ColorScheme = preference === 'system' ? resolvedSystem : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: ThemeColors[scheme],
      scheme,
      isDark: scheme === 'dark',
      preference,
      setPreference,
    }),
    [scheme, preference, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
