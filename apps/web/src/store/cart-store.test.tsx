// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { OMSUA_BRANCHES, getDefaultCatalog } from '@omsua/shared';
import { act, cleanup, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CartProvider, useCart } from './cart-store';

describe('CartProvider & useCart store', () => {
  const catalog = getDefaultCatalog();

  function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <CartProvider catalog={catalog} branches={OMSUA_BRANCHES}>
          {children}
        </CartProvider>
      );
    };
  }

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('merges identical drink customizations regardless of topping click order and keeps 50% sugar separate', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem({
        productId: 'tra-sua-atiso',
        quantity: 1,
        size: 'M',
        sugarLevel: '70',
        iceLevel: '70',
        toppingIds: ['khuc-bach', 'tran-chau-den'],
      });
    });

    act(() => {
      result.current.addItem({
        productId: 'tra-sua-atiso',
        quantity: 1,
        size: 'M',
        sugarLevel: '70',
        iceLevel: '70',
        toppingIds: ['tran-chau-den', 'khuc-bach'],
      });
    });

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0]?.quantity).toBe(2);
    expect(result.current.lines[0]?.unitPrice).toBe(65000);
    expect(result.current.lines[0]?.lineTotal).toBe(130000);
    expect(result.current.totals.totalItems).toBe(2);
    expect(result.current.totals.grandTotal).toBe(130000);

    act(() => {
      result.current.addItem({
        productId: 'tra-sua-atiso',
        quantity: 1,
        size: 'M',
        sugarLevel: '50',
        iceLevel: '70',
        toppingIds: ['tran-chau-den', 'khuc-bach'],
      });
    });

    expect(result.current.lines).toHaveLength(2);
    expect(result.current.lines[0]?.sugarLevel).toBe('70');
    expect(result.current.lines[0]?.quantity).toBe(2);
    expect(result.current.lines[0]?.lineTotal).toBe(130000);
    expect(result.current.lines[1]?.sugarLevel).toBe('50');
    expect(result.current.lines[1]?.quantity).toBe(1);
    expect(result.current.lines[1]?.lineTotal).toBe(65000);
    expect(result.current.totals.totalItems).toBe(3);
    expect(result.current.totals.subtotal).toBe(195000);
    expect(result.current.totals.grandTotal).toBe(195000);
  });

  it('recovers cleanly from corrupted localStorage JSON without throwing and defaults to cs1-hoang-dieu', () => {
    window.localStorage.setItem('omsua.cart.v1', '{broken-json');

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.lines).toEqual([]);
    expect(result.current.totals.totalItems).toBe(0);
    expect(result.current.totals.grandTotal).toBe(0);
    expect(result.current.selectedBranch.id).toBe('cs1-hoang-dieu');
  });

  it('hydrates valid persisted items & branch while filtering invalid entries, and supports quantity/remove/clear actions', () => {
    window.localStorage.setItem(
      'omsua.cart.v1',
      JSON.stringify({
        selectedBranchId: 'cs4-duc-trong',
        items: [
          {
            productId: 'banh-trang-tron-top-mo',
            quantity: 2,
            size: 'STD',
            spiceLevel: 'cay-vua',
          },
          {
            productId: 'non-existent-item',
            quantity: 1,
            size: 'M',
          },
        ],
      }),
    );

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.selectedBranch.id).toBe('cs4-duc-trong');
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0]?.productId).toBe('banh-trang-tron-top-mo');
    expect(result.current.lines[0]?.lineTotal).toBe(80000);

    const key = result.current.lines[0]!.canonicalKey;
    act(() => {
      result.current.updateQuantity(key, 3);
    });
    expect(result.current.lines[0]?.quantity).toBe(3);
    expect(result.current.lines[0]?.lineTotal).toBe(120000);

    act(() => {
      result.current.setSelectedBranchId('cs2-hem-33-nct');
    });
    expect(result.current.selectedBranch.id).toBe('cs2-hem-33-nct');

    act(() => {
      result.current.updateQuantity(key, 0);
    });
    expect(result.current.lines).toHaveLength(0);

    act(() => {
      result.current.addItem({
        productId: 'ca-phe-muoi',
        quantity: 1,
        size: 'S',
        sugarLevel: '50',
        iceLevel: '70',
        toppingIds: [],
      });
    });
    expect(result.current.lines).toHaveLength(1);

    act(() => {
      result.current.clearCart();
    });
    expect(result.current.lines).toHaveLength(0);
    expect(result.current.totals.grandTotal).toBe(0);
  });

  it('surfaces unavailableItems when a product or selected topping turns isAvailable: false and clears them via removeUnavailableItems()', () => {
    let activeCatalog = getDefaultCatalog();

    const { result, rerender } = renderHook(() => useCart(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <CartProvider catalog={activeCatalog} branches={OMSUA_BRANCHES}>
          {children}
        </CartProvider>
      ),
    });

    act(() => {
      result.current.addItem({
        productId: 'tra-sua-atiso',
        quantity: 2,
        size: 'M',
        sugarLevel: '70',
        iceLevel: '70',
        toppingIds: ['khuc-bach'],
      });
      result.current.addItem({
        productId: 'banh-trang-tron-top-mo',
        quantity: 1,
        size: 'STD',
        spiceLevel: 'cay-vua',
      });
    });

    expect(result.current.lines).toHaveLength(2);
    expect(result.current.unavailableItems).toEqual([]);

    // Mark tra-sua-atiso unavailable mid-session
    activeCatalog = {
      ...activeCatalog,
      products: activeCatalog.products.map((product) =>
        product.id === 'tra-sua-atiso'
          ? { ...product, isAvailable: false }
          : product,
      ),
    };
    rerender();

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0]?.productId).toBe('banh-trang-tron-top-mo');
    expect(result.current.totals.totalItems).toBe(1);
    expect(result.current.totals.grandTotal).toBe(40000);
    expect(result.current.unavailableItems).toHaveLength(1);
    expect(result.current.unavailableItems[0]).toMatchObject({
      productId: 'tra-sua-atiso',
      productName: 'Trà Sữa Atiso',
      quantity: 2,
      reason: 'Món "Trà Sữa Atiso" hiện đang tạm hết.',
    });

    // Restore product, mark topping khuc-bach unavailable instead
    activeCatalog = {
      ...getDefaultCatalog(),
      toppings: getDefaultCatalog().toppings.map((topping) =>
        topping.id === 'khuc-bach'
          ? { ...topping, isAvailable: false }
          : topping,
      ),
    };
    rerender();

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.unavailableItems).toHaveLength(1);
    expect(result.current.unavailableItems[0]).toMatchObject({
      productId: 'tra-sua-atiso',
      productName: 'Trà Sữa Atiso',
      quantity: 2,
      reason: 'Topping "Khúc bạch hạnh nhân" hiện đang tạm hết.',
    });

    act(() => {
      result.current.removeUnavailableItems();
    });

    expect(result.current.unavailableItems).toEqual([]);
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0]?.productId).toBe('banh-trang-tron-top-mo');
    expect(result.current.totals.grandTotal).toBe(40000);
  });
});
