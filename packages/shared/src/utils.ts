import { DEFAULT_API_BASE_URL } from './constants';
import type {
  ApiResponse,
  HealthFetchResult,
  HealthStatus,
} from './contracts';

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

export function isValidHealthPayload(
  value: unknown,
): value is ApiResponse<HealthStatus> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.success !== true || typeof candidate.timestamp !== 'string') {
    return false;
  }
  const data = candidate.data as Record<string, unknown> | undefined;
  return (
    Boolean(data) &&
    data?.status === 'ok' &&
    typeof data?.service === 'string' &&
    typeof data?.version === 'string' &&
    typeof data?.uptime === 'number' &&
    typeof data?.environment === 'string'
  );
}

export type HealthFetchFn = (
  url: string,
  init?: { cache?: 'no-store' },
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export async function requestBackendHealth(
  baseUrl?: string,
  fetchImpl: HealthFetchFn = globalThis.fetch as HealthFetchFn,
): Promise<HealthFetchResult> {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/health`;

  try {
    const response = await fetchImpl(endpoint, { cache: 'no-store' });
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const payload: unknown = await response.json();
    if (!isValidHealthPayload(payload)) {
      return { ok: false, error: 'Invalid health payload' };
    }

    return { ok: true, payload };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to reach backend';
    return { ok: false, error: message };
  }
}
