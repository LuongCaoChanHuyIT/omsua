import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DRINK_CATEGORY_IDS,
  ICE_LEVELS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PRODUCT_KINDS,
  PRODUCT_SIZE_CODES,
  SPICE_LEVELS,
  SUGAR_LEVELS,
  type ApiResponse,
  type BranchInfo,
  type CatalogPayload,
  type CategoryInfo,
  type DrinkCategoryId,
  type HealthStatus,
  type IceLevel,
  type OrderLineResolved,
  type OrderLineTopping,
  type OrderRecord,
  type OrderStatus,
  type PaymentMethod,
  type ProductCategoryId,
  type ProductItem,
  type ProductKind,
  type ProductSizeCode,
  type ProductSizeOption,
  type SpiceLevel,
  type SugarLevel,
  type ToppingItem,
} from '@omsua/shared';

const PRODUCT_CATEGORY_IDS: readonly ProductCategoryId[] = [
  ...DRINK_CATEGORY_IDS,
  'snack',
];

export class HttpErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Human-readable validation or domain error message(s)',
    oneOf: [
      { type: 'string', example: 'Dữ liệu đầu vào không hợp lệ.' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['customerName must be longer than or equal to 2 characters'],
      },
    ],
  })
  message: string | string[];

  @ApiProperty({
    description: 'HTTP status label',
    example: 'Bad Request',
  })
  error: string;
}

export class HealthStatusDto implements HealthStatus {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  status: 'ok';

  @ApiProperty({ example: 'omsua-backend' })
  service: string;

  @ApiProperty({ example: '0.1.0' })
  version: string;

  @ApiProperty({ example: 42.15 })
  uptime: number;

  @ApiProperty({ example: 'development' })
  environment: string;
}

export class HealthResponseDto implements ApiResponse<HealthStatusDto> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => HealthStatusDto })
  data: HealthStatusDto;

  @ApiProperty({ example: '2026-11-19T01:52:08.000Z' })
  timestamp: string;
}

export class CategoryInfoDto implements CategoryInfo {
  @ApiProperty({ enum: DRINK_CATEGORY_IDS, example: 'milk-tea' })
  id: DrinkCategoryId;

  @ApiProperty({ example: 1 })
  index: number;

  @ApiProperty({ example: '1. TRÀ SỮA ĐÀ LẠT (MILK TEA)' })
  title: string;

  @ApiProperty({ example: 'Trà Sữa' })
  shortLabel: string;

  @ApiProperty({
    example:
      'Nền trà nguyên lá ủ chậm kết hợp Atiso xanh, gạo rang & kem phô mai thủ công',
  })
  subtitle: string;

  @ApiProperty({ example: '#F4E3AD' })
  accentBg: string;
}

export class ProductSizeOptionDto implements ProductSizeOption {
  @ApiProperty({ enum: PRODUCT_SIZE_CODES, example: 'M' })
  size: ProductSizeCode;

  @ApiProperty({ example: 'Size M (Chuẩn)' })
  label: string;

  @ApiProperty({ example: 45000 })
  price: number;
}

export class ProductItemDto implements ProductItem {
  @ApiProperty({ example: 'tra-sua-atiso' })
  id: string;

  @ApiProperty({ enum: PRODUCT_KINDS, example: 'drink' })
  kind: ProductKind;

  @ApiProperty({ enum: PRODUCT_CATEGORY_IDS, example: 'milk-tea' })
  categoryId: ProductCategoryId;

  @ApiProperty({ example: 'Trà Sữa Atiso' })
  name: string;

  @ApiProperty({ example: 'Artichoke Milk Tea' })
  englishName: string;

  @ApiProperty({
    example: 'Bông atiso Đà Lạt nấu chậm hoà quyện hồng trà sữa béo thanh.',
  })
  description: string;

  @ApiProperty({ type: () => [ProductSizeOptionDto] })
  sizes: ProductSizeOptionDto[];

  @ApiProperty({ example: true })
  isSignature: boolean;

  @ApiProperty({ example: true })
  isBestSeller: boolean;

  @ApiProperty({ example: false })
  isNew: boolean;

  @ApiProperty({ example: true })
  isSpotlight: boolean;

  @ApiProperty({ example: true })
  isAvailable: boolean;
}

export class ToppingItemDto implements ToppingItem {
  @ApiProperty({ example: 'tran-chau-den' })
  id: string;

  @ApiProperty({ example: 'Trân châu đen nấu mật' })
  name: string;

  @ApiProperty({ example: 'Trân châu đen' })
  shortName: string;

  @ApiProperty({ example: 10000 })
  price: number;

  @ApiProperty({ example: true })
  isAvailable: boolean;
}

export class CatalogPayloadDto implements CatalogPayload {
  @ApiProperty({ type: () => [CategoryInfoDto] })
  categories: CategoryInfoDto[];

  @ApiProperty({ type: () => [ProductItemDto] })
  products: ProductItemDto[];

  @ApiProperty({ type: () => [ToppingItemDto] })
  toppings: ToppingItemDto[];
}

export class CatalogResponseDto implements ApiResponse<CatalogPayloadDto> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => CatalogPayloadDto })
  data: CatalogPayloadDto;

  @ApiProperty({ example: '2026-11-19T01:52:08.000Z' })
  timestamp: string;
}

