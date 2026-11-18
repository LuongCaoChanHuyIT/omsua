import {
  type CreateOrderPayload,
  type OrderRecord,
  OMSUA_BRANCHES,
  getDefaultCatalog,
} from '@omsua/shared';
import { describe, expect, it, vi } from 'vitest';
import {
  fetchBackendHealth,
  fetchBranches,
  fetchCatalog,
  submitOrder,
} from './api';

describe('fetchBackendHealth (web)', () => {
  it('calls normalized /health URL and returns payload when online', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          status: 'ok',
          service: 'omsua-backend',
          version: '0.1.0',
          uptime: 12.5,
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

  it('falls back to default API URL when env var is missing and handles offline errors gracefully', async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValue(new Error('connect ECONNREFUSED'));
    const result = await fetchBackendHealth(
      '',
      mockFetch as unknown as typeof fetch,
    );

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/health', {
      cache: 'no-store',
    });
    expect(result).toEqual({ ok: false, error: 'connect ECONNREFUSED' });
  });

  it('returns error state on non-200 HTTP response without throwing', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    const result = await fetchBackendHealth(
      'http://localhost:4000/api',
      mockFetch as unknown as typeof fetch,
    );
    expect(result).toEqual({ ok: false, error: 'HTTP 503' });
  });

  it('returns error state on unexpected payload shape without throwing', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ unexpected: true }),
    });
    const result = await fetchBackendHealth(
      'http://localhost:4000/api',
      mockFetch as unknown as typeof fetch,
    );
    expect(result).toEqual({ ok: false, error: 'Invalid health payload' });
  });
});

describe('fetchCatalog (web)', () => {
  it('returns live backend catalog on 200 OK with isFallback: false', async () => {
    const liveCatalog = getDefaultCatalog();
    liveCatalog.products[0] = {
      ...liveCatalog.products[0]!,
      isAvailable: false,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: liveCatalog,
        timestamp: '2026-11-18T09:00:00.000Z',
      }),
    });

    const result = await fetchCatalog(
      'http://localhost:4000/api///',
      mockFetch as unknown as typeof fetch,
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/catalog',
      { cache: 'no-store' },
    );
    expect(result.isFallback).toBe(false);
    expect(result.catalog.products[0]?.isAvailable).toBe(false);
    expect(result.catalog.products).toHaveLength(30);
  });

  it('falls back to getDefaultCatalog() (24 drinks, 6 snacks, 8 toppings) when fetch rejects with ECONNREFUSED', async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:4000'));

    const result = await fetchCatalog(
      'http://localhost:4000/api',
      mockFetch as unknown as typeof fetch,
    );

    expect(result.isFallback).toBe(true);
    expect(
      result.catalog.products.filter((item) => item.kind === 'drink'),
    ).toHaveLength(24);
    expect(
      result.catalog.products.filter((item) => item.kind === 'snack'),
    ).toHaveLength(6);
    expect(result.catalog.toppings).toHaveLength(8);
  });

  it('falls back cleanly when HTTP status is non-200 or shape is invalid', async () => {
    const mockHttpFail = vi.fn().mockResolvedValue({ ok: false, status: 502 });
    const httpResult = await fetchCatalog(
      'http://localhost:4000/api',
      mockHttpFail as unknown as typeof fetch,
    );
    expect(httpResult.isFallback).toBe(true);
    expect(httpResult.catalog.categories).toHaveLength(4);

    const mockShapeFail = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { products: 'not-an-array' } }),
    });
    const shapeResult = await fetchCatalog(
      'http://localhost:4000/api',
      mockShapeFail as unknown as typeof fetch,
    );
    expect(shapeResult.isFallback).toBe(true);
    expect(shapeResult.catalog.products).toHaveLength(30);
  });
});

describe('fetchBranches (web)', () => {
  it('returns live branches on 200 OK with isFallback: false', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: OMSUA_BRANCHES,
        timestamp: '2026-11-18T09:00:00.000Z',
      }),
    });

    const result = await fetchBranches(
      'http://localhost:4000/api/',
      mockFetch as unknown as typeof fetch,
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/branches',
      { cache: 'no-store' },
    );
    expect(result.isFallback).toBe(false);
    expect(result.branches).toHaveLength(4);
  });

  it('returns OMSUA_BRANCHES (4 Đà Lạt/Đức Trọng branches, isFallback: true) when offline', async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValue(new Error('connect ECONNREFUSED'));

    const result = await fetchBranches(
      'http://localhost:4000/api',
      mockFetch as unknown as typeof fetch,
    );

    expect(result.isFallback).toBe(true);
    expect(result.branches).toHaveLength(4);
    expect(result.branches.map((branch) => branch.id)).toEqual(
      OMSUA_BRANCHES.map((branch) => branch.id),
    );
  });
});

