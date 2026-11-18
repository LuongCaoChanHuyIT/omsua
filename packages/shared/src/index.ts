export { DEFAULT_API_BASE_URL, DEFAULT_PORTS } from './constants';
export type {
  ApiResponse,
  HealthFetchResult,
  HealthStatus,
} from './contracts';
export {
  createApiResponse,
  isValidHealthPayload,
  normalizeApiBaseUrl,
  requestBackendHealth,
} from './utils';
export type { HealthFetchFn } from './utils';

export { OMSUA_BRAND, OMSUA_COLORS } from './brand';
export type { OmsuaColorHex, OmsuaColorKey } from './brand';

export {
  DRINK_CATEGORY_IDS,
  ICE_LEVEL_LABELS,
  ICE_LEVELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  PRODUCT_KINDS,
  PRODUCT_SIZE_CODES,
  SPICE_LEVEL_LABELS,
  SPICE_LEVELS,
  SUGAR_LEVEL_LABELS,
  SUGAR_LEVELS,
} from './domain';
export type {
  BranchInfo,
  CatalogPayload,
  CategoryInfo,
  CreateOrderPayload,
  DrinkCategoryId,
  IceLevel,
  OrderItemInput,
  OrderLineResolved,
  OrderLineTopping,
  OrderRecord,
  OrderStatus,
  OrderTotals,
  PaymentMethod,
  ProductCategoryId,
  ProductItem,
  ProductKind,
  ProductSizeCode,
  ProductSizeOption,
  SpiceLevel,
  SugarLevel,
  ToppingItem,
} from './domain';

export {
  OMSUA_BRANCHES,
  OMSUA_CATEGORIES,
  OMSUA_PRODUCTS,
  OMSUA_TOPPINGS,
  getDefaultCatalog,
} from './seed-data';

export {
  OrderValidationError,
  calculateOrderTotals,
  canonicalizeCartItemKey,
  formatCustomizerBreakdown,
  formatShortPrice,
  formatVnd,
  resolveOrderLine,
} from './pricing';
