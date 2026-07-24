import { Inject, Injectable } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
import type { DeliveryRepositoryPort, DeliveryRecord } from '@app/persistence';
import { DELIVERY_REPOSITORY } from '../ports/tokens';

export type DeliveryError =
  | { type: 'NOT_FOUND'; id: string }
  | { type: 'PERSISTENCE_ERROR'; message: string };

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
