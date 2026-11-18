import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUSES, type OrderStatus } from '@omsua/shared';
import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Updated operational status for the order',
    enum: ORDER_STATUSES,
    example: 'preparing',
  })
  @IsIn(['pending', 'preparing', 'delivering', 'completed', 'cancelled'])
  status: OrderStatus;
}
