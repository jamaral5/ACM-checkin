import { colors } from '@/theme';

import { membershipProgress, orgAccent, roleLabel } from './org-display';

describe('orgAccent', () => {
  it('reads the accent colour from branding', () => {
    expect(orgAccent({ colors: { accent: colors.bad, primary: colors.accent } })).toBe(colors.bad);
  });

  it('falls back to the primary colour', () => {
    expect(orgAccent({ colors: { primary: colors.accent } })).toBe(colors.accent);
  });

  it('ignores missing or invalid branding', () => {
    expect(orgAccent(null)).toBeNull();
    expect(orgAccent({})).toBeNull();
    expect(orgAccent({ colors: { accent: 'orange' } })).toBeNull();
  });
});

describe('membershipProgress', () => {
  it('counts down to the threshold', () => {
    expect(membershipProgress('acm', 1)).toEqual({ threshold: 3, attended: 1, remaining: 2, isMember: false });
  });

  it('marks you a member once you reach it', () => {
    expect(membershipProgress('ACM', 4)).toMatchObject({ remaining: 0, isMember: true });
  });

  it('has no progress for an org without a threshold', () => {
    expect(membershipProgress('colorstack', 5)).toBeNull();
    expect(membershipProgress(null, 5)).toBeNull();
  });
});

describe('roleLabel', () => {
  it('capitalises roles', () => {
    expect(roleLabel('officer')).toBe('Officer');
    expect(roleLabel('co-owner')).toBe('Co-Owner');
  });
});
