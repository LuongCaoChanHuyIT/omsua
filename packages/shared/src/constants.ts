export const DEFAULT_PORTS = {
  WEB: 3000,
  ADMIN: 3001,
  BACKEND: 4000,
} as const;

export const DEFAULT_API_BASE_URL = `http://localhost:${DEFAULT_PORTS.BACKEND}/api`;
