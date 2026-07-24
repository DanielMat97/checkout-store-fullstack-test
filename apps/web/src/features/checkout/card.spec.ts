import {
  detectCardBrand,
  digitsOnly,
  formatCardNumber,
  formatExpiry,
  isValidCvv,
  isValidEmail,
  isValidExpiry,
  isValidLuhn,
  sanitizeCvv,
} from './card';

describe('card helpers', () => {
  it('detects visa, mastercard, and unknown brands', () => {
    expect(detectCardBrand('4111111111111111')).toBe('visa');
    expect(detectCardBrand('5500000000000004')).toBe('mastercard');
    expect(detectCardBrand('2221000000000009')).toBe('mastercard');
    expect(detectCardBrand('6011000000000004')).toBe('unknown');
  });

  it('validates luhn and formats inputs', () => {
    expect(isValidLuhn('4111111111111111')).toBe(true);
    expect(isValidLuhn('4111111111111112')).toBe(false);
    expect(isValidLuhn('123')).toBe(false);
    expect(digitsOnly('41 11')).toBe('4111');
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatExpiry('1225')).toBe('12/25');
    expect(formatExpiry('12')).toBe('12');
    expect(sanitizeCvv('12a45')).toBe('124');
  });

  it('rejects expired dates and invalid cvv/email', () => {
    expect(isValidExpiry('01/20')).toBe(false);
    expect(isValidExpiry('13/30')).toBe(false);
    expect(isValidExpiry('ab')).toBe(false);
    expect(isValidExpiry('12/30')).toBe(true);
    expect(isValidCvv('12')).toBe(false);
    expect(isValidCvv('123')).toBe(true);
    expect(isValidCvv('1234')).toBe(false);
    expect(isValidEmail('ada@example.com')).toBe(true);
    expect(isValidEmail('bad')).toBe(false);
  });
});
