import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  type ApiResponse,
  type OrderRecord,
  createApiResponse,
} from '@omsua/shared';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersQueryDto } from './dto/orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new Ốm Sữa order with server-resolved catalog pricing',
  })
  @ApiCreatedResponse({ description: 'Order created successfully' })
  @ApiBadRequestResponse({
    description: 'Validation failed or product/topping unavailable',
  })
  createOrder(@Body() dto: CreateOrderDto): ApiResponse<OrderRecord> {
    return createApiResponse(this.ordersService.createOrder(dto));
  }

  @Get()
  @ApiOperation({
    summary: 'List orders newest-first with optional status and branchId filters',
  })
  @ApiOkResponse({ description: 'Orders list returned successfully' })
  @ApiBadRequestResponse({ description: 'Invalid query filter parameter' })
  listOrders(@Query() query: OrdersQueryDto): ApiResponse<OrderRecord[]> {
    return createApiResponse(this.ordersService.listOrders(query));
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update operational status of an order' })
  @ApiParam({
    name: 'id',
    description: 'Order UUID',
    example: 'f3a9d6a0-6e9e-4c4b-9e6a-2b5c4d3e2f1a',
  })
  @ApiOkResponse({ description: 'Updated order returned successfully' })
  @ApiBadRequestResponse({ description: 'Invalid order status value' })
  @ApiNotFoundResponse({ description: 'Order ID not found' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): ApiResponse<OrderRecord> {
    return createApiResponse(
      this.ordersService.updateOrderStatus(id, dto.status),
    );
  }
}
