import process from 'node:process';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { DEFAULT_PORTS } from '@omsua/shared';
import { defineConfig } from 'vitest/config';

export function resolveAdminPort(
  env: Record<string, string | undefined> = process.env,
): number {
  const rawAdminPort = env.ADMIN_PORT?.trim();
  const raw =
    rawAdminPort !== undefined && rawAdminPort.length > 0
      ? rawAdminPort
      : env.PORT?.trim();

  if (!raw || !/^\d+$/.test(raw)) {
    return DEFAULT_PORTS.ADMIN;
  }

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 65535
    ? parsed
    : DEFAULT_PORTS.ADMIN;
}

const adminPort = resolveAdminPort();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: adminPort,
    strictPort: true,
  },
  preview: {
    port: adminPort,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
  },
});
