/**
 * Onboarding form rules and submission.
 *
 * Validation matches web (app/onboarding/page.tsx) so a profile that web
 * accepts, mobile accepts too.
 */

export const MAX_NAME_LENGTH = 50;

export type OnboardingInput = {
  firstName: string;
  lastName: string;
  gradYear: string;
};

/** Returns an error message for the first invalid field, or null when valid. */
export function validateOnboarding(input: OnboardingInput): string | null {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const gradYear = input.gradYear.trim();

  if (firstName.length === 0 || firstName.length > MAX_NAME_LENGTH) {
    return `First name must be between 1 and ${MAX_NAME_LENGTH} characters.`;
  }
  if (lastName.length === 0 || lastName.length > MAX_NAME_LENGTH) {
    return `Last name must be between 1 and ${MAX_NAME_LENGTH} characters.`;
  }
  if (!/^\d+$/.test(gradYear)) {
    return 'Grad year must be a number.';
  }
  return null;
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * Creates (or claims) the user's attendees row.
 *
 * STUB until Luis's onboarding edge function (ADTCIA-30) is merged. Mobile
 * can't do this itself: web does it server-side with the service-role key,
 * which must never ship inside an app. The real version will POST the
 * trimmed input to the edge function with the user's Clerk token.
 *
 * Until then this succeeds without writing anything. The caller marks the
 * profile complete for the rest of this app session only, so the flow can be
 * demoed end to end; on the next launch the gate finds no row and shows
 * onboarding again.
 */
export async function submitOnboardingProfile(
  input: OnboardingInput,
  _getToken: () => Promise<string | null>,
): Promise<SubmitResult> {
  const error = validateOnboarding(input);
  if (error) return { ok: false, error };

  // TODO(ADTCIA-30): call the onboarding edge function here.
  return { ok: true };
}
