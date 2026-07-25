import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { TransactionRepositoryPort, TransactionStatus } from '@app/persistence';
import { CreateTransactionUseCase } from '../../../application/create-transaction.use-case';
import { PayTransactionUseCase } from '../../../application/pay-transaction.use-case';
import { RestoreTransactionStockUseCase } from '../../../application/restore-transaction-stock.use-case';
import { TRANSACTION_REPOSITORY } from '../../../ports/injection.tokens';
import { domainErrorToHttp } from './domain-error.mapper';
import { CreateTransactionDto, PayTransactionDto } from './dto';

@ApiTags('transactions')
@Controller()
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly payTransaction: PayTransactionUseCase,
    private readonly restoreStock: RestoreTransactionStockUseCase,
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

  @Get()
  @ApiOperation({ summary: 'List transactions (ops console)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async list(
    @Query('status') status?: TransactionStatus,
    @Query('limit') limitRaw?: string,
  ) {
    const limit = limitRaw ? Number(limitRaw) : 50;
    const result = await this.transactions.listByCreatedAt({
      status,
      limit: Number.isFinite(limit) ? limit : 50,
    });
    if (result.isErr()) {
      throw domainErrorToHttp({
        type: 'PERSISTENCE_ERROR',
        message: result.error.type === 'PERSISTENCE_ERROR'
          ? result.error.message
          : result.error.type,
      });
    }
    return { items: result.value };
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

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Ops: restore stock (+1), cancel delivery, mark transaction REFUNDED (demo console)',
  })
  async restore(@Param('id') id: string) {
    const result = await this.restoreStock.execute(id);
    if (result.isErr()) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }
}
