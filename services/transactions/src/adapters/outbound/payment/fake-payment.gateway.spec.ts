import { FakePaymentGateway } from './fake-payment.gateway';
import type { CardChargeInput } from '../../../ports/payment-gateway.port';

describe('FakePaymentGateway', () => {
  const base: CardChargeInput = {
    reference: 'txn_1',
    amountMinor: 7500,
    customerEmail: 'ada@example.com',
    number: '4242424242424242',
    cvc: '123',
    expMonth: '12',
    expYear: '30',
    cardHolder: 'Ada',
  };

  it('approves valid charges', async () => {
    const gw = new FakePaymentGateway('APPROVED');
    const result = await gw.charge(base);
    expect(result._unsafeUnwrap().status).toBe('APPROVED');
  });

  it('declines and errors by mode', async () => {
    expect(
      (await new FakePaymentGateway('DECLINED').charge(base))._unsafeUnwrap().status,
    ).toBe('DECLINED');
    expect(
      (await new FakePaymentGateway('ERROR').charge(base))._unsafeUnwrap().status,
    ).toBe('ERROR');
  });

  it('rejects invalid input', async () => {
    const gw = new FakePaymentGateway();
    const result = await gw.charge({ ...base, amountMinor: 0 });
    expect(result._unsafeUnwrapErr().type).toBe('VALIDATION');
  });
});
