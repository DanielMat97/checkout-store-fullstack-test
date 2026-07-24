import { ElectroDbCustomerRepository } from './electrodb-customer.repository';

describe('ElectroDbCustomerRepository', () => {
  const row = {
    customerId: 'cus_1',
    fullName: 'Ada',
    email: 'ada@example.com',
    phone: '3001234567',
  };

  it('getById and put succeed', async () => {
    const entities = {
      customers: {
        get: jest.fn().mockReturnValue({
          go: jest.fn().mockResolvedValue({ data: row }),
        }),
        put: jest.fn().mockReturnValue({
          go: jest.fn().mockResolvedValue({ data: row }),
        }),
      },
    };
    const repo = new ElectroDbCustomerRepository(entities as never);
    const got = await repo.getById('cus_1');
    expect(got._unsafeUnwrap()).toEqual({
      id: 'cus_1',
      fullName: 'Ada',
      email: 'ada@example.com',
      phone: '3001234567',
    });
    const put = await repo.put({
      id: 'cus_1',
      fullName: 'Ada',
      email: 'ada@example.com',
      phone: '3001234567',
    });
    expect(put.isOk()).toBe(true);
  });

  it('maps missing and persistence errors', async () => {
    const entities = {
      customers: {
        get: jest
          .fn()
          .mockReturnValueOnce({
            go: jest.fn().mockResolvedValue({ data: null }),
          })
          .mockReturnValueOnce({
            go: jest.fn().mockRejectedValue(new Error('x')),
          }),
        put: jest.fn().mockReturnValue({
          go: jest.fn().mockRejectedValue('bad'),
        }),
      },
    };
    const repo = new ElectroDbCustomerRepository(entities as never);
    expect((await repo.getById('x'))._unsafeUnwrapErr().type).toBe('NOT_FOUND');
    expect((await repo.getById('x'))._unsafeUnwrapErr().type).toBe('PERSISTENCE_ERROR');
    expect(
      (
        await repo.put({
          id: 'cus_1',
          fullName: 'Ada',
          email: 'a@b.co',
          phone: '3001234567',
        })
      )._unsafeUnwrapErr().type,
    ).toBe('PERSISTENCE_ERROR');
  });
});
