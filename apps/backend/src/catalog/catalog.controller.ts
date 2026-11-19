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
import {
  BranchesResponseDto,
  CatalogResponseDto,
  HttpErrorResponseDto,
  ProductItemResponseDto,
} from '../common/swagger-models.dto';
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
  @ApiOkResponse({
    type: CatalogResponseDto,
    description: 'Full catalog returned successfully',
  })
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
  @ApiOkResponse({
    type: ProductItemResponseDto,
    description: 'Updated product returned successfully',
  })
  @ApiBadRequestResponse({
    type: HttpErrorResponseDto,
    description: 'Invalid request body',
  })
  @ApiNotFoundResponse({
    type: HttpErrorResponseDto,
    description: 'Product ID not found',
  })
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
  @ApiOkResponse({
    type: BranchesResponseDto,
    description: 'Branch list returned successfully',
  })
  getBranches(): ApiResponse<BranchInfo[]> {
    return createApiResponse(this.catalogService.getBranches());
  }
}
