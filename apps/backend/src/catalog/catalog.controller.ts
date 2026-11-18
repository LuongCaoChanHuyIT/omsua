import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  type ApiResponse,
  type BranchInfo,
  type CatalogPayload,
  type ProductItem,
  createApiResponse,
} from '@omsua/shared';
import { CatalogService } from './catalog.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('catalog')
  @ApiTags('catalog')
  @ApiOperation({
    summary: 'Get full Ốm Sữa menu catalog (categories, products, toppings)',
  })
  @ApiOkResponse({ description: 'Full catalog returned successfully' })
  getCatalog(): ApiResponse<CatalogPayload> {
    return createApiResponse(this.catalogService.getCatalog());
  }

  @Patch('catalog/products/:id/availability')
  @ApiTags('catalog')
  @ApiOperation({ summary: 'Update availability status of a menu product' })
  @ApiParam({
    name: 'id',
    description: 'Product slug ID',
    example: 'tra-sua-atiso',
  })
  @ApiOkResponse({ description: 'Updated product returned successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiNotFoundResponse({ description: 'Product ID not found' })
  updateProductAvailability(
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ): ApiResponse<ProductItem> {
    return createApiResponse(
      this.catalogService.setProductAvailability(id, dto.isAvailable),
    );
  }

  @Get('branches')
  @ApiTags('branches')
  @ApiOperation({ summary: 'Get all Ốm Sữa store branches' })
  @ApiOkResponse({ description: 'Branch list returned successfully' })
  getBranches(): ApiResponse<BranchInfo[]> {
    return createApiResponse(this.catalogService.getBranches());
  }
}
