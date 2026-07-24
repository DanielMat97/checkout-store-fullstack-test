import { err, ok, type Result } from 'neverthrow';
import type {
  CustomerRecord,
  CustomerRepositoryPort,
  PersistenceError,
} from '@app/persistence';
import { CreateCustomerUseCase, GetCustomerUseCase } from './customer.use-cases';

class MemoryCustomers implements CustomerRepositoryPort {
  private readonly items = new Map<string, CustomerRecord>();

  async getById(id: string): Promise<Result<CustomerRecord, PersistenceError>> {
    const item = this.items.get(id);
    if (!item) {
      return err({ type: 'NOT_FOUND', entity: 'customer', id });
    }
    return ok({ ...item });
  }

  async put(customer: CustomerRecord): Promise<Result<CustomerRecord, PersistenceError>> {
    this.items.set(customer.id, { ...customer });
    return ok({ ...customer });
  }
}

describe('Customer use-cases (ROP)', () => {
  const repo = new MemoryCustomers();
  const create = new CreateCustomerUseCase(repo);
  const get = new GetCustomerUseCase(repo);

  it('creates and gets a customer', async () => {
    const created = await create.execute({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+573001112233',
    });
    expect(created.isOk()).toBe(true);
    const id = created._unsafeUnwrap().id;
    const loaded = await get.execute(id);
    expect(loaded.isOk()).toBe(true);
    expect(loaded._unsafeUnwrap().email).toBe('ada@example.com');
  });

  it('validates required fields', async () => {
    const result = await create.execute({
      fullName: '',
      email: '',
      phone: '',
    });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe('VALIDATION');
    }
  });

  it('maps persistence errors on create and get', async () => {
    const failing: CustomerRepositoryPort = {
      getById: async () => err({ type: 'PERSISTENCE_ERROR', message: 'down' }),
      put: async () => err({ type: 'PERSISTENCE_ERROR', message: 'down' }),
    };
    const createFail = new CreateCustomerUseCase(failing);
    const getFail = new GetCustomerUseCase(failing);
    expect(
      (
        await createFail.execute({
          fullName: 'Ada',
          email: 'a@b.co',
          phone: '300',
        })
      )._unsafeUnwrapErr().type,
    ).toBe('PERSISTENCE_ERROR');
    expect((await getFail.execute('x'))._unsafeUnwrapErr().type).toBe(
      'PERSISTENCE_ERROR',
    );

    const missing: CustomerRepositoryPort = {
      getById: async () => err({ type: 'NOT_FOUND', entity: 'customer', id: 'x' }),
      put: async (c) => ok(c),
    };
    expect(
      (await new GetCustomerUseCase(missing).execute('x'))._unsafeUnwrapErr().type,
    ).toBe('NOT_FOUND');
  });
});
