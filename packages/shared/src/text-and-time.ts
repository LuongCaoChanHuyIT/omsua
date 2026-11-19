import type { OrderStatus } from './domain';

export interface OrderAgeBadge {
  label: string;
  minutes: number;
  isOverdue: boolean;
}

export function normalizeVietnameseText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveOrderAge(
  createdAt: string,
  status: OrderStatus,
  nowMs: number = Date.now(),
): OrderAgeBadge | null {
  const parsedMs = Date.parse(createdAt);
  if (!Number.isFinite(parsedMs) || !Number.isFinite(nowMs)) {
    return null;
  }

  const minutes = Math.max(0, Math.floor((nowMs - parsedMs) / 60_000));
  const isOverdue =
    (status === 'pending' || status === 'preparing') && minutes > 15;

  let label: string;
  if (minutes < 1) {
    label = 'Vừa đặt';
  } else if (minutes < 60) {
    label = `${minutes} phút trước`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    label =
      remMinutes === 0
        ? `${hours} giờ trước`
        : `${hours} giờ ${remMinutes} phút trước`;
  } else {
    const days = Math.floor(minutes / 1440);
    label = `${days} ngày trước`;
  }

  return {
    label,
    minutes,
    isOverdue,
  };
}
