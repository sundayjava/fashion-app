import { Stack } from 'expo-router';

export default function NotificationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
      <Stack.Screen name="search" />
      <Stack.Screen name="notification" />
    </Stack>
  );
}
