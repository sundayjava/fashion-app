import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts,
  RedditSans_400Regular,
  RedditSans_500Medium,
  RedditSans_600SemiBold,
  RedditSans_700Bold,
  RedditSans_400Regular_Italic,
  RedditSans_700Bold_Italic,
} from '@expo-google-fonts/reddit-sans';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { AppToastHost, buildToastConfig } from '@/components/ui/Toast';
import { NavigationDarkTheme, NavigationLightTheme } from '@/constants/theme';
import { initSentry } from '@/services/sentry';

// Initialise Sentry before any React render (module-level, runs once)
initSentry();

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { isDark } = useAppTheme();

  return (
    <ThemeProvider value={isDark ? NavigationDarkTheme : NavigationLightTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: '',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="form-demo"
          options={{
            presentation: 'card',
            title: 'Registration',
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Toast must be last child so it renders above everything */}
      <AppToastHost config={buildToastConfig(isDark)} />
    </ThemeProvider>
  );
}

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    RedditSans_400Regular,
    RedditSans_500Medium,
    RedditSans_600SemiBold,
    RedditSans_700Bold,
    RedditSans_400Regular_Italic,
    RedditSans_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <BottomSheetModalProvider>
            <RootNavigator />
          </BottomSheetModalProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

// Wrap with Sentry for native crash reporting + JS error boundaries
export default Sentry.wrap(RootLayout);
