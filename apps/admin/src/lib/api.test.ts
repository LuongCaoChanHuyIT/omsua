import {
  OMSUA_BRANCHES,
  getDefaultCatalog,
  type OrderRecord,
} from '@omsua/shared';
import { describe, expect, it, vi } from 'vitest';
import {
  fetchAdminBranches,
  fetchAdminCatalog,
  fetchBackendHealth,
  fetchOrders,
  toggleProductAvailability,
  updateOrderStatus,
} from './api';

const sampleOrder: OrderRecord = {
  id: 'ord-1',
  orderCode: 'OM-20261118-A1B2',
  branchId: 'cs1-hoang-dieu',
  branchName: 'Cơ sở 1 — Hoàng Diệu',
  customerName: 'Nguyễn Minh Anh',
  customerPhone: '0905123456',
  deliveryAddress: '12 Khu Hòa Bình, Phường 1, Đà Lạt',
  note: 'Ít ngọt, giao cổng chính',
  paymentMethod: 'cod',
  status: 'pending',
  items: [
    {
      canonicalKey: 'tra-sua-atiso|size:M|sugar:70|ice:50|spice:-|toppings:tran-chau-den',
      productId: 'tra-sua-atiso',
      productName: 'Trà Sữa Atiso',
      kind: 'drink',
      quantity: 1,
      size: 'M',
      sizeLabel: 'Size M (Chuẩn)',
      basePrice: 45000,
      sugarLevel: '70',
      iceLevel: '50',
      toppings: [
        {
          id: 'tran-chau-den',
          name: 'Trân châu đen nấu mật',
          shortName: 'Trân châu đen',
          price: 10000,
        },
      ],
      unitPrice: 55000,
      lineTotal: 55000,
    },
    {
      canonicalKey: 'banh-trang-tron-top-mo|size:STD|sugar:-|ice:-|spice:cay-vua|toppings:',
      productId: 'banh-trang-tron-top-mo',
      productName: 'Bánh Tráng Trộn Tóp Mỡ',
      kind: 'snack',
      quantity: 1,
      size: 'STD',
      sizeLabel: 'Phần tiêu chuẩn',
      basePrice: 40000,
      spiceLevel: 'cay-vua',
      toppings: [],
      unitPrice: 40000,
      lineTotal: 40000,
    },
  ],
  subtotal: 95000,
  shippingFee: 0,
  ecoFee: 0,
  grandTotal: 95000,
  totalItems: 2,
  createdAt: '2026-11-18T09:30:00.000Z',
  updatedAt: '2026-11-18T09:30:00.000Z',
};

describe('fetchBackendHealth (admin)', () => {
  it('normalizes trailing slashes, passes no-store cache option, and parses ApiResponse<HealthStatus>', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          status: 'ok',
          service: 'omsua-backend',
          version: '0.1.0',
          uptime: 42,
          environment: 'development',
        },
        timestamp: '2026-11-16T00:00:00.000Z',
      }),
    });

    const result = await fetchBackendHealth(
      'http://localhost:4000/api///',
      mockFetch as unknown as typeof fetch,
    );
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/health', {
      cache: 'no-store',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.data.service).toBe('omsua-backend');
    }
  });

  it('falls back to default API URL when baseUrl is empty or undefined and handles offline errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network down'));
    const emptyResult = await fetchBackendHealth(
      '',
      mockFetch as unknown as typeof fetch,
    );
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/health', {
      cache: 'no-store',
    });
    expect(emptyResult).toEqual({ ok: false, error: 'Network down' });

    const defaultResult = await fetchBackendHealth(
      undefined,
      mockFetch as unknown as typeof fetch,
    );
    expect(defaultResult).toEqual({ ok: false, error: 'Network down' });
  });

  it('returns HTTP status error on non-200 response and handles invalid JSON SyntaxError', async () => {
    const http503Fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    expect(
      await fetchBackendHealth(
        'http://localhost:4000/api',
        http503Fetch as unknown as typeof fetch,
      ),
    ).toEqual({ ok: false, error: 'HTTP 503' });

    const invalidJsonFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON');
      },
    });
    expect(
      await fetchBackendHealth(
        'http://localhost:4000/api',
        invalidJsonFetch as unknown as typeof fetch,
      ),
    ).toEqual({ ok: false, error: 'Unexpected token < in JSON' });

    const badShapeFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ invalid: true }),
    });
    expect(
      await fetchBackendHealth(
        'http://localhost:4000/api',
        badShapeFetch as unknown as typeof fetch,
      ),
    ).toEqual({ ok: false, error: 'Invalid health payload' });
  });
});

