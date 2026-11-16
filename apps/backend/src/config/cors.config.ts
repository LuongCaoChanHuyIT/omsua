import { DEFAULT_PORTS } from '@omsua/shared';

const DEFAULT_ORIGINS = [
  `http://localhost:${DEFAULT_PORTS.WEB}`,
  `http://localhost:${DEFAULT_PORTS.ADMIN}`,
];

export function parseCorsOrigins(rawOrigins?: string): string[] {
  if (!rawOrigins) {
    return [...DEFAULT_ORIGINS];
  }

  const origins = rawOrigins
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return origins.length > 0 ? origins : [...DEFAULT_ORIGINS];
}
