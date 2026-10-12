import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { PlaceholderScreen } from '@/components/screen';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  if (!publishableKey) {
    return <MissingConfig />;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <StatusBar style="dark" />
      <RootNavigator />
    </ClerkProvider>
  );
}

/**
 * Signed-out users only ever see the (auth) stack; signed-in users only see
 * the (tabs). Flipping isSignedIn (sign-in / sign-out) moves the user across
 * automatically -- no manual redirects in screens.
 */
function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) SplashScreen.hideAsync();
  }, [isLoaded]);

  // Keep the splash up until Clerk has restored any saved session, so a
  // signed-in user never flashes the sign-in screen on launch.
  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

function MissingConfig() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <PlaceholderScreen
      title="Missing Clerk key"
      description="Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in mobile/.env.local (copy .env.example), then restart with `npx expo start -c`. See mobile/README.md."
    />
  );
}
