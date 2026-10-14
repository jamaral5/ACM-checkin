import { useSignUp } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';

import { CodeStep } from '@/components/auth/code-step';
import { GoogleButton } from '@/components/auth/google-button';
import { Button } from '@/components/button';
import {
  Divider,
  FooterText,
  FormError,
  FormScreen,
  PasswordField,
  TextField,
  TextLink,
} from '@/components/form';
import { clerkErrorMessage } from '@/lib/clerk-errors';

/**
 * Create account: email + password (password is required in Clerk, same as
 * web), then a 6-digit code to verify the email. Or Continue with Google.
 * Password rules (minimum length, breached-password check) come from the
 * Clerk dashboard; Clerk's error message names the rule that failed.
 */
export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(action: () => Promise<string | null>) {
    setError(null);
    setLoading(true);
    try {
      setError(await action());
    } finally {
      setLoading(false);
    }
  }

  const createAccount = () =>
    run(async () => {
      const created = await signUp.password({ emailAddress: email.trim(), password });
      if (created.error) return clerkErrorMessage(created.error);

      const sent = await signUp.verifications.sendEmailCode();
      if (sent.error) return clerkErrorMessage(sent.error);

      setStep('code');
      return null;
    });

  const verify = (code: string) =>
    run(async () => {
      const verified = await signUp.verifications.verifyEmailCode({ code });
      if (verified.error) return clerkErrorMessage(verified.error);

      if (signUp.status !== 'complete') {
        const missing = signUp.missingFields.join(', ') || signUp.status;
        return `Clerk still needs: ${missing}. Check the Clerk app's sign-up settings.`;
      }

      // Activating the session flips the root navigator to onboarding.
      const finalized = await signUp.finalize();
      return finalized.error ? clerkErrorMessage(finalized.error) : null;
    });

  const resend = () =>
    run(async () => {
      const sent = await signUp.verifications.sendEmailCode();
      return sent.error ? clerkErrorMessage(sent.error) : null;
    });

  return (
    <FormScreen
      title="Create an account"
      subtitle="Check in to your clubs' meetings and track your attendance."
      footer={
        <FooterText>
          Already have an account? <TextLink label="Sign in" onPress={() => router.replace('/sign-in')} />
        </FooterText>
      }>
      {step === 'details' ? (
        <>
          <GoogleButton onError={setError} />
          <Divider />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@ufl.edu"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <PasswordField
            isNew
            value={password}
            onChangeText={setPassword}
            returnKeyType="go"
            onSubmitEditing={createAccount}
          />
          <FormError message={error} />
          <Button
            label="Create account"
            loading={loading}
            disabled={!email.trim() || !password}
            onPress={createAccount}
          />
        </>
      ) : (
        <CodeStep
          email={email.trim()}
          loading={loading}
          error={error}
          onSubmit={verify}
          onResend={resend}
          onBack={() => {
            setError(null);
            setStep('details');
            void signUp.reset();
          }}
        />
      )}
    </FormScreen>
  );
}
