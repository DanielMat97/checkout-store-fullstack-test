import { Inject, Injectable } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
import { randomUUID } from 'crypto';
import type { DeliveryRepositoryPort, DeliveryRecord } from '@app/persistence';
import { DELIVERY_REPOSITORY } from '../ports/tokens';

export type DeliveryError =
  | { type: 'NOT_FOUND'; id: string }
  | { type: 'VALIDATION'; message: string }
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
