import { useSignUp } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';

import { EmailCodeForm } from '@/components/auth/email-code-form';
import { GoogleButton } from '@/components/auth/google-button';
import { Divider, FooterText, FormScreen, TextLink } from '@/components/form';
import { clerkErrorMessage } from '@/lib/clerk-errors';

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const [error, setError] = useState<string | null>(null);

  async function sendCode(email: string) {
    const created = await signUp.create({ emailAddress: email });
    if (created.error) return { error: clerkErrorMessage(created.error) };

    const sent = await signUp.verifications.sendEmailCode();
    return { error: sent.error ? clerkErrorMessage(sent.error) : null };
  }

  async function verify(code: string) {
    const verified = await signUp.verifications.verifyEmailCode({ code });
    if (verified.error) return { error: clerkErrorMessage(verified.error) };

    if (signUp.status !== 'complete') {
      // Name, grad year etc. are collected on our onboarding screen, not by
      // Clerk -- so anything still missing here is a Clerk dashboard setting.
      const missing = signUp.missingFields.join(', ') || signUp.status;
      return { error: `Clerk still needs: ${missing}. Check the Clerk app's sign-up settings.` };
    }

    // Activating the session flips the root navigator to onboarding.
    const finalized = await signUp.finalize();
    return { error: finalized.error ? clerkErrorMessage(finalized.error) : null };
  }

  return (
    <FormScreen
      title="Create an account"
      subtitle="Check in to your clubs' meetings and track your attendance."
      footer={
        <FooterText>
          Already have an account? <TextLink label="Sign in" onPress={() => router.replace('/sign-in')} />
        </FooterText>
      }>
      <GoogleButton onError={setError} />
      <Divider />
      <EmailCodeForm
        submitLabel="Email me a code"
        onSendCode={sendCode}
        onVerify={verify}
        onStartOver={() => void signUp.reset()}
        error={error}
        setError={setError}
      />
    </FormScreen>
  );
}
