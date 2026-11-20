import { DEFAULT_PORTS } from '@omsua/shared';

const DEFAULT_ORIGINS = [
  `http://localhost:${DEFAULT_PORTS.WEB}`,
  `http://localhost:${DEFAULT_PORTS.ADMIN}`,
];

const VALID_CORS_PATTERN_RE = /^https?:\/\/[a-z0-9.*-]+(?::\d+)?$/i;

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

function patternToRegex(pattern: string): RegExp | null {
  const normalized = pattern.trim().replace(/\/+$/, '');
  if (!normalized || !VALID_CORS_PATTERN_RE.test(normalized)) {
    return null;
  }

  const host = normalized.replace(/^https?:\/\//i, '').replace(/:\d+$/, '');
  if (normalized.includes('*') && host.split('.').length < 2) {
    return null;
  }

  const escaped = normalized
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[a-z0-9-]*');

  return new RegExp(`^${escaped}$`, 'i');
}

export function isCorsOriginAllowed(
  origin: string,
  allowedPatterns: readonly string[],
): boolean {
  const normalizedOrigin = origin.trim().replace(/\/+$/, '');
  if (!normalizedOrigin) {
    return false;
  }

  return allowedPatterns.some((pattern) => {
    const regex = patternToRegex(pattern);
    return regex !== null && regex.test(normalizedOrigin);
  });
}

export function createCorsOriginDelegate(
  rawOrigins?: string,
): (
  requestOrigin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => void {
  const allowedPatterns = parseCorsOrigins(rawOrigins);

  return (requestOrigin, callback) => {
    if (requestOrigin === undefined) {
      callback(null, true);
      return;
    }

    callback(null, isCorsOriginAllowed(requestOrigin, allowedPatterns));
  };
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
