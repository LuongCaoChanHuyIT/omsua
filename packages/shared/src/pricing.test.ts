import { describe, expect, it } from 'vitest';
import {
  OMSUA_BRANCHES,
  OMSUA_CATEGORIES,
  OMSUA_COLORS,
  OMSUA_PRODUCTS,
  OMSUA_TOPPINGS,
  OrderValidationError,
  calculateOrderTotals,
  canonicalizeCartItemKey,
  formatCustomizerBreakdown,
  formatShortPrice,
  formatVnd,
  getDefaultCatalog,
  resolveOrderLine,
} from './index';
import type { OrderItemInput } from './index';

describe('@omsua/shared domain catalog & pricing engine', () => {
  const catalog = getDefaultCatalog();
  const productsById = new Map(catalog.products.map((p) => [p.id, p]));
  const toppingsById = new Map(catalog.toppings.map((t) => [t.id, t]));

  it('contains exact Figma counts: 4 categories, 24 drinks, 6 snacks, 8 toppings, 4 branches, and 14 non-pure-BW colors', () => {
    expect(catalog.categories).toHaveLength(4);
    expect(OMSUA_CATEGORIES).toHaveLength(4);
    expect(OMSUA_PRODUCTS.filter((p) => p.kind === 'drink')).toHaveLength(24);
    expect(OMSUA_PRODUCTS.filter((p) => p.kind === 'snack')).toHaveLength(6);
    expect(OMSUA_TOPPINGS).toHaveLength(8);
    expect(OMSUA_BRANCHES).toHaveLength(4);
    const hexes = Object.values(OMSUA_COLORS).map((h) => h.toUpperCase());
    expect(hexes).toHaveLength(14);
    expect(hexes).not.toContain('#FFFFFF');
    expect(hexes).not.toContain('#000000');
  });

  it('has 6 drinks per category and unique IDs across products, toppings, and branches', () => {
    for (const category of catalog.categories) {
      const count = catalog.products.filter(
        (p) => p.kind === 'drink' && p.categoryId === category.id,
      ).length;
      expect(count).toBe(6);
    }
    expect(new Set(OMSUA_PRODUCTS.map((p) => p.id)).size).toBe(30);
    expect(new Set(OMSUA_TOPPINGS.map((t) => t.id)).size).toBe(8);
    expect(new Set(OMSUA_BRANCHES.map((b) => b.id)).size).toBe(4);
  });

  it('returns defensive copies from getDefaultCatalog()', () => {
    const first = getDefaultCatalog();
    first.products[0]!.isAvailable = false;
    first.products[0]!.sizes[0]!.price = 999999;
    const second = getDefaultCatalog();
    expect(second.products[0]!.isAvailable).toBe(true);
    expect(second.products[0]!.sizes[0]!.price).toBe(45000);
  });

  it('formats VND and short prices deterministically', () => {
    expect(formatVnd(0)).toBe('0đ');
    expect(formatVnd(45000)).toBe('45.000đ');
    expect(formatVnd(1250000)).toBe('1.250.000đ');
    expect(formatShortPrice(0)).toBe('0đ');
    expect(formatShortPrice(45000)).toBe('45k');
    expect(formatShortPrice(10000)).toBe('10k');
  });

  it('resolves Figma Sheet 02 Trà Sữa Atiso example (Size M 45k + Trân châu đen 10k + Khúc bạch 10k = 65.000đ)', () => {
    const line = resolveOrderLine(
      {
        productId: 'tra-sua-atiso',
        quantity: 1,
        size: 'M',
        sugarLevel: '70',
        iceLevel: '70',
        toppingIds: ['khuc-bach', 'tran-chau-den'],
      },
      productsById,
      toppingsById,
    );
    expect(line.unitPrice).toBe(65000);
    expect(line.lineTotal).toBe(65000);
    expect(line.toppings).toEqual([
      {
        id: 'khuc-bach',
        name: 'Khúc bạch hạnh nhân',
        shortName: 'Khúc bạch',
        price: 10000,
      },
      {
        id: 'tran-chau-den',
        name: 'Trân châu đen nấu mật',
        shortName: 'Trân châu đen',
        price: 10000,
      },
    ]);
    expect(formatVnd(line.lineTotal)).toBe('65.000đ');
    expect(formatCustomizerBreakdown(line)).toBe(
      '45k (Size M) + 10k (Khúc bạch) + 10k (Trân châu đen) = 65.000đ',
    );
  });

  it('deduplicates repeated toppingIds and formats multi-cup breakdown with × quantity', () => {
    const line = resolveOrderLine(
      {
        productId: 'tra-sua-atiso',
        quantity: 2,
        size: 'M',
        sugarLevel: '70',
        iceLevel: '70',
        toppingIds: ['tran-chau-den', 'khuc-bach', 'tran-chau-den'],
      },
      productsById,
      toppingsById,
    );
    expect(line.unitPrice).toBe(65000);
    expect(line.lineTotal).toBe(130000);
    expect(formatCustomizerBreakdown(line)).toBe(
      '(45k (Size M) + 10k (Khúc bạch) + 10k (Trân châu đen)) × 2 = 130.000đ',
    );
  });

  it('computes Figma Sheet 02 2-item cart total (Trà Sữa Atiso 55k + Bánh Tráng Trộn Tóp Mỡ 40k = 95.000đ)', () => {
    const drink = resolveOrderLine(
      {
        productId: 'tra-sua-atiso',
        quantity: 1,
        size: 'M',
        sugarLevel: '70',
        iceLevel: '70',
        toppingIds: ['tran-chau-den'],
      },
      productsById,
      toppingsById,
    );
    const snack = resolveOrderLine(
      {
        productId: 'banh-trang-tron-top-mo',
        quantity: 1,
        size: 'STD',
        spiceLevel: 'cay-vua',
      },
      productsById,
      toppingsById,
    );
    expect(calculateOrderTotals([drink, snack])).toEqual({
      subtotal: 95000,
      shippingFee: 0,
      ecoFee: 0,
      grandTotal: 95000,
      totalItems: 2,
    });
    expect(formatCustomizerBreakdown(snack)).toBe(
      '40k (Phần tiêu chuẩn) = 40.000đ',
    );
  });

  it('produces identical canonical keys regardless of topping selection order while distinguishing different options', () => {
    const keyA = canonicalizeCartItemKey({
      productId: 'tra-sua-atiso',
      quantity: 1,
      size: 'M',
      sugarLevel: '70',
      iceLevel: '70',
      toppingIds: ['khuc-bach', 'tran-chau-den'],
    });
    const keyB = canonicalizeCartItemKey({
      productId: 'tra-sua-atiso',
      quantity: 3,
      size: 'M',
      sugarLevel: '70',
      iceLevel: '70',
      toppingIds: ['tran-chau-den', 'khuc-bach'],
    });
    const keyDifferentSugar = canonicalizeCartItemKey({
      productId: 'tra-sua-atiso',
      quantity: 1,
      size: 'M',
      sugarLevel: '50',
      iceLevel: '70',
      toppingIds: ['khuc-bach', 'tran-chau-den'],
    });
    expect(keyA).toBe(keyB);
    expect(keyA).not.toBe(keyDifferentSugar);
  });

  it('rejects unavailable items, invalid quantities, invalid drink/snack options, and toppings on snacks', () => {
    // Invalid size on Size L-only drink
    expect(() =>
      resolveOrderLine(
        {
          productId: 'quyt-nhai-cat-tuong',
          quantity: 1,
          size: 'M',
          sugarLevel: '70',
          iceLevel: '70',
        },
        productsById,
        toppingsById,
      ),
    ).toThrow(OrderValidationError);

    // Toppings on snack prohibited
    expect(() =>
      resolveOrderLine(
        {
          productId: 'banh-trang-tron-top-mo',
          quantity: 1,
          size: 'STD',
          spiceLevel: 'cay-vua',
          toppingIds: ['tran-chau-den'],
        },
        productsById,
        toppingsById,
      ),
    ).toThrow(OrderValidationError);

    // Unavailable product
    const soldOutMap = new Map(productsById);
    soldOutMap.set('tra-sua-atiso', {
      ...productsById.get('tra-sua-atiso')!,
      isAvailable: false,
    });
    expect(() =>
      resolveOrderLine(
        {
          productId: 'tra-sua-atiso',
          quantity: 1,
          size: 'M',
          sugarLevel: '70',
          iceLevel: '70',
        },
        soldOutMap,
        toppingsById,
      ),
    ).toThrow(OrderValidationError);

    // Unavailable topping
    const soldOutToppings = new Map(toppingsById);
    soldOutToppings.set('khuc-bach', {
      ...toppingsById.get('khuc-bach')!,
      isAvailable: false,
    });
    expect(() =>
      resolveOrderLine(
        {
          productId: 'tra-sua-atiso',
          quantity: 1,
          size: 'M',
          sugarLevel: '70',
          iceLevel: '70',
          toppingIds: ['khuc-bach'],
        },
        productsById,
        soldOutToppings,
      ),
    ).toThrow(OrderValidationError);

    // Invalid quantities (0, negative, float, > 99)
    for (const badQty of [0, -1, 1.5, 100]) {
      expect(() =>
        resolveOrderLine(
          {
            productId: 'tra-sua-atiso',
            quantity: badQty,
            size: 'M',
            sugarLevel: '70',
            iceLevel: '70',
          },
          productsById,
          toppingsById,
        ),
      ).toThrow(OrderValidationError);
    }

    // Missing sugar/ice on drink
    expect(() =>
      resolveOrderLine(
        {
          productId: 'tra-sua-atiso',
          quantity: 1,
          size: 'M',
          iceLevel: '70',
        } as OrderItemInput,
        productsById,
        toppingsById,
      ),
    ).toThrow(OrderValidationError);

    // Missing spiceLevel on snack
    expect(() =>
      resolveOrderLine(
        {
          productId: 'banh-trang-tron-top-mo',
          quantity: 1,
          size: 'STD',
        } as OrderItemInput,
        productsById,
        toppingsById,
      ),
    ).toThrow(OrderValidationError);

    // Unknown product & unknown topping
    expect(() =>
      resolveOrderLine(
        {
          productId: 'unknown-drink',
          quantity: 1,
          size: 'M',
          sugarLevel: '70',
          iceLevel: '70',
        },
        productsById,
        toppingsById,
      ),
    ).toThrow(OrderValidationError);

    expect(() =>
      resolveOrderLine(
        {
          productId: 'tra-sua-atiso',
          quantity: 1,
          size: 'M',
          sugarLevel: '70',
          iceLevel: '70',
          toppingIds: ['unknown-topping'],
        },
        productsById,
        toppingsById,
      ),
    ).toThrow(OrderValidationError);
  });
});
