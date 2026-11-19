// @vitest-environment jsdom
import type { OrderRecord } from '@omsua/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RECENT_ORDERS_STORAGE_KEY,
  readRecentOrders,
  saveRecentOrder,
} from './recent-orders';

function makeOrder(
  index: number,
  overrides: Partial<OrderRecord> = {},
): OrderRecord {
  const padded = String(index).padStart(4, '0');
  return {
    id: `ord-${index}`,
    orderCode: `OM-20261119-${padded}`,
    branchId: 'cs1-hoang-dieu',
    branchName: 'Cơ sở 1 — Hoàng Diệu',
    customerName: 'Nguyễn Minh Thư',
    customerPhone: '0945396117',
    deliveryAddress: '12 Trần Phú, Đà Lạt',
    paymentMethod: 'cod',
    status: 'pending',
    items: [],
    subtotal: 55000,
    shippingFee: 0,
    ecoFee: 0,
    grandTotal: 55000,
    totalItems: 1,
    createdAt: `2026-11-19T02:${String(index % 60).padStart(2, '0')}:00.000Z`,
    updatedAt: `2026-11-19T02:${String(index % 60).padStart(2, '0')}:00.000Z`,
    ...overrides,
  };
}

describe('recent-orders storage (omsua.recentOrders.v1)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves order summaries newest-first, deduplicates by orderCode, and caps at 10 entries', () => {
    expect(RECENT_ORDERS_STORAGE_KEY).toBe('omsua.recentOrders.v1');
    expect(readRecentOrders()).toEqual([]);

    for (let i = 1; i <= 12; i += 1) {
      saveRecentOrder(makeOrder(i));
    }

    const afterTwelve = readRecentOrders();
    expect(afterTwelve).toHaveLength(10);
    expect(afterTwelve[0]?.orderCode).toBe('OM-20261119-0012');
    expect(afterTwelve[9]?.orderCode).toBe('OM-20261119-0003');

    // Re-saving an existing orderCode updates its status and moves it to newest without duplicating
    const updatedList = saveRecentOrder(
      makeOrder(5, { status: 'delivering', paymentMethod: 'qr' }),
    );
    expect(updatedList).toHaveLength(10);
    expect(updatedList[0]).toMatchObject({
      orderCode: 'OM-20261119-0005',
      status: 'delivering',
      paymentMethod: 'qr',
      grandTotal: 55000,
      totalItems: 1,
    });
    expect(
      updatedList.filter((item) => item.orderCode === 'OM-20261119-0005'),
    ).toHaveLength(1);
  });

  it('recovers gracefully from malformed JSON, invalid entries, and localStorage SecurityError', () => {
    window.localStorage.setItem(RECENT_ORDERS_STORAGE_KEY, '{corrupted-json');
    expect(readRecentOrders()).toEqual([]);

    window.localStorage.setItem(
      RECENT_ORDERS_STORAGE_KEY,
      JSON.stringify([
        null,
        { orderCode: 'MISSING_FIELDS' },
        {
          orderCode: 'OM-20261119-8888',
          branchName: 'Cơ sở 4 — Đức Trọng',
          grandTotal: 80000,
          totalItems: 2,
          paymentMethod: 'qr',
          status: 'completed',
          createdAt: '2026-11-19T03:00:00.000Z',
        },
      ]),
    );

    const sanitized = readRecentOrders();
    expect(sanitized).toHaveLength(1);
    expect(sanitized[0]?.orderCode).toBe('OM-20261119-8888');

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    expect(() => readRecentOrders()).not.toThrow();
    expect(readRecentOrders()).toEqual([]);
    expect(() => saveRecentOrder(makeOrder(1))).not.toThrow();
  });
});
