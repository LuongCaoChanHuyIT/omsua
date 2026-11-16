import { DEFAULT_API_BASE_URL } from './constants';
import type { ApiResponse } from './contracts';

export function createApiResponse<T>(
  data: T,
  timestamp: string = new Date().toISOString(),
): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp,
  };
}

export function normalizeApiBaseUrl(rawUrl?: string): string {
  const trimmed = rawUrl?.trim().replace(/\/+$/, '');
  return trimmed ? trimmed : DEFAULT_API_BASE_URL;
}
