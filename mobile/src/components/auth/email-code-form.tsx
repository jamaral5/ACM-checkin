import { useState } from 'react';

import { Button } from '@/components/button';
import { FooterText, FormError, TextField, TextLink } from '@/components/form';

export type StepResult = { error: string | null };

/**
 * The two-step email flow shared by sign-in and sign-up:
 *   1. enter email → `onSendCode` emails a 6-digit code
 *   2. enter code  → `onVerify` checks it and finishes signing in
 * The parent supplies the Clerk calls; this component owns the inputs,
 * loading state and errors.
 */
export function EmailCodeForm({
  submitLabel,
  onSendCode,
  onVerify,
  onStartOver,
  error,
  setError,
}: {
  submitLabel: string;
  onSendCode: (email: string) => Promise<StepResult>;
  onVerify: (code: string) => Promise<StepResult>;
  onStartOver: () => void;
  error: string | null;
  setError: (message: string | null) => void;
}) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function run(action: () => Promise<StepResult>, onSuccess?: () => void) {
    setError(null);
    setLoading(true);
    try {
      const { error: message } = await action();
      if (message) setError(message);
      else onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  if (step === 'email') {
    return (
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
          onSubmitEditing={() => run(() => onSendCode(email.trim()), () => setStep('code'))}
        />
        <FormError message={error} />
        <Button
          label={submitLabel}
          loading={loading}
          disabled={!email.trim()}
          onPress={() => run(() => onSendCode(email.trim()), () => setStep('code'))}
        />
      </>
    );
  }

  return (
    <>
      <FooterText>
        We emailed a 6-digit code to {email.trim()}. It expires in 10 minutes.
      </FooterText>
      <TextField
        label="Verification code"
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
        placeholder="123456"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
        autoFocus
        onSubmitEditing={() => run(() => onVerify(code))}
      />
      <FormError message={error} />
      <Button label="Verify" loading={loading} disabled={code.length < 6} onPress={() => run(() => onVerify(code))} />
      <FooterText>
        <TextLink label="Resend code" onPress={() => run(() => onSendCode(email.trim()))} />
        {'   ·   '}
        <TextLink
          label="Use a different email"
          onPress={() => {
            setCode('');
            setError(null);
            setStep('email');
            onStartOver();
          }}
        />
      </FooterText>
    </>
  );
}
