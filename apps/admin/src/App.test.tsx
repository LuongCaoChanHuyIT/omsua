import '@testing-library/jest-dom/vitest';
import {
  OMSUA_BRANCHES,
  getDefaultCatalog,
  type OrderRecord,
} from '@omsua/shared';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from './App';

const mockPendingOrder: OrderRecord = {
  id: 'ord-1',
  orderCode: 'OM-20261118-A1B2',
  branchId: 'cs1-hoang-dieu',
  branchName: 'Cơ sở 1 — Hoàng Diệu',
  customerName: 'Nguyễn Minh Anh',
  customerPhone: '0905123456',
  deliveryAddress: '12 Khu Hòa Bình, Phường 1, Đà Lạt',
  note: 'Ít ngọt, giao cổng chính',
  paymentMethod: 'cod',
  status: 'pending',
  items: [
    {
      canonicalKey: 'tra-sua-atiso|size:M|sugar:70|ice:50|spice:-|toppings:tran-chau-den',
      productId: 'tra-sua-atiso',
      productName: 'Trà Sữa Atiso',
      kind: 'drink',
      quantity: 1,
      size: 'M',
      sizeLabel: 'Size M (Chuẩn)',
      basePrice: 45000,
      sugarLevel: '70',
      iceLevel: '50',
      toppings: [
        {
          id: 'tran-chau-den',
          name: 'Trân châu đen nấu mật',
          shortName: 'Trân châu đen',
          price: 10000,
        },
      ],
      unitPrice: 55000,
      lineTotal: 55000,
    },
    {
      canonicalKey: 'banh-trang-tron-top-mo|size:STD|sugar:-|ice:-|spice:cay-vua|toppings:',
      productId: 'banh-trang-tron-top-mo',
      productName: 'Bánh Tráng Trộn Tóp Mỡ',
      kind: 'snack',
      quantity: 1,
      size: 'STD',
      sizeLabel: 'Phần tiêu chuẩn',
      basePrice: 40000,
      spiceLevel: 'cay-vua',
      toppings: [],
      unitPrice: 40000,
      lineTotal: 40000,
    },
  ],
  subtotal: 95000,
  shippingFee: 0,
  ecoFee: 0,
  grandTotal: 95000,
  totalItems: 2,
  createdAt: '2026-11-18T09:30:00.000Z',
  updatedAt: '2026-11-18T09:30:00.000Z',
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Admin App routes & operational portals', () => {
  it('renders OrdersPage on /, displays pending order OM-20261118-A1B2, and transitions status to Đang pha chế', async () => {
    const fetchMock = vi.fn().mockImplementation(async (input: string, init?: RequestInit) => {
      if (input.endsWith('/orders/ord-1/status') && init?.method === 'PATCH') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              ...mockPendingOrder,
              status: 'preparing',
              updatedAt: '2026-11-18T09:40:00.000Z',
            },
            timestamp: '2026-11-18T09:40:00.000Z',
          }),
        };
      }

      if (input.includes('/orders')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [mockPendingOrder],
            timestamp: '2026-11-18T09:35:00.000Z',
          }),
        };
      }

      return { ok: false, status: 404, json: async () => ({}) };
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Đơn hàng' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Thực đơn' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Chi nhánh' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cài đặt' })).toBeInTheDocument();

    const orderCard = await screen.findByTestId('order-card-ord-1');
    expect(within(orderCard).getByText('OM-20261118-A1B2')).toBeInTheDocument();
    expect(within(orderCard).getByText(/Trà Sữa Atiso/)).toBeInTheDocument();
    expect(within(orderCard).getByText('95.000đ')).toBeInTheDocument();
    expect(within(orderCard).getByText('Chờ xác nhận')).toBeInTheDocument();

    fireEvent.click(
      within(orderCard).getByRole('button', { name: 'Xác nhận pha chế' }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/ord-1/status'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'preparing' }),
        }),
      );
    });

    await waitFor(() => {
      expect(within(orderCard).getByText('Đang pha chế')).toBeInTheDocument();
    });
  });

  it('filters orders by branch and status pills and supports delivering -> completed transition', async () => {
    const deliveringOrder: OrderRecord = {
      ...mockPendingOrder,
      id: 'ord-2',
      orderCode: 'OM-20261118-C3D4',
      branchId: 'cs4-duc-trong',
      branchName: 'Cơ sở 4 — Đức Trọng',
      paymentMethod: 'qr',
      status: 'delivering',
    };

    const fetchMock = vi.fn().mockImplementation(async (input: string, init?: RequestInit) => {
      if (input.endsWith('/orders/ord-2/status') && init?.method === 'PATCH') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { ...deliveringOrder, status: 'completed' },
            timestamp: '2026-11-18T09:45:00.000Z',
          }),
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [deliveringOrder],
          timestamp: '2026-11-18T09:44:00.000Z',
        }),
      };
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const orderCard = await screen.findByTestId('order-card-ord-2');
    expect(within(orderCard).getByText('Chuyển khoản QR')).toBeInTheDocument();
    expect(within(orderCard).getByText('Đang giao')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Lọc theo chi nhánh'), {
      target: { value: 'cs4-duc-trong' },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders?branchId=cs4-duc-trong'),
        { cache: 'no-store' },
      );
    });

    fireEvent.click(
      within(orderCard).getByRole('button', { name: 'Hoàn tất' }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/ord-2/status'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        }),
      );
    });

    await waitFor(() => {
      expect(within(orderCard).getByText('Hoàn tất')).toBeInTheDocument();
    });
  });

  it('renders MenuPage on /menu and toggles Trà Sữa Atiso availability via PATCH', async () => {
    const catalog = getDefaultCatalog();
    const fetchMock = vi.fn().mockImplementation(async (input: string, init?: RequestInit) => {
      if (
        input.endsWith('/catalog/products/tra-sua-atiso/availability') &&
        init?.method === 'PATCH'
      ) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              ...catalog.products[0]!,
              isAvailable: false,
            },
            timestamp: '2026-11-18T09:42:00.000Z',
          }),
        };
      }

      if (input.endsWith('/catalog')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: catalog,
            timestamp: '2026-11-18T09:41:00.000Z',
          }),
        };
      }

      return { ok: false, status: 404, json: async () => ({}) };
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/menu']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const productCard = await screen.findByTestId('menu-product-tra-sua-atiso');
    expect(within(productCard).getByText('Trà Sữa Atiso')).toBeInTheDocument();
    expect(within(productCard).getByText('Còn món')).toBeInTheDocument();

    fireEvent.click(within(productCard).getByRole('button', { name: 'Tạm hết' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(
          '/api/catalog/products/tra-sua-atiso/availability',
        ),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ isAvailable: false }),
        }),
      );
    });

    await waitFor(() => {
      expect(
        within(productCard).getByRole('button', { name: 'Mở bán lại' }),
      ).toBeInTheDocument();
    });
  });

  it('renders BranchesPage on /branches with all 4 Đà Lạt / Đức Trọng branches and live order counts', async () => {
    const fetchMock = vi.fn().mockImplementation(async (input: string) => {
      if (input.endsWith('/branches')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: OMSUA_BRANCHES,
            timestamp: '2026-11-18T09:43:00.000Z',
          }),
        };
      }

      if (input.endsWith('/orders')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [mockPendingOrder],
            timestamp: '2026-11-18T09:43:00.000Z',
          }),
        };
      }

      return { ok: false, status: 404, json: async () => ({}) };
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/branches']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('Cơ sở 1 — Hoàng Diệu'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Cơ sở 2 — Hẻm 33 Nguyễn Công Trứ'),
    ).toBeInTheDocument();
    expect(screen.getByText('Cơ sở 3 — 158 Nguyễn Công Trứ')).toBeInTheDocument();
    expect(screen.getByText('Cơ sở 4 — Đức Trọng')).toBeInTheDocument();
    const cs1Card = screen.getByTestId('branch-card-cs1-hoang-dieu');
    expect(within(cs1Card).getByText('95.000đ')).toBeInTheDocument();
  });

  it('falls back to OMSUA_BRANCHES on /branches when backend API is offline', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Offline')),
    );

    render(
      <MemoryRouter initialEntries={['/branches']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Đang hiển thị danh sách cơ sở mặc định/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Cơ sở 1 — Hoàng Diệu')).toBeInTheDocument();
    expect(screen.getByText('Cơ sở 4 — Đức Trọng')).toBeInTheDocument();
  });

  it('renders Settings view with live backend health check on /settings', async () => {
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
          timestamp: '2026-11-18T00:00:00.000Z',
        }),
      }),
    );

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /Cài đặt hệ thống/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/omsua-backend/i)).toBeInTheDocument();
    });
  });

  it('renders not-found fallback inside AdminLayout on unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Đơn hàng' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Quay về Đơn hàng' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Không tìm thấy trang/i }),
    ).toBeInTheDocument();
  });
});
