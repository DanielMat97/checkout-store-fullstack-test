import { Test } from '@nestjs/testing';
import { ok, err } from 'neverthrow';
import { DeliveriesController } from './deliveries.controller';
import {
  CreateDeliveryUseCase,
  GetDeliveryUseCase,
  UpdateDeliveryStatusUseCase,
} from '../../../application/delivery.use-cases';

describe('DeliveriesController', () => {
  const delivery = {
    id: 'del_1',
    transactionId: 'txn_1',
    customerId: 'cus_1',
    address: 'Calle 1',
    city: 'Bogotá',
    region: 'Cundinamarca',
    feeMinor: 5000,
    status: 'PENDING' as const,
  };

  function providers(overrides?: {
    create?: { execute: jest.Mock };
    get?: { execute: jest.Mock };
    update?: { execute: jest.Mock };
  }) {
    return [
      {
        provide: CreateDeliveryUseCase,
        useValue: overrides?.create ?? { execute: jest.fn() },
      },
      {
        provide: GetDeliveryUseCase,
        useValue: overrides?.get ?? { execute: jest.fn() },
      },
      {
        provide: UpdateDeliveryStatusUseCase,
        useValue: overrides?.update ?? { execute: jest.fn() },
      },
    ];
  }

  it('creates delivery', async () => {
    const createDelivery = {
      execute: jest.fn().mockResolvedValue(ok(delivery)),
    };
    const module = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: providers({ create: createDelivery }),
    }).compile();
    await expect(module.get(DeliveriesController).create(delivery)).resolves.toEqual(
      delivery,
    );
  });

  it('maps validation and persistence errors on create', async () => {
    const createDelivery = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(err({ type: 'VALIDATION', message: 'bad' }))
        .mockResolvedValueOnce(err({ type: 'PERSISTENCE_ERROR', message: 'x' })),
    };
    const module = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: providers({ create: createDelivery }),
    }).compile();
    const controller = module.get(DeliveriesController);
    await expect(controller.create(delivery)).rejects.toMatchObject({
      status: 400,
    });
    await expect(controller.create(delivery)).rejects.toMatchObject({
      status: 500,
    });
  });

  it('gets delivery and maps not found', async () => {
    const getDelivery = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(ok(delivery))
        .mockResolvedValueOnce(err({ type: 'NOT_FOUND', id: 'x' })),
    };
    const module = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: providers({ get: getDelivery }),
    }).compile();
    const controller = module.get(DeliveriesController);
    await expect(controller.get('del_1')).resolves.toEqual(delivery);
    await expect(controller.get('x')).rejects.toMatchObject({ status: 404 });
  });

  it('patches delivery status to FULFILLED', async () => {
    const update = {
      execute: jest
        .fn()
        .mockResolvedValue(ok({ ...delivery, status: 'FULFILLED' as const })),
    };
    const module = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: providers({ update }),
    }).compile();
    await expect(
      module.get(DeliveriesController).patch('del_1', { status: 'FULFILLED' }),
    ).resolves.toMatchObject({ status: 'FULFILLED' });
  });

  it('maps patch domain errors', async () => {
    const update = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(err({ type: 'NOT_FOUND', id: 'x' }))
        .mockResolvedValueOnce(err({ type: 'VALIDATION', message: 'bad' }))
        .mockResolvedValueOnce(err({ type: 'INVALID_STATE', message: 'state' }))
        .mockResolvedValueOnce(err({ type: 'PERSISTENCE_ERROR', message: 'down' })),
    };
    const module = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: providers({ update }),
    }).compile();
    const controller = module.get(DeliveriesController);
    await expect(controller.patch('x', { status: 'FULFILLED' })).rejects.toMatchObject({
      status: 404,
    });
    await expect(controller.patch('x', { status: 'FULFILLED' })).rejects.toMatchObject({
      status: 400,
    });
    await expect(controller.patch('x', { status: 'FULFILLED' })).rejects.toMatchObject({
      status: 422,
    });
    await expect(controller.patch('x', { status: 'FULFILLED' })).rejects.toMatchObject({
      status: 500,
    });
  });
});