export class ProductItemResponseDto implements ApiResponse<ProductItemDto> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => ProductItemDto })
  data: ProductItemDto;

  @ApiProperty({ example: '2026-11-19T01:52:08.000Z' })
  timestamp: string;
}

export class BranchInfoDto implements BranchInfo {
  @ApiProperty({ example: 'cs1-hoang-dieu' })
  id: string;

  @ApiProperty({ example: 'Cơ sở 1 — Hoàng Diệu' })
  name: string;

  @ApiProperty({ example: '28A Hoàng Diệu, Phường Cam Ly, TP. Đà Lạt, Lâm Đồng' })
  address: string;

  @ApiProperty({ example: '28A Hoàng Diệu, ĐL' })
  shortLabel: string;

  @ApiProperty({ example: '0945 396 117' })
  hotline: string;
}

export class BranchesResponseDto implements ApiResponse<BranchInfoDto[]> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => [BranchInfoDto] })
  data: BranchInfoDto[];

  @ApiProperty({ example: '2026-11-19T01:52:08.000Z' })
  timestamp: string;
}

export class OrderLineToppingDto implements OrderLineTopping {
  @ApiProperty({ example: 'tran-chau-den' })
  id: string;

  @ApiProperty({ example: 'Trân châu đen nấu mật' })
  name: string;

  @ApiProperty({ example: 'Trân châu đen' })
  shortName: string;

  @ApiProperty({ example: 10000 })
  price: number;
}

export class OrderLineResolvedDto implements OrderLineResolved {
  @ApiProperty({
    example:
      'tra-sua-atiso|size:M|sugar:70|ice:70|spice:-|toppings:tran-chau-den',
  })
  canonicalKey: string;

  @ApiProperty({ example: 'tra-sua-atiso' })
  productId: string;

  @ApiProperty({ example: 'Trà Sữa Atiso' })
  productName: string;

  @ApiProperty({ enum: PRODUCT_KINDS, example: 'drink' })
  kind: ProductKind;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ enum: PRODUCT_SIZE_CODES, example: 'M' })
  size: ProductSizeCode;

  @ApiProperty({ example: 'Size M (Chuẩn)' })
  sizeLabel: string;

  @ApiProperty({ example: 45000 })
  basePrice: number;

  @ApiPropertyOptional({ enum: SUGAR_LEVELS, example: '70' })
  sugarLevel?: SugarLevel;

  @ApiPropertyOptional({ enum: ICE_LEVELS, example: '70' })
  iceLevel?: IceLevel;

  @ApiPropertyOptional({ enum: SPICE_LEVELS, example: 'cay-vua' })
  spiceLevel?: SpiceLevel;

  @ApiProperty({ type: () => [OrderLineToppingDto] })
  toppings: OrderLineToppingDto[];

  @ApiProperty({ example: 55000 })
  unitPrice: number;

  @ApiProperty({ example: 55000 })
  lineTotal: number;
}

export class OrderRecordDto implements OrderRecord {
  @ApiProperty({ example: 'f3a9d6a0-6e9e-4c4b-9e6a-2b5c4d3e2f1a' })
  id: string;

  @ApiProperty({ example: 'OM-20261119-AB12' })
  orderCode: string;

  @ApiProperty({ example: 'cs1-hoang-dieu' })
  branchId: string;

  @ApiProperty({ example: 'Cơ sở 1 — Hoàng Diệu' })
  branchName: string;

  @ApiProperty({ example: 'Nguyễn Minh Anh' })
  customerName: string;

  @ApiProperty({ example: '0905123456' })
  customerPhone: string;

  @ApiProperty({ example: '12 Khu Hòa Bình, Phường 1, Đà Lạt' })
  deliveryAddress: string;

  @ApiPropertyOptional({ example: 'Giao trước 16h giúp mình' })
  note?: string;

  @ApiProperty({ enum: PAYMENT_METHODS, example: 'cod' })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: ORDER_STATUSES, example: 'pending' })
  status: OrderStatus;

  @ApiProperty({ type: () => [OrderLineResolvedDto] })
  items: OrderLineResolvedDto[];

  @ApiProperty({ example: 95000 })
  subtotal: number;

  @ApiProperty({ example: 0 })
  shippingFee: number;

  @ApiProperty({ example: 0 })
  ecoFee: number;

  @ApiProperty({ example: 95000 })
  grandTotal: number;

  @ApiProperty({ example: 2 })
  totalItems: number;

  @ApiProperty({ example: '2026-11-19T01:52:08.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-11-19T01:52:08.000Z' })
  updatedAt: string;
}

export class OrderResponseDto implements ApiResponse<OrderRecordDto> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => OrderRecordDto })
  data: OrderRecordDto;

  @ApiProperty({ example: '2026-11-19T01:52:08.000Z' })
  timestamp: string;
}

export class OrdersListResponseDto implements ApiResponse<OrderRecordDto[]> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => [OrderRecordDto] })
  data: OrderRecordDto[];

  @ApiProperty({ example: '2026-11-19T01:52:08.000Z' })
  timestamp: string;
}
