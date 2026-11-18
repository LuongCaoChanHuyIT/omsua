import {
  ICE_LEVELS,
  SPICE_LEVELS,
  SUGAR_LEVELS,
  type IceLevel,
  type OrderItemInput,
  type OrderLineResolved,
  type OrderLineTopping,
  type OrderTotals,
  type ProductItem,
  type SpiceLevel,
  type SugarLevel,
  type ToppingItem,
} from './domain';

export class OrderValidationError extends Error {
  public readonly code: string;

  constructor(message: string, code = 'ORDER_VALIDATION_ERROR') {
    super(message);
    this.name = 'OrderValidationError';
    this.code = code;
    Object.setPrototypeOf(this, OrderValidationError.prototype);
  }
}

export function formatVnd(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  const digits = String(Math.abs(rounded));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${grouped}đ`;
}

export function formatShortPrice(amount: number): string {
  if (amount % 1000 === 0) {
    return `${amount / 1000}k`;
  }
  return formatVnd(amount);
}

function normalizeToppingIds(toppingIds?: readonly string[]): string[] {
  if (!toppingIds || toppingIds.length === 0) {
    return [];
  }
  return Array.from(new Set(toppingIds)).sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
}

function isValidSugarLevel(value: unknown): value is SugarLevel {
  return (
    typeof value === 'string' &&
    (SUGAR_LEVELS as readonly string[]).includes(value)
  );
}

function isValidIceLevel(value: unknown): value is IceLevel {
  return (
    typeof value === 'string' &&
    (ICE_LEVELS as readonly string[]).includes(value)
  );
}

function isValidSpiceLevel(value: unknown): value is SpiceLevel {
  return (
    typeof value === 'string' &&
    (SPICE_LEVELS as readonly string[]).includes(value)
  );
}

export function canonicalizeCartItemKey(item: OrderItemInput): string {
  const sortedToppings = normalizeToppingIds(item.toppingIds);
  return [
    item.productId,
    `size:${item.size}`,
    `sugar:${item.sugarLevel ?? '-'}`,
    `ice:${item.iceLevel ?? '-'}`,
    `spice:${item.spiceLevel ?? '-'}`,
    `toppings:${sortedToppings.join(',')}`,
  ].join('|');
}

export function resolveOrderLine(
  input: OrderItemInput,
  productsById: ReadonlyMap<string, ProductItem>,
  toppingsById: ReadonlyMap<string, ToppingItem>,
): OrderLineResolved {
  if (
    !input ||
    typeof input !== 'object' ||
    typeof input.productId !== 'string' ||
    input.productId.trim().length === 0
  ) {
    throw new OrderValidationError(
      'Mã món không hợp lệ.',
      'INVALID_PRODUCT_ID',
    );
  }

  if (
    typeof input.quantity !== 'number' ||
    !Number.isInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > 99
  ) {
    throw new OrderValidationError(
      'Số lượng món phải là số nguyên từ 1 đến 99.',
      'INVALID_QUANTITY',
    );
  }

  const product = productsById.get(input.productId);
  if (!product) {
    throw new OrderValidationError(
      `Không tìm thấy món "${input.productId}".`,
      'PRODUCT_NOT_FOUND',
    );
  }

  if (!product.isAvailable) {
    throw new OrderValidationError(
      `Món "${product.name}" hiện đang tạm hết.`,
      'PRODUCT_UNAVAILABLE',
    );
  }

  const sizeOption = product.sizes.find((option) => option.size === input.size);
  if (!sizeOption) {
    throw new OrderValidationError(
      `Size "${String(input.size)}" không hợp lệ cho món "${product.name}".`,
      'INVALID_SIZE',
    );
  }

  if (product.kind === 'drink') {
    if (!isValidSugarLevel(input.sugarLevel)) {
      throw new OrderValidationError(
        `Định lượng đường không hợp lệ cho món "${product.name}".`,
        'INVALID_SUGAR_LEVEL',
      );
    }

    if (!isValidIceLevel(input.iceLevel)) {
      throw new OrderValidationError(
        `Định lượng đá không hợp lệ cho món "${product.name}".`,
        'INVALID_ICE_LEVEL',
      );
    }

    if (input.spiceLevel !== undefined) {
      throw new OrderValidationError(
        `Đồ uống "${product.name}" không áp dụng tùy chọn độ cay.`,
        'INVALID_DRINK_SPICE',
      );
    }

    if (input.toppingIds !== undefined && !Array.isArray(input.toppingIds)) {
      throw new OrderValidationError(
        'Danh sách topping không hợp lệ.',
        'INVALID_TOPPINGS',
      );
    }

    const sortedToppingIds = normalizeToppingIds(input.toppingIds);
    const resolvedToppings: OrderLineTopping[] = sortedToppingIds.map(
      (toppingId) => {
        const topping = toppingsById.get(toppingId);
        if (!topping) {
          throw new OrderValidationError(
            `Topping "${toppingId}" không tồn tại.`,
            'TOPPING_NOT_FOUND',
          );
        }
        if (!topping.isAvailable) {
          throw new OrderValidationError(
            `Topping "${topping.name}" hiện đang tạm hết.`,
            'TOPPING_UNAVAILABLE',
          );
        }
        return {
          id: topping.id,
          name: topping.name,
          shortName: topping.shortName,
          price: topping.price,
        };
      },
    );

    const basePrice = sizeOption.price;
    const toppingsTotal = resolvedToppings.reduce(
      (sum, topping) => sum + topping.price,
      0,
    );
    const unitPrice = basePrice + toppingsTotal;
    const lineTotal = unitPrice * input.quantity;
    const canonicalKey = canonicalizeCartItemKey({
      productId: product.id,
      quantity: 1,
      size: sizeOption.size,
      sugarLevel: input.sugarLevel,
      iceLevel: input.iceLevel,
      toppingIds: sortedToppingIds,
    });

    return {
      canonicalKey,
      productId: product.id,
      productName: product.name,
      kind: 'drink',
      quantity: input.quantity,
      size: sizeOption.size,
      sizeLabel: sizeOption.label,
      basePrice,
      sugarLevel: input.sugarLevel,
      iceLevel: input.iceLevel,
      toppings: resolvedToppings,
      unitPrice,
      lineTotal,
    };
  }

  // product.kind === 'snack'
  if (input.toppingIds !== undefined) {
    if (!Array.isArray(input.toppingIds) || input.toppingIds.length > 0) {
      throw new OrderValidationError(
        `Món ăn vặt "${product.name}" không áp dụng thêm topping đồ uống.`,
        'SNACK_TOPPINGS_FORBIDDEN',
      );
    }
  }

  if (input.sugarLevel !== undefined || input.iceLevel !== undefined) {
    throw new OrderValidationError(
      `Món ăn vặt "${product.name}" không áp dụng tùy chọn đường/đá.`,
      'INVALID_SNACK_OPTION',
    );
  }

  if (!isValidSpiceLevel(input.spiceLevel)) {
    throw new OrderValidationError(
      `Độ cay không hợp lệ cho món "${product.name}".`,
      'INVALID_SPICE_LEVEL',
    );
  }

  const basePrice = sizeOption.price;
  const unitPrice = basePrice;
  const lineTotal = unitPrice * input.quantity;
  const canonicalKey = canonicalizeCartItemKey({
    productId: product.id,
    quantity: 1,
    size: sizeOption.size,
    spiceLevel: input.spiceLevel,
  });

  return {
    canonicalKey,
    productId: product.id,
    productName: product.name,
    kind: 'snack',
    quantity: input.quantity,
    size: sizeOption.size,
    sizeLabel: sizeOption.label,
    basePrice,
    spiceLevel: input.spiceLevel,
    toppings: [],
    unitPrice,
    lineTotal,
  };
}

export function calculateOrderTotals(
  lines: readonly OrderLineResolved[],
): OrderTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);
  return {
    subtotal,
    shippingFee: 0,
    ecoFee: 0,
    grandTotal: subtotal,
    totalItems,
  };
}

export function formatCustomizerBreakdown(line: OrderLineResolved): string {
  const sizeDescriptor =
    line.size === 'STD' ? 'Phần tiêu chuẩn' : `Size ${line.size}`;
  const sizeTerm = `${formatShortPrice(line.basePrice)} (${sizeDescriptor})`;
  const toppingTerms = line.toppings.map(
    (topping) => `${formatShortPrice(topping.price)} (${topping.shortName})`,
  );
  const perCupExpression = [sizeTerm, ...toppingTerms].join(' + ');

  if (line.quantity > 1) {
    return `(${perCupExpression}) × ${line.quantity} = ${formatVnd(line.lineTotal)}`;
  }

  return `${perCupExpression} = ${formatVnd(line.lineTotal)}`;
}
