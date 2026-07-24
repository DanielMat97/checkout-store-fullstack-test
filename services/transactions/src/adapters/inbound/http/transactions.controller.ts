import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { TransactionRepositoryPort } from '@app/persistence';
import { CreateTransactionUseCase } from '../../../application/create-transaction.use-case';
import { PayTransactionUseCase } from '../../../application/pay-transaction.use-case';
import { TRANSACTION_REPOSITORY } from '../../../ports/injection.tokens';
import { domainErrorToHttp } from './domain-error.mapper';
import { CreateTransactionDto, PayTransactionDto } from './dto';

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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create PENDING transaction + delivery' })
  async create(@Body() body: CreateTransactionDto) {
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Pay PENDING transaction (returns 200 with paymentStatus APPROVED|DECLINED|ERROR)',
  })
  async pay(@Param('id') id: string, @Body() body: PayTransactionDto) {
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
