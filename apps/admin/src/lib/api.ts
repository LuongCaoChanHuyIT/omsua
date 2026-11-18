import {
  type ApiResponse,
  type BranchInfo,
  type CatalogPayload,
  type HealthFetchResult,
  type OrderRecord,
  type OrderStatus,
  type ProductItem,
  normalizeApiBaseUrl,
  requestBackendHealth,
} from '@omsua/shared';

export type AdminApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function fetchBackendHealth(
  baseUrl: string | undefined = import.meta.env.VITE_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<HealthFetchResult> {
  return requestBackendHealth(baseUrl, fetchImpl);
}

function extractApiErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (Array.isArray(record.message)) {
      const messages = record.message.filter(
        (entry): entry is string =>
          typeof entry === 'string' && entry.trim().length > 0,
      );
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

async function readErrorFromResponse(response: Response): Promise<string> {
  let errorBody: unknown = null;
  if (typeof response.json === 'function') {
    try {
      errorBody = await response.json();
    } catch {
      errorBody = null;
    }
  }
  return extractApiErrorMessage(errorBody, response.status);
}

function isOrdersListApiResponse(
  value: unknown,
): value is ApiResponse<OrderRecord[]> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return candidate.success === true && Array.isArray(candidate.data);
}

function isSingleOrderApiResponse(
  value: unknown,
): value is ApiResponse<OrderRecord> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.success !== true ||
    !candidate.data ||
    typeof candidate.data !== 'object'
  ) {
    return false;
  }
  const data = candidate.data as Record<string, unknown>;
  return typeof data.id === 'string' && typeof data.orderCode === 'string';
}

function isCatalogApiResponse(
  value: unknown,
): value is ApiResponse<CatalogPayload> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.success !== true ||
    !candidate.data ||
    typeof candidate.data !== 'object'
  ) {
    return false;
  }
  const data = candidate.data as Record<string, unknown>;
  return (
    Array.isArray(data.categories) &&
    Array.isArray(data.products) &&
    Array.isArray(data.toppings)
  );
}

function isProductApiResponse(
  value: unknown,
): value is ApiResponse<ProductItem> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.success !== true ||
    !candidate.data ||
    typeof candidate.data !== 'object'
  ) {
    return false;
  }
  const data = candidate.data as Record<string, unknown>;
  return (
    typeof data.id === 'string' && typeof data.isAvailable === 'boolean'
  );
}

function isBranchesApiResponse(
  value: unknown,
): value is ApiResponse<BranchInfo[]> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return candidate.success === true && Array.isArray(candidate.data);
}

export async function fetchOrders(
  filters?: { status?: OrderStatus; branchId?: string },
  baseUrl: string | undefined = import.meta.env.VITE_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<AdminApiResult<OrderRecord[]>> {
  const base = normalizeApiBaseUrl(baseUrl);
  const params = new URLSearchParams();
  if (filters?.status) {
    params.set('status', filters.status);
  }
  if (filters?.branchId && filters.branchId.trim().length > 0) {
    params.set('branchId', filters.branchId.trim());
  }
  const query = params.toString();
  const endpoint = query ? `${base}/orders?${query}` : `${base}/orders`;

  try {
    const response = await fetchImpl(endpoint, { cache: 'no-store' });
    if (!response.ok) {
      return { ok: false, error: await readErrorFromResponse(response) };
    }

    const payload: unknown = await response.json();
    if (!isOrdersListApiResponse(payload)) {
      return { ok: false, error: 'Dữ liệu danh sách đơn hàng không hợp lệ.' };
    }

    return { ok: true, data: payload.data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể kết nối máy chủ đơn hàng.';
    return { ok: false, error: message };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  baseUrl: string | undefined = import.meta.env.VITE_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<AdminApiResult<OrderRecord>> {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/orders/${encodeURIComponent(orderId)}/status`;

  try {
    const response = await fetchImpl(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      return { ok: false, error: await readErrorFromResponse(response) };
    }

    const payload: unknown = await response.json();
    if (!isSingleOrderApiResponse(payload)) {
      return { ok: false, error: 'Phản hồi cập nhật đơn hàng không hợp lệ.' };
    }

    return { ok: true, data: payload.data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể cập nhật trạng thái đơn hàng.';
    return { ok: false, error: message };
  }
}

export async function fetchAdminCatalog(
  baseUrl: string | undefined = import.meta.env.VITE_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<AdminApiResult<CatalogPayload>> {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/catalog`;

  try {
    const response = await fetchImpl(endpoint, { cache: 'no-store' });
    if (!response.ok) {
      return { ok: false, error: await readErrorFromResponse(response) };
    }

    const payload: unknown = await response.json();
    if (!isCatalogApiResponse(payload)) {
      return { ok: false, error: 'Dữ liệu thực đơn không hợp lệ.' };
    }

    return { ok: true, data: payload.data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể tải danh sách thực đơn.';
    return { ok: false, error: message };
  }
}

export async function toggleProductAvailability(
  productId: string,
  isAvailable: boolean,
  baseUrl: string | undefined = import.meta.env.VITE_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<AdminApiResult<ProductItem>> {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/catalog/products/${encodeURIComponent(productId)}/availability`;

  try {
    const response = await fetchImpl(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable }),
    });
    if (!response.ok) {
      return { ok: false, error: await readErrorFromResponse(response) };
    }

    const payload: unknown = await response.json();
    if (!isProductApiResponse(payload)) {
      return { ok: false, error: 'Phản hồi trạng thái món không hợp lệ.' };
    }

    return { ok: true, data: payload.data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể cập nhật trạng thái món.';
    return { ok: false, error: message };
  }
}

export async function fetchAdminBranches(
  baseUrl: string | undefined = import.meta.env.VITE_API_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<AdminApiResult<BranchInfo[]>> {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/branches`;

  try {
    const response = await fetchImpl(endpoint, { cache: 'no-store' });
    if (!response.ok) {
      return { ok: false, error: await readErrorFromResponse(response) };
    }

    const payload: unknown = await response.json();
    if (!isBranchesApiResponse(payload)) {
      return { ok: false, error: 'Dữ liệu chi nhánh không hợp lệ.' };
    }

    return { ok: true, data: payload.data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể tải danh sách chi nhánh.';
    return { ok: false, error: message };
  }
}
