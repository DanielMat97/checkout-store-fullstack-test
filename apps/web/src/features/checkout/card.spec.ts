import {
  detectCardBrand,
  isValidCvv,
  isValidExpiry,
  isValidLuhn,
} from './card';

describe('card helpers', () => {
  it('detects visa and validates luhn', () => {
    // Visa test PAN (structurally valid)
    const visa = '4111111111111111';
    expect(detectCardBrand(visa)).toBe('visa');
    expect(isValidLuhn(visa)).toBe(true);
  });

  it('rejects expired dates and short cvv', () => {
    expect(isValidExpiry('01/20')).toBe(false);
    expect(isValidCvv('12', 'visa')).toBe(false);
    expect(isValidCvv('123', 'visa')).toBe(true);
  });
});
