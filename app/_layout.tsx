import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@react-navigation/native';
import {
  useFonts,
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

initSentry();

// Hold the native splash until fonts are ready
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isDark } = useAppTheme();

  return (
    <ThemeProvider value={isDark ? NavigationDarkTheme : NavigationLightTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        {/* Entry point — decides splash / onboarding / auth / app */}
        <Stack.Screen name="index" />

        {/* Route groups */}
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />

        {/* Global overlays */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="form-demo" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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
      // Native splash done — our in-app splash in index.tsx takes over
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

export default Sentry.wrap(RootLayout);
