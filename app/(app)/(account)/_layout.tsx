import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="change-phone" />
      <Stack.Screen name="change-email" />
      <Stack.Screen name="delete-account" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
