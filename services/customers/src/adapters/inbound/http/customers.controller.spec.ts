import { Test } from '@nestjs/testing';
import { ok, err } from 'neverthrow';
import { CustomersController } from './customers.controller';
import {
  CreateCustomerUseCase,
  GetCustomerUseCase,
} from '../../../application/customer.use-cases';

describe('CustomersController', () => {
  const customer = {
    id: 'cus_1',
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '3001234567',
  };

  it('creates customer', async () => {
    const createCustomer = {
      execute: jest.fn().mockResolvedValue(ok(customer)),
    };
    const module = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CreateCustomerUseCase, useValue: createCustomer },
        { provide: GetCustomerUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    const controller = module.get(CustomersController);
    await expect(controller.create(customer)).resolves.toEqual(customer);
  });

  it('maps validation and persistence errors on create', async () => {
    const createCustomer = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(err({ type: 'VALIDATION', message: 'bad' }))
        .mockResolvedValueOnce(err({ type: 'PERSISTENCE_ERROR', message: 'x' })),
    };
    const module = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CreateCustomerUseCase, useValue: createCustomer },
        { provide: GetCustomerUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();
    const controller = module.get(CustomersController);
    await expect(controller.create(customer)).rejects.toMatchObject({
      status: 400,
    });
    await expect(controller.create(customer)).rejects.toMatchObject({
      status: 500,
    });
  });

  it('gets customer and maps not found', async () => {
    const getCustomer = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(ok(customer))
        .mockResolvedValueOnce(err({ type: 'NOT_FOUND', id: 'x' })),
    };
    const module = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CreateCustomerUseCase, useValue: { execute: jest.fn() } },
        { provide: GetCustomerUseCase, useValue: getCustomer },
      ],
    }).compile();
    const controller = module.get(CustomersController);
    await expect(controller.get('cus_1')).resolves.toEqual(customer);
    await expect(controller.get('x')).rejects.toMatchObject({ status: 404 });
  });
});
