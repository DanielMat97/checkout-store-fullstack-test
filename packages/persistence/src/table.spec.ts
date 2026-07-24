import { buildCheckoutTableInput } from './table';

describe('buildCheckoutTableInput', () => {
  it('builds single-table keys and gsi1', () => {
    const input = buildCheckoutTableInput('checkout-store');
    expect(input.TableName).toBe('checkout-store');
    expect(input.KeySchema).toEqual([
      { AttributeName: 'pk', KeyType: 'HASH' },
      { AttributeName: 'sk', KeyType: 'RANGE' },
    ]);
    expect(input.GlobalSecondaryIndexes?.[0]?.IndexName).toBe('gsi1');
  });
});
