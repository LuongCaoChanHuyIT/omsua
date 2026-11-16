// @vitest-environment node
import { describe, expect, it } from 'vitest';
import viteConfig from '../vite.config';

describe('Vite server configuration (admin)', () => {
  it('pins Vite dev and preview servers strictly to port 3001', () => {
    expect(viteConfig.server?.port).toBe(3001);
    expect(viteConfig.server?.strictPort).toBe(true);
    expect(viteConfig.preview?.port).toBe(3001);
    expect(viteConfig.preview?.strictPort).toBe(true);
  });
});
