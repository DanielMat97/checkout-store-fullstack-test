import { emailError, validateCard, validateDelivery } from './validation';

describe('validation', () => {
  it('accepts a valid card', () => {
    expect(
      validateCard({
        number: '4242424242424242',
        holder: 'Ada Lovelace',
        expiry: '12/30',
        cvv: '123',
      }),
    ).toEqual({});
  });

  it('flags invalid card fields', () => {
    const errors = validateCard({
      number: '123',
      holder: ' ',
      expiry: '13/01',
      cvv: '1',
    });
    expect(errors.number).toBeDefined();
    expect(errors.holder).toBeDefined();
    expect(errors.expiry).toBeDefined();
    expect(errors.cvv).toBeDefined();
  });

  it('accepts valid delivery', () => {
    expect(
      validateDelivery({
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '3001234567',
        address: 'Calle 123 #45',
        city: 'Bogotá',
        region: 'Cundinamarca',
      }),
    ).toEqual({});
  });

  it('flags invalid delivery fields', () => {
    const errors = validateDelivery({
      fullName: 'A',
      email: 'bad',
      phone: '2001234567',
      address: 'x',
      city: '',
      region: '',
    });
    expect(Object.keys(errors).length).toBeGreaterThan(4);
  });

  it('emailError covers empty and invalid', () => {
    expect(emailError('')).toMatch(/required/i);
    expect(emailError('bad')).toMatch(/valid email/i);
    expect(emailError('ada@example.com')).toBeUndefined();
  });
});
