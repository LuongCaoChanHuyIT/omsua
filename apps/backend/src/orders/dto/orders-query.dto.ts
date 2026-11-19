import { ApiPropertyOptional } from '@nestjs/swagger';
import { ORDER_STATUSES, type OrderStatus } from '@omsua/shared';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class OrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Filter orders by operational status',
    enum: ORDER_STATUSES,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === ''
      ? undefined
      : typeof value === 'string'
        ? value.trim()
        : value,
  )
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter orders by store branch ID',
    example: 'cs1-hoang-dieu',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === ''
      ? undefined
      : typeof value === 'string'
        ? value.trim()
        : value,
  )
  @IsOptional()
  @IsString()
  branchId?: string;
}
