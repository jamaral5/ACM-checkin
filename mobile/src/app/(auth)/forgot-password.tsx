import { useSignIn } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';

import { CodeStep } from '@/components/auth/code-step';
import { Button } from '@/components/button';
import { FooterText, FormError, FormScreen, PasswordField, TextField, TextLink } from '@/components/form';
import { clerkErrorMessage } from '@/lib/clerk-errors';

/**
 * Reset a forgotten password: email → 6-digit code → new password. Also how
 * a Google-only account sets a password. Signs the user in when done.
 */
export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn();
  const [step, setStep] = useState<'email' | 'reset'>('email');
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

  const sendCode = () =>
    run(async () => {
      const created = await signIn.create({ identifier: email.trim() });
      if (created.error) return clerkErrorMessage(created.error);

      const sent = await signIn.resetPasswordEmailCode.sendCode();
      if (sent.error) return clerkErrorMessage(sent.error);

      setStep('reset');
      return null;
    });

  const resetPassword = (code: string) =>
    run(async () => {
      // If the code was already accepted and only the password was rejected
      // (e.g. too short), don't verify the same code twice.
      if (signIn.status !== 'needs_new_password') {
        const verified = await signIn.resetPasswordEmailCode.verifyCode({ code });
        if (verified.error) return clerkErrorMessage(verified.error);
      }

      const submitted = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (submitted.error) return clerkErrorMessage(submitted.error);

      if (signIn.status !== 'complete') {
        return `Password reset needs another step this app doesn't support yet (${signIn.status}).`;
      }
      // Signed in with the new password; the root navigator takes over.
      const finalized = await signIn.finalize();
      return finalized.error ? clerkErrorMessage(finalized.error) : null;
    });

  return (
    <FormScreen
      title="Reset your password"
      subtitle={
        step === 'email'
          ? "Enter your account's email and we'll send you a code."
          : 'Enter the code and choose a new password.'
      }
      footer={
        <FooterText>
          Remembered it? <TextLink label="Back to sign in" onPress={() => router.replace('/sign-in')} />
        </FooterText>
      }>
      {step === 'email' ? (
        <>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@ufl.edu"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={sendCode}
          />
          <FormError message={error} />
          <Button label="Email me a code" loading={loading} disabled={!email.trim()} onPress={sendCode} />
        </>
      ) : (
        <CodeStep
          email={email.trim()}
          submitLabel="Reset password"
          canSubmit={password.length > 0}
          loading={loading}
          error={error}
          onSubmit={resetPassword}
          onResend={sendCode}
          onBack={() => {
            setError(null);
            setStep('email');
            void signIn.reset();
          }}>
          <PasswordField label="New password" isNew value={password} onChangeText={setPassword} />
        </CodeStep>
      )}
    </FormScreen>
  );
}
