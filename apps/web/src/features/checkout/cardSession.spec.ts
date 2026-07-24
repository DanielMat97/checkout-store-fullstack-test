import {
  clearPendingCard,
  peekPendingCard,
  setPendingCard,
  splitExpiry,
  takePendingCard,
} from './cardSession';

describe('cardSession', () => {
  it('splits MM/YY expiry', () => {
    expect(splitExpiry('12/30')).toEqual({ expMonth: '12', expYear: '30' });
  });

  it('stores, peeks, and clears pending card', () => {
    setPendingCard({
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '30',
      cardHolder: 'Ada',
    });
    expect(peekPendingCard()?.number.slice(-4)).toBe('4242');
    clearPendingCard();
    expect(peekPendingCard()).toBeNull();
    setPendingCard({
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '30',
      cardHolder: 'Ada',
    });
    const taken = takePendingCard();
    expect(taken?.number.slice(-4)).toBe('4242');
    expect(takePendingCard()).toBeNull();
  });
});
