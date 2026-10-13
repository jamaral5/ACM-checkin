import { useSignIn } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';

import { EmailCodeForm } from '@/components/auth/email-code-form';
import { GoogleButton } from '@/components/auth/google-button';
import { Divider, FooterText, FormScreen, TextLink } from '@/components/form';
import { clerkErrorMessage } from '@/lib/clerk-errors';

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const [error, setError] = useState<string | null>(null);

  async function sendCode(email: string) {
    const created = await signIn.create({ identifier: email });
    if (created.error) return { error: clerkErrorMessage(created.error) };

    const sent = await signIn.emailCode.sendCode();
    return { error: sent.error ? clerkErrorMessage(sent.error) : null };
  }

  async function verify(code: string) {
    const verified = await signIn.emailCode.verifyCode({ code });
    if (verified.error) return { error: clerkErrorMessage(verified.error) };

    if (signIn.status !== 'complete') {
      // Second factors / device trust aren't enabled for this app's Clerk instance.
      return { error: `Sign-in needs another step this app doesn't support yet (${signIn.status}).` };
    }

    // Activating the session flips the root navigator to onboarding or tabs.
    const finalized = await signIn.finalize();
    return { error: finalized.error ? clerkErrorMessage(finalized.error) : null };
  }

  return (
    <FormScreen
      title="Sign in"
      subtitle="Welcome back. Use the same account as the website."
      footer={
        <FooterText>
          New here? <TextLink label="Create an account" onPress={() => router.replace('/sign-up')} />
        </FooterText>
      }>
      <GoogleButton onError={setError} />
      <Divider />
      <EmailCodeForm
        submitLabel="Email me a code"
        onSendCode={sendCode}
        onVerify={verify}
        onStartOver={() => void signIn.reset()}
        error={error}
        setError={setError}
      />
    </FormScreen>
  );
}
