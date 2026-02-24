import { AppSplash } from '@/components/screens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export const ONBOARDING_KEY = 'fashionistar_onboarded';

type AppState = 'splash' | 'onboarding' | 'auth' | 'app';

export default function Index() {
  const [state, setState] = useState<AppState>('splash');

  useEffect(() => {
    const bootstrap = async () => {
      // Show splash for min 2.5s AND do async checks in parallel
      const [onboarded] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        new Promise<void>((resolve) => setTimeout(resolve, 2500)),
      ]);

      if (!onboarded) {
        setState('onboarding');
        return;
      }

      // TODO: check auth token here → setState('app') if valid
      setState('auth');
    };

    bootstrap();
  }, []);

  if (state === 'splash') return <AppSplash />;
  if (state === 'onboarding') return <Redirect href="/(onboarding)" />;
  if (state === 'auth') return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(app)/(tabs)" />;
}
