import { seedCheckoutForm } from './seedCheckoutForm';
import { clearPendingCard, setPendingCard } from './cardSession';

describe('seedCheckoutForm', () => {
  afterEach(() => {
    clearPendingCard();
  });

  it('returns empty forms when nothing saved', () => {
    expect(seedCheckoutForm({ delivery: null, cardMeta: null })).toEqual({
      card: { number: '', holder: '', expiry: '', cvv: '' },
      delivery: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        region: '',
      },
    });
  });

  it('restores delivery from Redux and card from ephemeral session', () => {
    setPendingCard({
      number: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '30',
      cardHolder: 'Ada Lovelace',
    });
    const seeded = seedCheckoutForm({
      delivery: {
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '300 123 4567',
        address: 'Calle 1',
        city: 'Bogota',
        region: 'Cundinamarca',
      },
      cardMeta: { brand: 'visa', last4: '1111', holderName: 'Ada Lovelace' },
    });
    expect(seeded.delivery.email).toBe('ada@example.com');
    expect(seeded.card.number).toBe('4111 1111 1111 1111');
    expect(seeded.card.expiry).toBe('12/30');
    expect(seeded.card.cvv).toBe('123');
    expect(seeded.card.holder).toBe('Ada Lovelace');
  });

  it('keeps holder from cardMeta when session was cleared', () => {
    const seeded = seedCheckoutForm({
      delivery: null,
      cardMeta: { brand: 'visa', last4: '4242', holderName: 'Only Meta' },
    });
    expect(seeded.card.holder).toBe('Only Meta');
    expect(seeded.card.number).toBe('');
  });
});
