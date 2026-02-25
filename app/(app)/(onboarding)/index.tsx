import { OnboardingOne } from '@/components/screens/onboarding_screens';
import { Typography } from '@/components/ui';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';

import { router } from 'expo-router';
import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Root screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const fadeOpacity = useSharedValue(1);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fadeOpacity.value }));

  const finishOnboarding = async () => {
    router.replace({ pathname: '/auth-stack' });
  };

  return (
    <ImageBackground
      source={
        isDark
          ? require('@/assets/locals/bg/dark-bg.webp')
          : require('@/assets/locals/bg/light-bg.webp')
      }
      style={styles.root}
      resizeMode="cover"
    >

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View />
        <Pressable onPress={() => router.replace({ pathname: '/(app)/(tabs)' })} hitSlop={16}>
          <Typography color={Palette.primary} weight='bold'>Skip</Typography>
        </Pressable>
      </View>

      <Animated.View style={[styles.content, fadeStyle]}>
        <OnboardingOne insets={insets} onReady={() => finishOnboarding()} />

      </Animated.View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  content: { flex: 1 },
  stepLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  hidden: {
    display: 'none',
  },
});
