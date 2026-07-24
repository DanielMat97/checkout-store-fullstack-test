import { createHash } from 'crypto';
import { buildIntegritySignature } from './integrity';

describe('buildIntegritySignature', () => {
  it('matches SHA-256 of reference+amount+currency+secret', () => {
    const reference = 'tx_ref_1';
    const amountInCents = 150000;
    const currency = 'COP';
    const integrityKey = 'test_integrity_secret';
    const expected = createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${integrityKey}`)
      .digest('hex');

    expect(
      buildIntegritySignature({
        reference,
        amountInCents,
        currency,
        integrityKey,
      }),
    ).toBe(expected);
  });
});
