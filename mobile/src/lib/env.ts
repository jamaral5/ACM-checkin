/**
 * Public config baked into the app at bundle time from mobile/.env.local.
 * Every EXPO_PUBLIC_* value ships inside the app, so only public keys belong here.
 */
export const env = {
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};
