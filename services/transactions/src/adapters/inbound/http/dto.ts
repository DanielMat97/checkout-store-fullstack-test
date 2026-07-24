import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryAddressDto {
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
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'prod_aura_quiet' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'cust_...' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ example: 45990000, description: 'Product amount in minor units' })
  @IsInt()
  @Min(1)
  productAmount!: number;

  @ApiProperty({ example: 1500 })
  @IsInt()
  @Min(0)
  baseFee!: number;

  @ApiProperty({ example: 5000 })
  @IsInt()
  @Min(0)
  deliveryFee!: number;

  @ApiProperty({ type: DeliveryAddressDto })
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  delivery!: DeliveryAddressDto;
}

export class CardDto {
  @ApiProperty({ example: '4242424242424242' })
  @IsString()
  @Matches(/^\d{13,19}$/)
  number!: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @Matches(/^\d{3,4}$/)
  cvc!: string;

  @ApiProperty({ example: '12' })
  @IsString()
  @Matches(/^\d{1,2}$/)
  expMonth!: string;

  @ApiProperty({ example: '30' })
  @IsString()
  @Matches(/^\d{2,4}$/)
  expYear!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  cardHolder!: string;
}

export class PayTransactionDto {
  @ApiProperty({ example: 'del_...' })
  @IsString()
  @IsNotEmpty()
  deliveryId!: string;

  @ApiProperty({ type: CardDto })
  @ValidateNested()
  @Type(() => CardDto)
  card!: CardDto;
}
