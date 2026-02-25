import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
      <Stack.Screen name="auth-stack" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="password" />
      <Stack.Screen name="basic-profile" />
      <Stack.Screen name="business-details" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}
