import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  type OrderRecord,
  type OrderStatus,
  type PaymentMethod,
} from '@omsua/shared';

export const RECENT_ORDERS_STORAGE_KEY = 'omsua.recentOrders.v1';
const MAX_RECENT_ORDERS = 10;

export interface RecentOrderSummary {
  orderCode: string;
  branchName: string;
  grandTotal: number;
  totalItems: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  customerPhone?: string;
}

const VALID_PAYMENT_METHODS = new Set<string>(PAYMENT_METHODS);
const VALID_ORDER_STATUSES = new Set<string>(ORDER_STATUSES);

function isRecentOrderSummary(value: unknown): value is RecentOrderSummary {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.orderCode === 'string' &&
    record.orderCode.trim().length > 0 &&
    typeof record.branchName === 'string' &&
    typeof record.grandTotal === 'number' &&
    Number.isFinite(record.grandTotal) &&
    typeof record.totalItems === 'number' &&
    Number.isFinite(record.totalItems) &&
    typeof record.paymentMethod === 'string' &&
    VALID_PAYMENT_METHODS.has(record.paymentMethod) &&
    typeof record.status === 'string' &&
    VALID_ORDER_STATUSES.has(record.status) &&
    typeof record.createdAt === 'string'
  );
}

export function readRecentOrders(): RecentOrderSummary[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_ORDERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const seen = new Set<string>();
    const results: RecentOrderSummary[] = [];

    for (const candidate of parsed) {
      if (!isRecentOrderSummary(candidate)) {
        continue;
      }
      const normalizedCode = candidate.orderCode.trim().toUpperCase();
      if (seen.has(normalizedCode)) {
        continue;
      }
      seen.add(normalizedCode);
      results.push({
        ...candidate,
        orderCode: normalizedCode,
      });
      if (results.length >= MAX_RECENT_ORDERS) {
        break;
      }
    }

    return results;
  } catch {
    return [];
  }
}

export function saveRecentOrder(order: OrderRecord): RecentOrderSummary[] {
  const normalizedCode = order.orderCode.trim().toUpperCase();
  const summary: RecentOrderSummary = {
    orderCode: normalizedCode,
    branchName: order.branchName,
    grandTotal: order.grandTotal,
    totalItems: order.totalItems,
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt,
    customerPhone: order.customerPhone,
  };

  const existing = readRecentOrders().filter(
    (entry) => entry.orderCode !== normalizedCode,
  );
  const next = [summary, ...existing].slice(0, MAX_RECENT_ORDERS);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        RECENT_ORDERS_STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch {
      // Ignore SecurityError or QuotaExceededError
    }
  }

  return next;
}
