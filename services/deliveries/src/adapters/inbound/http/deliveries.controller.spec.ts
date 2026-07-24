import { Test } from '@nestjs/testing';
import { ok, err } from 'neverthrow';
import { DeliveriesController } from './deliveries.controller';
import {
  CreateDeliveryUseCase,
  GetDeliveryUseCase,
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

  it('creates delivery', async () => {
    const createDelivery = {
      execute: jest.fn().mockResolvedValue(ok(delivery)),
    };
    const module = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [
        { provide: CreateDeliveryUseCase, useValue: createDelivery },
        { provide: GetDeliveryUseCase, useValue: { execute: jest.fn() } },
      ],
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
      providers: [
        { provide: CreateDeliveryUseCase, useValue: createDelivery },
        { provide: GetDeliveryUseCase, useValue: { execute: jest.fn() } },
      ],
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
      providers: [
        { provide: CreateDeliveryUseCase, useValue: { execute: jest.fn() } },
        { provide: GetDeliveryUseCase, useValue: getDelivery },
      ],
    }).compile();
    const controller = module.get(DeliveriesController);
    await expect(controller.get('del_1')).resolves.toEqual(delivery);
    await expect(controller.get('x')).rejects.toMatchObject({ status: 404 });
  });
});
