import { Stack } from 'expo-router';

export default function NoteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
      <Stack.Screen name="add-note" />
      <Stack.Screen name="note" />
    </Stack>
  );
}
