import {
  isStrictEmail,
  sanitizeAddress,
  sanitizeEmailInput,
  sanitizePersonName,
  sanitizePlaceName,
  toTitleCase,
} from './textFormat';

describe('textFormat', () => {
  it('title-cases names', () => {
    expect(toTitleCase('  ada   lovelace ')).toBe(' Ada Lovelace ');
  });

  it('sanitizes person / place / address / email', () => {
    expect(sanitizePersonName('ada <script>')).toBe('Ada Script');
    expect(sanitizePlaceName('Bogotá 123!')).toBe('Bogotá 123');
    expect(sanitizeAddress('Calle 1 #2-3')).toContain('Calle');
    expect(sanitizeEmailInput(' a@b.com ')).toBe('a@b.com');
  });

  it('validates strict emails', () => {
    expect(isStrictEmail('ada@example.com')).toBe(true);
    expect(isStrictEmail('bad')).toBe(false);
    expect(isStrictEmail('a b@c.com')).toBe(false);
  });
});
