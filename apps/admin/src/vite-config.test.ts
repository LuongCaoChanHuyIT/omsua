// @vitest-environment node
import { describe, expect, it } from 'vitest';
import viteConfig, { resolveAdminPort } from '../vite.config';

describe('Vite server configuration (admin)', () => {
  it('pins Vite dev and preview servers strictly to port 3001 by default', () => {
    expect(viteConfig.server?.port).toBe(3001);
    expect(viteConfig.server?.strictPort).toBe(true);
    expect(viteConfig.preview?.port).toBe(3001);
    expect(viteConfig.preview?.strictPort).toBe(true);
  });

  it('resolveAdminPort reads ADMIN_PORT ?? PORT and falls back to 3001 on invalid values', () => {
    expect(resolveAdminPort({})).toBe(3001);
    expect(resolveAdminPort({ ADMIN_PORT: '3101' })).toBe(3101);
    expect(resolveAdminPort({ PORT: '3102' })).toBe(3102);
    expect(resolveAdminPort({ ADMIN_PORT: '3101', PORT: '3102' })).toBe(3101);
    expect(resolveAdminPort({ ADMIN_PORT: 'abc' })).toBe(3001);
    expect(resolveAdminPort({ ADMIN_PORT: '0' })).toBe(3001);
    expect(resolveAdminPort({ ADMIN_PORT: '70000' })).toBe(3001);
  });
});
