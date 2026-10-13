import { MAX_NAME_LENGTH, submitOnboardingProfile, validateOnboarding } from './onboarding';

const valid = { firstName: 'Maya', lastName: 'Rivera', gradYear: '2027' };

describe('validateOnboarding (same rules as web)', () => {
  it('accepts a valid profile, ignoring surrounding spaces', () => {
    expect(validateOnboarding({ firstName: ' Maya ', lastName: 'Rivera ', gradYear: ' 2027' })).toBeNull();
  });

  it.each([
    ['empty first name', { ...valid, firstName: '   ' }, 'First name'],
    ['too-long first name', { ...valid, firstName: 'a'.repeat(MAX_NAME_LENGTH + 1) }, 'First name'],
    ['empty last name', { ...valid, lastName: '' }, 'Last name'],
    ['non-numeric grad year', { ...valid, gradYear: '20x7' }, 'Grad year'],
    ['empty grad year', { ...valid, gradYear: '' }, 'Grad year'],
  ])('rejects %s', (_label, input, field) => {
    expect(validateOnboarding(input)).toContain(field);
  });

  it(`allows a name of exactly ${MAX_NAME_LENGTH} characters`, () => {
    expect(validateOnboarding({ ...valid, firstName: 'a'.repeat(MAX_NAME_LENGTH) })).toBeNull();
  });
});

describe('submitOnboardingProfile (stub until ADTCIA-30)', () => {
  const getToken = async () => 'token';

  it('rejects invalid input without submitting', async () => {
    await expect(submitOnboardingProfile({ ...valid, gradYear: 'soon' }, getToken)).resolves.toEqual({
      ok: false,
      error: 'Grad year must be a number.',
    });
  });

  it('succeeds for valid input', async () => {
    await expect(submitOnboardingProfile(valid, getToken)).resolves.toEqual({ ok: true });
  });
});
