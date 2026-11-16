import {
  type ApiResponse,
  type HealthFetchResult,
  type HealthStatus,
  normalizeApiBaseUrl,
} from '@omsua/shared';

function isValidHealthPayload(
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

export async function fetchBackendHealth(
  baseUrl: string | undefined = import.meta.env.VITE_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<HealthFetchResult> {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/health`;

  try {
    const response = await fetchImpl(endpoint);
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
