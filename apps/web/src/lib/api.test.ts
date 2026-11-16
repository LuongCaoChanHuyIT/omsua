import { describe, expect, it, vi } from 'vitest';
import { fetchBackendHealth } from './api';

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
