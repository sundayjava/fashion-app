import { OnboardingTwo } from '@/components/screens/onboarding_screens';
import { useAppTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ONBOARDING_KEY } from '../../index';

export default function AuthStack() {
    const { isDark } = useAppTheme();
    const insets = useSafeAreaInsets();

    const finishOnboarding = async (method: 'email' | 'phone' = 'email') => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        router.push({ pathname: '/register', params: { method } });
    };

    return <OnboardingTwo isDark={isDark} insets={insets} onFinish={finishOnboarding} skip={() => router.replace({ pathname: '/(app)/(tabs)' })} />
}