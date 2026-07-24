import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { TransactionRepositoryPort } from '@app/persistence';
import { CreateTransactionUseCase } from '../../../application/create-transaction.use-case';
import { PayTransactionUseCase } from '../../../application/pay-transaction.use-case';
import { TRANSACTION_REPOSITORY } from '../../../ports/injection.tokens';
import { domainErrorToHttp } from './domain-error.mapper';

class CreateTransactionBody {
  productId!: string;
  customerId!: string;
  productAmount!: number;
  baseFee!: number;
  deliveryFee!: number;
  delivery!: { address: string; city: string; region: string };
}

class PayTransactionBody {
  deliveryId!: string;
  card!: {
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolder: string;
  };
}

@ApiTags('transactions')
@Controller()
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly payTransaction: PayTransactionUseCase,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create PENDING transaction + delivery' })
  async create(@Body() body: CreateTransactionBody) {
    const result = await this.createTransaction.execute(body);
    if (result.isErr()) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by id' })
  async get(@Param('id') id: string) {
    const result = await this.transactions.getById(id);
    if (result.isErr()) {
      throw domainErrorToHttp({
        type: 'NOT_FOUND',
        entity: 'transaction',
        id,
      });
    }
    return result.value;
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Pay PENDING transaction via payment port' })
  async pay(@Param('id') id: string, @Body() body: PayTransactionBody) {
    const result = await this.payTransaction.execute({
      transactionId: id,
      deliveryId: body.deliveryId,
      card: body.card,
    });
    if (result.isErr()) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }
}
