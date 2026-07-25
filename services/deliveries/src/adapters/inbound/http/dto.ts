import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { DeliveryStatus } from '@app/persistence';

export class CreateDeliveryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ example: 'Calle 100 #10-20' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address!: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  region!: string;

  @ApiProperty({ example: 5000 })
  @IsInt()
  @Min(0)
  feeMinor!: number;
}

export class UpdateDeliveryStatusDto {
  @ApiProperty({ enum: ['FULFILLED', 'CANCELLED'] })
  @IsString()
  @IsIn(['FULFILLED', 'CANCELLED'])
  status!: Extract<DeliveryStatus, 'FULFILLED' | 'CANCELLED'>;
}