describe('submitOrder (web)', () => {
  const samplePayload: CreateOrderPayload = {
    branchId: 'cs1-hoang-dieu',
    customerName: 'Nguyễn Minh Thư',
    customerPhone: '0945396117',
    deliveryAddress: '12 Trần Phú, Phường 3, TP. Đà Lạt',
    note: 'Ít ngọt, giao giờ nghỉ trưa',
    paymentMethod: 'cod',
    items: [
      {
        productId: 'tra-sua-atiso',
        quantity: 1,
        size: 'M',
        sugarLevel: '70',
        iceLevel: '70',
        toppingIds: ['tran-chau-den'],
      },
    ],
  };

  it('posts JSON to normalized /orders URL and returns { ok: true, order } on 201', async () => {
    const mockOrder: OrderRecord = {
      id: 'ord-1',
      orderCode: 'OM-20261118-0001',
      branchId: 'cs1-hoang-dieu',
      branchName: 'Cơ sở 1 — Hoàng Diệu',
      customerName: samplePayload.customerName,
      customerPhone: samplePayload.customerPhone,
      deliveryAddress: samplePayload.deliveryAddress,
      note: samplePayload.note,
      paymentMethod: 'cod',
      status: 'pending',
      items: [
        {
          canonicalKey:
            'tra-sua-atiso|size:M|sugar:70|ice:70|spice:-|toppings:tran-chau-den',
          productId: 'tra-sua-atiso',
          productName: 'Trà Sữa Atiso',
          kind: 'drink',
          quantity: 1,
          size: 'M',
          sizeLabel: 'Size M (Chuẩn)',
          basePrice: 45000,
          sugarLevel: '70',
          iceLevel: '70',
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
      ],
      subtotal: 55000,
      shippingFee: 0,
      ecoFee: 0,
      grandTotal: 55000,
      totalItems: 1,
      createdAt: '2026-11-18T09:05:00.000Z',
      updatedAt: '2026-11-18T09:05:00.000Z',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: mockOrder,
        timestamp: '2026-11-18T09:05:00.000Z',
      }),
    });

    const result = await submitOrder(
      samplePayload,
      'http://localhost:4000/api///',
      mockFetch as unknown as typeof fetch,
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/orders',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samplePayload),
      }),
    );
    expect(result).toEqual({ ok: true, order: mockOrder });
  });

  it('extracts NestJS validation message array and string into { ok: false, error } on 400', async () => {
    const mockArrayErrorFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        statusCode: 400,
        message: [
          'Số điện thoại không hợp lệ',
          'Địa chỉ giao hàng quá ngắn',
        ],
        error: 'Bad Request',
      }),
    });

    const arrayResult = await submitOrder(
      samplePayload,
      'http://localhost:4000/api',
      mockArrayErrorFetch as unknown as typeof fetch,
    );

    expect(arrayResult.ok).toBe(false);
    if (!arrayResult.ok) {
      expect(arrayResult.error).toContain('Số điện thoại không hợp lệ');
      expect(arrayResult.error).toContain('Địa chỉ giao hàng quá ngắn');
    }

    const mockStringErrorFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        statusCode: 400,
        message: 'Món "Trà Sữa Atiso" hiện đang tạm hết.',
        error: 'Bad Request',
      }),
    });

    const stringResult = await submitOrder(
      samplePayload,
      'http://localhost:4000/api',
      mockStringErrorFetch as unknown as typeof fetch,
    );

    expect(stringResult).toEqual({
      ok: false,
      error: 'Món "Trà Sữa Atiso" hiện đang tạm hết.',
    });
  });

  it('returns { ok: false, error } when fetch rejects with network error', async () => {
    const mockNetworkFail = vi
      .fn()
      .mockRejectedValue(new Error('connect ECONNREFUSED'));

    const result = await submitOrder(
      samplePayload,
      'http://localhost:4000/api',
      mockNetworkFail as unknown as typeof fetch,
    );

    expect(result).toEqual({ ok: false, error: 'connect ECONNREFUSED' });
  });
});
