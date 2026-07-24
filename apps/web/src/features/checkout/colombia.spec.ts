import {
  formatColombiaPhone,
  isValidColombiaMobile,
  filterSuggestions,
  BOGOTA_AREA_CITIES,
} from './colombia';
import { isStrictEmail, toTitleCase } from './textFormat';

describe('formatColombiaPhone', () => {
  it('masks Colombian mobile digits', () => {
    expect(formatColombiaPhone('3001234567')).toBe('300 123 4567');
    expect(formatColombiaPhone('30012')).toBe('300 12');
  });

  it('validates mobiles starting with 3 and 10 digits', () => {
    expect(isValidColombiaMobile('300 123 4567')).toBe(true);
    expect(isValidColombiaMobile('2001234567')).toBe(false);
    expect(isValidColombiaMobile('300123456')).toBe(false);
  });
});

describe('toTitleCase / email', () => {
  it('title-cases names', () => {
    expect(toTitleCase('juan perez')).toBe('Juan Perez');
    expect(toTitleCase('MARÍA')).toBe('María');
  });

  it('validates strict emails', () => {
    expect(isStrictEmail('a@b.co')).toBe(true);
    expect(isStrictEmail('bad@')).toBe(false);
    expect(isStrictEmail('no spaces@x.com')).toBe(false);
  });
});

describe('filterSuggestions', () => {
  it('prioritizes Bogotá area starts-with matches', () => {
    const result = filterSuggestions(BOGOTA_AREA_CITIES, 'bog');
    expect(result[0]).toBe('Bogotá');
  });
});
