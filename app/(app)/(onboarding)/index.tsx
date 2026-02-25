import { OnboardingOne, OnboardingTwo } from '@/components/screens/onboarding_screens';
import { BackButton, Typography } from '@/components/ui';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ONBOARDING_KEY } from '../../index';

// ─── Root screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<0 | 1>(0);
  const fadeOpacity = useSharedValue(1);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fadeOpacity.value }));

  const finishOnboarding = async (method: 'email' | 'phone' = 'email') => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace({ pathname: '/(app)/(auth)/login', params: { method } });
  };

  const transition = (to: 0 | 1) => {
    const ease = Easing.inOut(Easing.quad);
    fadeOpacity.value = withTiming(0, { duration: 200, easing: ease }, (finished) => {
      if (finished) {
        runOnJS(setStep)(to);
        fadeOpacity.value = withTiming(1, { duration: 280, easing: ease });
      }
    });
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
        <BackButton onPress={step === 1 ? () => transition(0) : undefined} />

        <Pressable onPress={() => finishOnboarding('email')} hitSlop={16}>
          <Typography color={Palette.primary} weight='bold'>Skip</Typography>
        </Pressable>
      </View>

      {/* Animated step content */}
      <Animated.View style={[styles.content, fadeStyle]}>
        {step === 0 ? (
          <OnboardingOne insets={insets} onReady={() => transition(1)} />
          // <Step1 isDark={isDark} insets={insets} onReady={() => transition(1)} />
        ) : (
          <OnboardingTwo isDark={isDark} insets={insets} onFinish={finishOnboarding} />
        )}
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
});
