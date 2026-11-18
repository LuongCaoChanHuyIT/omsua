import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICE_LEVELS,
  PAYMENT_METHODS,
  PRODUCT_SIZE_CODES,
  SPICE_LEVELS,
  SUGAR_LEVELS,
  type CreateOrderPayload,
  type IceLevel,
  type OrderItemInput,
  type PaymentMethod,
  type ProductSizeCode,
  type SpiceLevel,
  type SugarLevel,
} from '@omsua/shared';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto implements OrderItemInput {
  @ApiProperty({
    description: 'Menu product slug identifier',
    example: 'tra-sua-atiso',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Item quantity (1 to 99)',
    example: 1,
    minimum: 1,
    maximum: 99,
  })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;

  @ApiProperty({
    description: 'Selected cup or portion size code',
    enum: PRODUCT_SIZE_CODES,
    example: 'M',
  })
  @IsIn(PRODUCT_SIZE_CODES)
  size: ProductSizeCode;

  @ApiPropertyOptional({
    description: 'Sugar level option for drinks',
    enum: SUGAR_LEVELS,
    example: '70',
  })
  @IsOptional()
  @IsIn(SUGAR_LEVELS)
  sugarLevel?: SugarLevel;

  @ApiPropertyOptional({
    description: 'Ice level option for drinks',
    enum: ICE_LEVELS,
    example: '70',
  })
  @IsOptional()
  @IsIn(ICE_LEVELS)
  iceLevel?: IceLevel;

  @ApiPropertyOptional({
    description: 'Optional topping IDs for drinks',
    type: [String],
    example: ['tran-chau-den'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  toppingIds?: string[];

  @ApiPropertyOptional({
    description: 'Spice level option for snacks',
    enum: SPICE_LEVELS,
    example: 'cay-vua',
  })
  @IsOptional()
  @IsIn(SPICE_LEVELS)
  spiceLevel?: SpiceLevel;
}

export class CreateOrderDto implements CreateOrderPayload {
  @ApiProperty({
    description: 'Target Ốm Sữa branch ID',
    example: 'cs1-hoang-dieu',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({
    description: 'Recipient full name',
    example: 'Nguyễn Minh Anh',
    minLength: 2,
    maxLength: 80,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 80)
  customerName: string;

  @ApiProperty({
    description: 'Vietnamese mobile or landline phone number',
    example: '0905123456',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/[\s.-]/g, '') : value,
  )
  @IsString()
  @Matches(/^0\d{9,10}$/)
  customerPhone: string;

  @ApiProperty({
    description: 'Delivery street address in Đà Lạt / Đức Trọng',
    example: '12 Khu Hòa Bình, Phường 1, Đà Lạt',
    minLength: 5,
    maxLength: 200,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(5, 200)
  deliveryAddress: string;

  @ApiPropertyOptional({
    description: 'Optional delivery or preparation note',
    example: 'Giao cổng sau giúp mình',
    maxLength: 300,
  })
  @Transform(({ value }: { value: unknown }) =>
    value === null || value === undefined
      ? undefined
      : typeof value === 'string'
        ? value.trim()
        : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;

  @ApiProperty({
    description: 'Selected payment method',
    enum: PAYMENT_METHODS,
    example: 'cod',
  })
  @IsIn(PAYMENT_METHODS)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Order line items (server resolves authoritative prices)',
    type: () => [OrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
