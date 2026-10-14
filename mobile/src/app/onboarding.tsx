import { useAuth, useClerk, useUser } from '@clerk/expo';
import { useState } from 'react';

import { Button } from '@/components/button';
import { FooterText, FormError, FormScreen, TextField, TextLink } from '@/components/form';
import { env } from '@/lib/env';
import { submitOnboardingProfile, validateOnboarding } from '@/lib/onboarding';
import { useProfileStatus } from '@/lib/profile-status';

/**
 * Shown to signed-in users with no attendees row (see the root layout).
 * Same fields and rules as web's /onboarding.
 */
export default function OnboardingScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { markComplete, refresh } = useProfileStatus();

  // Google sign-ups already have a name in Clerk -- start from it.
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [gradYear, setGradYear] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const input = { firstName, lastName, gradYear };
    const invalid = validateOnboarding(input);
    if (invalid) {
      setError(invalid);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await submitOnboardingProfile(input, () => getToken(), {
        supabaseUrl: env.supabaseUrl,
        supabaseAnonKey: env.supabaseAnonKey,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (result.saved) {
        // The edge function wrote the attendees row and updated the Clerk
        // name server-side. Pull the new name, then re-run the gate: it now
        // finds the row and the root navigator moves to the tabs.
        await user?.reload().catch(() => undefined);
        refresh();
        return;
      }

      // Edge function not deployed yet (stub mode): set the name in Clerk
      // ourselves and let the user through for this app session.
      await user
        ?.update({ firstName: firstName.trim(), lastName: lastName.trim() })
        .catch((err) => console.warn('Could not update Clerk name', err));
      markComplete();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormScreen
      title="Finish your profile"
      subtitle="Officers see this name on attendance lists."
      footer={
        <FooterText>
          Wrong account? <TextLink label="Sign out" onPress={() => void signOut()} />
        </FooterText>
      }>
      <TextField
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Maya"
        autoComplete="given-name"
        textContentType="givenName"
      />
      <TextField
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        placeholder="Rivera"
        autoComplete="family-name"
        textContentType="familyName"
      />
      <TextField
        label="Graduation year"
        value={gradYear}
        onChangeText={setGradYear}
        placeholder="2027"
        keyboardType="number-pad"
        maxLength={4}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      <FormError message={error} />
      <Button label="Continue" onPress={onSubmit} loading={loading} />
    </FormScreen>
  );
}
