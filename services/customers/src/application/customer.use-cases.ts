import { Inject, Injectable } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
import { randomUUID } from 'crypto';
import type { CustomerRepositoryPort, CustomerRecord } from '@app/persistence';
import { CUSTOMER_REPOSITORY } from '../ports/tokens';

export type CustomerError =
  | { type: 'NOT_FOUND'; id: string }
  | { type: 'VALIDATION'; message: string }
  | { type: 'PERSISTENCE_ERROR'; message: string };

export type CreateCustomerInput = {
  fullName: string;
  email: string;
  phone: string;
};

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepositoryPort,
  ) {}

  async execute(
    input: CreateCustomerInput,
  ): Promise<Result<CustomerRecord, CustomerError>> {
    if (!input.fullName || !input.email || !input.phone) {
      return err({ type: 'VALIDATION', message: 'fullName, email, phone required' });
    }
    const customer: CustomerRecord = {
      id: `cust_${randomUUID()}`,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
    };
    const saved = await this.customers.put(customer);
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
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<CustomerRecord, CustomerError>> {
    const result = await this.customers.getById(id);
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
