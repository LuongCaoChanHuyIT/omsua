export const DRINK_CATEGORY_IDS = [
  'milk-tea',
  'fruit-tea',
  'fresh-milk-blended',
  'coffee',
] as const;
export type DrinkCategoryId = (typeof DRINK_CATEGORY_IDS)[number];

export const PRODUCT_KINDS = ['drink', 'snack'] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export type ProductCategoryId = DrinkCategoryId | 'snack';

export const PRODUCT_SIZE_CODES = ['S', 'M', 'L', 'STD'] as const;
export type ProductSizeCode = (typeof PRODUCT_SIZE_CODES)[number];

export const SUGAR_LEVELS = ['70', '50', '30', '0'] as const;
export type SugarLevel = (typeof SUGAR_LEVELS)[number];

export const ICE_LEVELS = ['70', '50', '30', '0'] as const;
export type IceLevel = (typeof ICE_LEVELS)[number];

export const SPICE_LEVELS = ['cay-nhieu', 'cay-vua', 'it-cay'] as const;
export type SpiceLevel = (typeof SPICE_LEVELS)[number];

export const PAYMENT_METHODS = ['cod', 'qr'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_STATUSES = [
  'pending',
  'preparing',
  'delivering',
  'completed',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const SUGAR_LEVEL_LABELS: Record<SugarLevel, string> = {
  '70': '70% Chuẩn',
  '50': '50% Vừa',
  '30': '30% Ít',
  '0': '0% Không',
};

export const ICE_LEVEL_LABELS: Record<IceLevel, string> = {
  '70': '70% Đá',
  '50': '50% Đá',
  '30': '30% Ít đá',
  '0': '0% Đá riêng',
};

export const SPICE_LEVEL_LABELS: Record<SpiceLevel, string> = {
  'cay-nhieu': 'Cay nhiều',
  'cay-vua': 'Cay vừa',
  'it-cay': 'Ít cay',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: 'Tiền mặt (COD)',
  qr: 'Chuyển khoản QR',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  preparing: 'Đang pha chế',
  delivering: 'Đang giao hàng',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

export interface CategoryInfo {
  id: DrinkCategoryId;
  index: number;
  title: string;
  shortLabel: string;
  subtitle: string;
  accentBg: string;
}

export interface ProductSizeOption {
  size: ProductSizeCode;
  label: string;
  price: number;
}

export interface ProductItem {
  id: string;
  kind: ProductKind;
  categoryId: ProductCategoryId;
  name: string;
  englishName: string;
  description: string;
  sizes: ProductSizeOption[];
  isSignature: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isSpotlight: boolean;
  isAvailable: boolean;
}

export interface ToppingItem {
  id: string;
  name: string;
  shortName: string;
  price: number;
  isAvailable: boolean;
}

export interface BranchInfo {
  id: string;
  name: string;
  address: string;
  shortLabel: string;
  hotline: string;
}

export interface CatalogPayload {
  categories: CategoryInfo[];
  products: ProductItem[];
  toppings: ToppingItem[];
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  size: ProductSizeCode;
  sugarLevel?: SugarLevel;
  iceLevel?: IceLevel;
  toppingIds?: string[];
  spiceLevel?: SpiceLevel;
}

export interface OrderLineTopping {
  id: string;
  name: string;
  shortName: string;
  price: number;
}

export interface OrderLineResolved {
  canonicalKey: string;
  productId: string;
  productName: string;
  kind: ProductKind;
  quantity: number;
  size: ProductSizeCode;
  sizeLabel: string;
  basePrice: number;
  sugarLevel?: SugarLevel;
  iceLevel?: IceLevel;
  spiceLevel?: SpiceLevel;
  toppings: OrderLineTopping[];
  unitPrice: number;
  lineTotal: number;
}

export interface OrderTotals {
  subtotal: number;
  shippingFee: 0;
  ecoFee: 0;
  grandTotal: number;
  totalItems: number;
}

export interface CreateOrderPayload {
  branchId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  note?: string;
  paymentMethod: PaymentMethod;
  items: OrderItemInput[];
}

export interface OrderRecord {
  id: string;
  orderCode: string;
  branchId: string;
  branchName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  note?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderLineResolved[];
  subtotal: number;
  shippingFee: number;
  ecoFee: number;
  grandTotal: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}
