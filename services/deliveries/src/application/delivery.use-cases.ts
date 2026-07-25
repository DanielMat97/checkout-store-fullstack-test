import { Inject, Injectable } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
import { randomUUID } from 'crypto';
import type {
  DeliveryRepositoryPort,
  DeliveryRecord,
  DeliveryStatus,
} from '@app/persistence';
import { DELIVERY_REPOSITORY } from '../ports/tokens';

export type DeliveryError =
  | { type: 'NOT_FOUND'; id: string }
  | { type: 'VALIDATION'; message: string }
  | { type: 'INVALID_STATE'; message: string }
  | { type: 'PERSISTENCE_ERROR'; message: string };

export type CreateDeliveryInput = {
  transactionId: string;
  customerId: string;
  address: string;
  city: string;
  region: string;
  feeMinor: number;
};

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveries: DeliveryRepositoryPort,
  ) {}

  async execute(
    input: CreateDeliveryInput,
  ): Promise<Result<DeliveryRecord, DeliveryError>> {
    if (
      !input.transactionId ||
      !input.customerId ||
      !input.address ||
      !input.city ||
      !input.region ||
      input.feeMinor < 0
    ) {
      return err({ type: 'VALIDATION', message: 'Invalid delivery payload' });
    }

    const delivery: DeliveryRecord = {
      id: `del_${randomUUID()}`,
      transactionId: input.transactionId,
      customerId: input.customerId,
      address: input.address,
      city: input.city,
      region: input.region,
      feeMinor: input.feeMinor,
      status: 'PENDING',
    };

    const saved = await this.deliveries.put(delivery);
    if (saved.isErr()) {
      return err({
        type: 'PERSISTENCE_ERROR',
        message:
          saved.error.type === 'PERSISTENCE_ERROR'
            ? saved.error.message
            : saved.error.type,
      });
    }
    return ok(saved.value);
  }
}

@Injectable()
export class GetDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveries: DeliveryRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<DeliveryRecord, DeliveryError>> {
    const result = await this.deliveries.getById(id);
    if (result.isErr()) {
      if (result.error.type === 'NOT_FOUND') {
        return err({ type: 'NOT_FOUND', id });
      }
      return err({
        type: 'PERSISTENCE_ERROR',
        message:
          result.error.type === 'PERSISTENCE_ERROR'
            ? result.error.message
            : result.error.type,
      });
    }
    return ok(result.value);
  }
}

@Injectable()
export class UpdateDeliveryStatusUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveries: DeliveryRepositoryPort,
  ) {}

  async execute(
    id: string,
    status: DeliveryStatus,
  ): Promise<Result<DeliveryRecord, DeliveryError>> {
    if (status !== 'FULFILLED' && status !== 'CANCELLED') {
      return err({
        type: 'VALIDATION',
        message: 'Only FULFILLED or CANCELLED allowed via PATCH',
      });
    }

    const loaded = await this.deliveries.getById(id);
    if (loaded.isErr()) {
      if (loaded.error.type === 'NOT_FOUND') {
        return err({ type: 'NOT_FOUND', id });
      }
      return err({
        type: 'PERSISTENCE_ERROR',
        message:
          loaded.error.type === 'PERSISTENCE_ERROR'
            ? loaded.error.message
            : loaded.error.type,
      });
    }

    if (status === 'FULFILLED' && loaded.value.status !== 'FULFILLABLE') {
      return err({
        type: 'INVALID_STATE',
        message: `Cannot fulfill delivery in status ${loaded.value.status}`,
      });
    }

    const saved = await this.deliveries.put({
      ...loaded.value,
      status,
    });
    if (saved.isErr()) {
      return err({
        type: 'PERSISTENCE_ERROR',
        message:
          saved.error.type === 'PERSISTENCE_ERROR'
            ? saved.error.message
            : saved.error.type,
      });
    }
    return ok(saved.value);
  }
}
