import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'fashionistar-theme',
      storage: createJSONStorage(() => AsyncStorage),
      // Always start with system theme on a fresh install.
      // If the user has never explicitly chosen a theme, keep 'system'.
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ThemeState>),
        // If no preference was persisted yet, stay on 'system'
        preference: (persisted as Partial<ThemeState>)?.preference ?? 'system',
      }),
    }
  )
);
