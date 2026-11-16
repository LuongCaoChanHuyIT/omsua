import { describe, expect, it, vi } from 'vitest';
import { fetchBackendHealth } from './api';

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
