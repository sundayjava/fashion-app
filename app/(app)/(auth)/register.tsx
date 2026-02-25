import { EmailPhone } from '@/components/screens/auth';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function Register() {
    const { method } = useLocalSearchParams<{ method: 'email' | 'phone' }>();

  return <EmailPhone method={method} />;
}