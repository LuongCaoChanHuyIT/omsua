import {
  type ApiResponse,
  type BranchInfo,
  type CatalogPayload,
  type CreateOrderPayload,
  type HealthFetchResult,
  type OrderRecord,
  OMSUA_BRANCHES,
  getDefaultCatalog,
  normalizeApiBaseUrl,
  requestBackendHealth,
} from '@omsua/shared';

export async function fetchBackendHealth(
  baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<HealthFetchResult> {
  return requestBackendHealth(baseUrl, fetchImpl);
}

function isCatalogApiResponse(
  value: unknown,
): value is ApiResponse<CatalogPayload> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.success !== true || !candidate.data || typeof candidate.data !== 'object') {
    return false;
  }
  const data = candidate.data as Record<string, unknown>;
  return (
    Array.isArray(data.categories) &&
    Array.isArray(data.products) &&
    Array.isArray(data.toppings)
  );
}

function isBranchesApiResponse(
  value: unknown,
): value is ApiResponse<BranchInfo[]> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.success === true &&
    Array.isArray(candidate.data) &&
    candidate.data.length > 0 &&
    candidate.data.every(
      (item) =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).id === 'string',
    )
  );
}

function isOrderApiResponse(
  value: unknown,
): value is ApiResponse<OrderRecord> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.success !== true || !candidate.data || typeof candidate.data !== 'object') {
    return false;
  }
  const data = candidate.data as Record<string, unknown>;
  return typeof data.id === 'string' && typeof data.orderCode === 'string';
}

function extractNestErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (Array.isArray(record.message)) {
      const messages = record.message
        .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
      if (messages.length > 0) {
        return messages.join('; ');
      }
    }
    if (typeof record.message === 'string' && record.message.trim().length > 0) {
      return record.message;
    }
    if (typeof record.error === 'string' && record.error.trim().length > 0) {
      return record.error;
    }
  }
  return `HTTP ${status}`;
}

export async function fetchCatalog(
  baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<{ catalog: CatalogPayload; isFallback: boolean }> {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/catalog`;

  try {
    const response = await fetchImpl(endpoint, { cache: 'no-store' });
    if (!response.ok) {
      return { catalog: getDefaultCatalog(), isFallback: true };
    }

    const payload: unknown = await response.json();
    if (!isCatalogApiResponse(payload)) {
      return { catalog: getDefaultCatalog(), isFallback: true };
    }

    return { catalog: payload.data, isFallback: false };
  } catch {
    return { catalog: getDefaultCatalog(), isFallback: true };
  }
}

export async function fetchBranches(
  baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<{ branches: BranchInfo[]; isFallback: boolean }> {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/branches`;

  try {
    const response = await fetchImpl(endpoint, { cache: 'no-store' });
    if (!response.ok) {
      return {
        branches: OMSUA_BRANCHES.map((branch) => ({ ...branch })),
        isFallback: true,
      };
    }

    const payload: unknown = await response.json();
    if (!isBranchesApiResponse(payload)) {
      return {
        branches: OMSUA_BRANCHES.map((branch) => ({ ...branch })),
        isFallback: true,
      };
    }

    return { branches: payload.data, isFallback: false };
  } catch {
    return {
      branches: OMSUA_BRANCHES.map((branch) => ({ ...branch })),
      isFallback: true,
    };
  }
}

export async function submitOrder(
  payload: CreateOrderPayload,
  baseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; order: OrderRecord } | { ok: false; error: string }> {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/orders`;

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorBody: unknown = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = null;
      }
      return {
        ok: false,
        error: extractNestErrorMessage(errorBody, response.status),
      };
    }

    const json: unknown = await response.json();
    if (!isOrderApiResponse(json)) {
      return { ok: false, error: 'Phản hồi đơn hàng không hợp lệ.' };
    }

    return { ok: true, order: json.data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể kết nối máy chủ đặt món.';
    return { ok: false, error: message };
  }
}
