import { Test } from '@nestjs/testing';
import { ok, err } from 'neverthrow';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../../application/create-transaction.use-case';
import { PayTransactionUseCase } from '../../../application/pay-transaction.use-case';
import { RestoreTransactionStockUseCase } from '../../../application/restore-transaction-stock.use-case';
import { TRANSACTION_REPOSITORY } from '../../../ports/injection.tokens';

describe('TransactionsController', () => {
  const tx = {
    id: 'txn_1',
    status: 'PENDING' as const,
    productId: 'prod_a',
    customerId: 'cus_1',
    productAmount: 1000,
    baseFee: 1500,
    deliveryFee: 5000,
    total: 7500,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const body = {
    productId: 'prod_a',
    customerId: 'cus_1',
    productAmount: 1000,
    baseFee: 1500,
    deliveryFee: 5000,
    delivery: { address: 'Calle 1', city: 'Bogotá', region: 'Cundinamarca' },
  };

  async function build(overrides?: {
    create?: { execute: jest.Mock };
    pay?: { execute: jest.Mock };
    restore?: { execute: jest.Mock };
    transactions?: { getById: jest.Mock; listByCreatedAt?: jest.Mock };
  }) {
    const module = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: CreateTransactionUseCase,
          useValue: overrides?.create ?? { execute: jest.fn() },
        },
        {
          provide: PayTransactionUseCase,
          useValue: overrides?.pay ?? { execute: jest.fn() },
        },
        {
          provide: RestoreTransactionStockUseCase,
          useValue: overrides?.restore ?? { execute: jest.fn() },
        },
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: overrides?.transactions ?? {
            getById: jest.fn(),
            listByCreatedAt: jest.fn().mockResolvedValue(ok([])),
          },
        },
      ],
    }).compile();
    return module.get(TransactionsController);
  }

  it('creates transaction', async () => {
    const create = {
      execute: jest.fn().mockResolvedValue(ok({ transaction: tx, deliveryId: 'del_1' })),
    };
    const controller = await build({ create });
    await expect(controller.create(body)).resolves.toEqual({
      transaction: tx,
      deliveryId: 'del_1',
    });
  });

  it('maps create errors', async () => {
    const create = {
      execute: jest
        .fn()
        .mockResolvedValue(err({ type: 'NOT_FOUND', entity: 'product', id: 'x' })),
    };
    const controller = await build({ create });
    await expect(controller.create(body)).rejects.toMatchObject({ status: 404 });
  });

  it('gets transaction and maps not found', async () => {
    const transactions = {
      getById: jest
        .fn()
        .mockResolvedValueOnce(ok(tx))
        .mockResolvedValueOnce(
          err({ type: 'NOT_FOUND', entity: 'transaction', id: 'x' }),
        ),
    };
    const controller = await build({ transactions });
    await expect(controller.get('txn_1')).resolves.toEqual(tx);
    await expect(controller.get('x')).rejects.toMatchObject({ status: 404 });
  });

  it('pays transaction', async () => {
    const pay = {
      execute: jest
        .fn()
        .mockResolvedValue(
          ok({ paymentStatus: 'APPROVED', transaction: { ...tx, status: 'APPROVED' } }),
        ),
    };
    const controller = await build({ pay });
    await expect(
      controller.pay('txn_1', {
        deliveryId: 'del_1',
        card: {
          number: '4242424242424242',
          cvc: '123',
          expMonth: '12',
          expYear: '30',
          cardHolder: 'Ada',
        },
      }),
    ).resolves.toMatchObject({ paymentStatus: 'APPROVED' });
  });

  it('maps pay errors', async () => {
    const pay = {
      execute: jest
        .fn()
        .mockResolvedValue(err({ type: 'INVALID_STATE', message: 'already paid' })),
    };
    const controller = await build({ pay });
    await expect(
      controller.pay('txn_1', {
        deliveryId: 'del_1',
        card: {
          number: '4242424242424242',
          cvc: '123',
          expMonth: '12',
          expYear: '30',
          cardHolder: 'Ada',
        },
      }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('lists transactions', async () => {
    const transactions = {
      getById: jest.fn(),
      listByCreatedAt: jest.fn().mockResolvedValue(ok([tx])),
    };
    const controller = await build({ transactions });
    await expect(controller.list('APPROVED', '10')).resolves.toEqual({ items: [tx] });
  });

  it('restores stock', async () => {
    const restore = {
      execute: jest.fn().mockResolvedValue(
        ok({
          transactionId: 'txn_1',
          productId: 'prod_a',
          stock: 6,
          deliveryStatus: 'CANCELLED',
          transactionStatus: 'REFUNDED',
        }),
      ),
    };
    const controller = await build({ restore });
    await expect(controller.restore('txn_1')).resolves.toMatchObject({
      transactionStatus: 'REFUNDED',
    });
  });
});
