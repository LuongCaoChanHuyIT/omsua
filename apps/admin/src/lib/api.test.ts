import { describe, expect, it, vi } from 'vitest';
import { fetchBackendHealth } from './api';

describe('fetchBackendHealth (admin)', () => {
  it('normalizes trailing slashes and parses ApiResponse<HealthStatus>', async () => {
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
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/health');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.data.service).toBe('omsua-backend');
    }
  });

  it('falls back to default API URL when baseUrl is empty and handles offline errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network down'));
    const result = await fetchBackendHealth(
      '',
      mockFetch as unknown as typeof fetch,
    );
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/health');
    expect(result).toEqual({ ok: false, error: 'Network down' });
  });
});
