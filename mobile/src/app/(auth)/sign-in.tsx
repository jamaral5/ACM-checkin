import { useSignIn } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';

import { EmailCodeForm } from '@/components/auth/email-code-form';
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
 * Sign in with email + password (like web), Continue with Google, or an
 * emailed code. The code option stays because accounts created with Google
 * have no password, and Clerk still allows email codes for sign-in.
 */
export default function SignInScreen() {
  const { signIn } = useSignIn();
  const [mode, setMode] = useState<'password' | 'code'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Finish a sign-in whose first factor just succeeded. */
  async function complete(): Promise<string | null> {
    if (signIn.status !== 'complete') {
      // Second factors / device trust aren't enabled for this app's Clerk instance.
      return `Sign-in needs another step this app doesn't support yet (${signIn.status}).`;
    }
    // Activating the session flips the root navigator to onboarding or tabs.
    const finalized = await signIn.finalize();
    return finalized.error ? clerkErrorMessage(finalized.error) : null;
  }

  async function signInWithPassword() {
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.password({ emailAddress: email.trim(), password });
      setError(result.error ? clerkErrorMessage(result.error) : await complete());
    } finally {
      setLoading(false);
    }
  }

  async function sendCode(address: string) {
    const created = await signIn.create({ identifier: address });
    if (created.error) return { error: clerkErrorMessage(created.error) };
    const sent = await signIn.emailCode.sendCode();
    return { error: sent.error ? clerkErrorMessage(sent.error) : null };
  }

  async function verifyCode(code: string) {
    const verified = await signIn.emailCode.verifyCode({ code });
    if (verified.error) return { error: clerkErrorMessage(verified.error) };
    return { error: await complete() };
  }

  function switchMode(next: 'password' | 'code') {
    setError(null);
    setMode(next);
    void signIn.reset();
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

      {mode === 'password' ? (
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
          />
          <PasswordField
            value={password}
            onChangeText={setPassword}
            returnKeyType="go"
            onSubmitEditing={signInWithPassword}
          />
          <FormError message={error} />
          <Button
            label="Sign in"
            loading={loading}
            disabled={!email.trim() || !password}
            onPress={signInWithPassword}
          />
          <FooterText>
            <TextLink label="Forgot password?" onPress={() => router.push('/forgot-password')} />
            {'   ·   '}
            <TextLink label="Email me a code instead" onPress={() => switchMode('code')} />
          </FooterText>
        </>
      ) : (
        <>
          <EmailCodeForm
            submitLabel="Email me a code"
            onSendCode={sendCode}
            onVerify={verifyCode}
            onStartOver={() => void signIn.reset()}
            error={error}
            setError={setError}
          />
          <FooterText>
            <TextLink label="Use my password instead" onPress={() => switchMode('password')} />
          </FooterText>
        </>
      )}
    </FormScreen>
  );
}