describe('Admin order & catalog API helpers', () => {
  it('fetchOrders passes status and branchId query params with no-store cache', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [sampleOrder],
        timestamp: '2026-11-18T09:35:00.000Z',
      }),
    });

    const result = await fetchOrders(
      { status: 'pending', branchId: 'cs1-hoang-dieu' },
      'http://localhost:4000/api/',
      mockFetch as unknown as typeof fetch,
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/orders?status=pending&branchId=cs1-hoang-dieu',
      { cache: 'no-store' },
    );
    expect(result).toEqual({ ok: true, data: [sampleOrder] });
  });

  it('updateOrderStatus sends PATCH /orders/:id/status with status payload', async () => {
    const updatedOrder: OrderRecord = {
      ...sampleOrder,
      status: 'preparing',
      updatedAt: '2026-11-18T09:36:00.000Z',
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: updatedOrder,
        timestamp: '2026-11-18T09:36:00.000Z',
      }),
    });

    const result = await updateOrderStatus(
      'ord-1',
      'preparing',
      'http://localhost:4000/api',
      mockFetch as unknown as typeof fetch,
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/orders/ord-1/status',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'preparing' }),
      },
    );
    expect(result).toEqual({ ok: true, data: updatedOrder });
  });

  it('toggleProductAvailability sends PATCH /catalog/products/:id/availability', async () => {
    const catalog = getDefaultCatalog();
    const toggledProduct = {
      ...catalog.products[0]!,
      isAvailable: false,
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: toggledProduct,
        timestamp: '2026-11-18T09:37:00.000Z',
      }),
    });

    const result = await toggleProductAvailability(
      'tra-sua-atiso',
      false,
      'http://localhost:4000/api',
      mockFetch as unknown as typeof fetch,
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/catalog/products/tra-sua-atiso/availability',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: false }),
      },
    );
    expect(result).toEqual({ ok: true, data: toggledProduct });
  });

  it('fetchAdminCatalog and fetchAdminBranches parse catalog and branch payloads and surface HTTP errors', async () => {
    const catalog = getDefaultCatalog();
    const catalogFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: catalog,
        timestamp: '2026-11-18T09:38:00.000Z',
      }),
    });

    const catalogResult = await fetchAdminCatalog(
      'http://localhost:4000/api',
      catalogFetch as unknown as typeof fetch,
    );
    expect(catalogFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/catalog',
      { cache: 'no-store' },
    );
    expect(catalogResult.ok).toBe(true);

    const branchesFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: OMSUA_BRANCHES,
        timestamp: '2026-11-18T09:38:00.000Z',
      }),
    });
    const branchesResult = await fetchAdminBranches(
      'http://localhost:4000/api',
      branchesFetch as unknown as typeof fetch,
    );
    expect(branchesFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/branches',
      { cache: 'no-store' },
    );
    expect(branchesResult).toEqual({ ok: true, data: OMSUA_BRANCHES });

    const errorFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Không tìm thấy đơn hàng' }),
    });
    const errorResult = await updateOrderStatus(
      'missing',
      'preparing',
      'http://localhost:4000/api',
      errorFetch as unknown as typeof fetch,
    );
    expect(errorResult).toEqual({
      ok: false,
      error: 'Không tìm thấy đơn hàng',
    });
  });
});
