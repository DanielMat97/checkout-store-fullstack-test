import { Test } from '@nestjs/testing';
import { ok, err } from 'neverthrow';
import { ProductsController } from './products.controller';
import {
  GetProductUseCase,
  ListProductsUseCase,
} from '../../../application/product.use-cases';

describe('ProductsController (thin)', () => {
  const product = {
    id: 'prod_aura_quiet',
    name: 'Aura Quiet',
    kicker: 'Listening',
    description: 'd',
    priceMinor: 1000,
    stock: 8,
    imageUrl: 'https://example.com/a.jpg',
    imageAlt: 'alt',
  };

  it('lists products via use-case', async () => {
    const listProducts = { execute: jest.fn().mockResolvedValue(ok([product])) };
    const getProduct = { execute: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ListProductsUseCase, useValue: listProducts },
        { provide: GetProductUseCase, useValue: getProduct },
      ],
    }).compile();

    const controller = module.get(ProductsController);
    await expect(controller.list()).resolves.toEqual({ items: [product] });
  });

  it('returns stock projection', async () => {
    const getProduct = {
      execute: jest.fn().mockResolvedValue(ok(product)),
    };
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ListProductsUseCase, useValue: { execute: jest.fn() } },
        { provide: GetProductUseCase, useValue: getProduct },
      ],
    }).compile();

    const controller = module.get(ProductsController);
    await expect(controller.stock('prod_aura_quiet')).resolves.toEqual({
      productId: 'prod_aura_quiet',
      stock: 8,
    });
  });

  it('maps not found', async () => {
    const getProduct = {
      execute: jest
        .fn()
        .mockResolvedValue(err({ type: 'NOT_FOUND', id: 'x' })),
    };
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ListProductsUseCase, useValue: { execute: jest.fn() } },
        { provide: GetProductUseCase, useValue: getProduct },
      ],
    }).compile();

    const controller = module.get(ProductsController);
    await expect(controller.get('x')).rejects.toMatchObject({
      status: 404,
    });
  });
});
