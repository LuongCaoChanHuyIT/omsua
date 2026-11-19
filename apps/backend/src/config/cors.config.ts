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

export function resolveBackendPort(
  env: Record<string, string | undefined> = process.env,
): number {
  const rawBackendPort = env.BACKEND_PORT?.trim();
  const raw =
    rawBackendPort !== undefined && rawBackendPort.length > 0
      ? rawBackendPort
      : env.PORT?.trim();

  if (!raw || !/^\d+$/.test(raw)) {
    return DEFAULT_PORTS.BACKEND;
  }

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 65535
    ? parsed
    : DEFAULT_PORTS.BACKEND;
}
