import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { DEFAULT_PORTS } from '@omsua/shared';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: DEFAULT_PORTS.ADMIN,
    strictPort: true,
  },
  preview: {
    port: DEFAULT_PORTS.ADMIN,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
  },
});
