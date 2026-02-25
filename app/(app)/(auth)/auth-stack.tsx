import { OnboardingTwo } from '@/components/screens/onboarding_screens';
import { useAppTheme } from '@/context/ThemeContext';
import { useRegistrationStore } from '@/stores/registrationStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ONBOARDING_KEY } from '../../index';

export default function AuthStack() {
    const { isDark } = useAppTheme();
    const insets = useSafeAreaInsets();
    const setRegistrationMethod = useRegistrationStore((state) => state.setRegistrationMethod);
    const reset = useRegistrationStore((state) => state.reset);

    const finishOnboarding = async (method: 'email' | 'phone' = 'email') => {
        reset()
        setRegistrationMethod(method);
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        router.push('/register');
    };

    return <OnboardingTwo isDark={isDark} insets={insets} login={() => router.push("/login")} onFinish={finishOnboarding} skip={() => router.replace({ pathname: '/(app)/(tabs)' })} />
}