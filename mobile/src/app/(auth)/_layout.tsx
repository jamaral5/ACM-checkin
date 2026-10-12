import { Stack } from 'expo-router';

/** Signed-out stack: sign-in now, sign-up and onboarding arrive with ADTCIA-27. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
