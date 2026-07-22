import '@/global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="loading" />
        <Stack.Screen name="language" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="profile-select" options={{ presentation: 'modal' }} />
        <Stack.Screen name="trophy-road" />
        <Stack.Screen name="themes" />
        <Stack.Screen name="math-subcategories" />
        <Stack.Screen name="subject-topics" />
        <Stack.Screen name="theory" />
        <Stack.Screen name="characters" />
        <Stack.Screen name="character-detail" />
        <Stack.Screen name="shop" />
        <Stack.Screen name="battle" />
        <Stack.Screen name="coop" />
        <Stack.Screen name="ielts-speaking" />
        <Stack.Screen name="ielts-writing" />
      </Stack>
    </>
  );
}
