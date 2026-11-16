import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from './App';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Admin App routes & layout', () => {
  it('renders sidebar navigation and live omsua-backend status on /', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            status: 'ok',
            service: 'omsua-backend',
            version: '0.1.0',
            uptime: 18,
            environment: 'development',
          },
          timestamp: '2026-11-16T00:00:00.000Z',
        }),
      }),
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Tổng quan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cài đặt/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/omsua-backend/i)).toBeInTheDocument();
    });
  });

  it('renders Settings placeholder view on /settings', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /Cài đặt hệ thống/i }),
    ).toBeInTheDocument();
  });
});
