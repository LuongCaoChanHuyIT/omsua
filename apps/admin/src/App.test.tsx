import '@testing-library/jest-dom/vitest';
import {
  OMSUA_BRANCHES,
  getDefaultCatalog,
  type OrderRecord,
} from '@omsua/shared';
import {
  act,
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
  vi.useRealTimers();
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

  it('tracks concurrent order status transitions and menu availability toggles per card via Set<string>', async () => {
    const secondPendingOrder: OrderRecord = {
      ...mockPendingOrder,
      id: 'ord-concurrent-2',
      orderCode: 'OM-20261118-Z9Y8',
    };

    let resolveOrd1!: (res: unknown) => void;
    let resolveOrd2!: (res: unknown) => void;

    const ordersFetchMock = vi
      .fn()
      .mockImplementation((input: string, init?: RequestInit) => {
        if (input.endsWith('/orders/ord-1/status') && init?.method === 'PATCH') {
          return new Promise((resolve) => {
            resolveOrd1 = resolve;
          });
        }
        if (
          input.endsWith('/orders/ord-concurrent-2/status') &&
          init?.method === 'PATCH'
        ) {
          return new Promise((resolve) => {
            resolveOrd2 = resolve;
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [mockPendingOrder, secondPendingOrder],
            timestamp: '2026-11-18T10:00:00.000Z',
          }),
        });
      });

    vi.stubGlobal('fetch', ordersFetchMock);

    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const card1 = await screen.findByTestId('order-card-ord-1');
    const card2 = await screen.findByTestId('order-card-ord-concurrent-2');

    const btn1 = within(card1).getByRole('button', {
      name: 'Xác nhận pha chế',
    });
    const btn2 = within(card2).getByRole('button', {
      name: 'Xác nhận pha chế',
    });

    fireEvent.click(btn1);
    fireEvent.click(btn2);

    // Both cards must stay disabled simultaneously while both requests are in flight
    expect(btn1).toBeDisabled();
    expect(btn2).toBeDisabled();

    // Finish card 2 first -> card 1 must still remain disabled!
    resolveOrd2({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { ...secondPendingOrder, status: 'preparing' },
        timestamp: '2026-11-18T10:01:00.000Z',
      }),
    });

    await waitFor(() => {
      expect(within(card2).getByText('Đang pha chế')).toBeInTheDocument();
    });
    expect(btn1).toBeDisabled();

    resolveOrd1({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { ...mockPendingOrder, status: 'preparing' },
        timestamp: '2026-11-18T10:02:00.000Z',
      }),
    });

    await waitFor(() => {
      expect(within(card1).getByText('Đang pha chế')).toBeInTheDocument();
    });

    unmount();

    // Now verify MenuPage concurrent toggles
    const catalog = getDefaultCatalog();
    let resolveMenu1!: (res: unknown) => void;
    let resolveMenu2!: (res: unknown) => void;

    const menuFetchMock = vi
      .fn()
      .mockImplementation((input: string, init?: RequestInit) => {
        if (
          input.endsWith('/catalog/products/tra-sua-atiso/availability') &&
          init?.method === 'PATCH'
        ) {
          return new Promise((resolve) => {
            resolveMenu1 = resolve;
          });
        }
        if (
          input.endsWith(
            '/catalog/products/tra-sua-atiso-chuoi/availability',
          ) &&
          init?.method === 'PATCH'
        ) {
          return new Promise((resolve) => {
            resolveMenu2 = resolve;
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: catalog,
            timestamp: '2026-11-18T10:00:00.000Z',
          }),
        });
      });

    vi.stubGlobal('fetch', menuFetchMock);

    render(
      <MemoryRouter initialEntries={['/menu']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const prodCard1 = await screen.findByTestId('menu-product-tra-sua-atiso');
    const prodCard2 = await screen.findByTestId(
      'menu-product-tra-sua-atiso-chuoi',
    );

    const toggleBtn1 = within(prodCard1).getByRole('button', {
      name: 'Tạm hết',
    });
    const toggleBtn2 = within(prodCard2).getByRole('button', {
      name: 'Tạm hết',
    });

    fireEvent.click(toggleBtn1);
    fireEvent.click(toggleBtn2);

    expect(toggleBtn1).toBeDisabled();
    expect(toggleBtn2).toBeDisabled();

    resolveMenu2({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { ...catalog.products[1]!, isAvailable: false },
        timestamp: '2026-11-18T10:03:00.000Z',
      }),
    });

    await waitFor(() => {
      expect(
        within(prodCard2).getByRole('button', { name: 'Mở bán lại' }),
      ).toBeInTheDocument();
    });
    expect(toggleBtn1).toBeDisabled();

    resolveMenu1({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { ...catalog.products[0]!, isAvailable: false },
        timestamp: '2026-11-18T10:04:00.000Z',
      }),
    });

    await waitFor(() => {
      expect(
        within(prodCard1).getByRole('button', { name: 'Mở bán lại' }),
      ).toBeInTheDocument();
    });
  });

  it('renders skip-to-main link targeting #admin-main and brand quote in font-quote inside AdminLayout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [],
          timestamp: '2026-11-18T09:35:00.000Z',
        }),
      }),
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const skipLink = screen.getByRole('link', {
      name: 'Chuyển đến nội dung chính',
    });
    expect(skipLink).toHaveAttribute('href', '#admin-main');
    expect(document.getElementById('admin-main')?.tagName).toBe('MAIN');

    const quoteEl = screen.getByText(/Gói trọn sương sớm/i);
    expect(quoteEl.className).toContain('font-quote');
  });

  it('computes branch-wide KPI strip, status tab counts with aria-pressed, diacritic-insensitive search, Vietnam UTC+7 timestamps, and VietQR memo', async () => {
    const ordersDataset: OrderRecord[] = [
      mockPendingOrder, // pending, cod, 95.000đ, createdAt 2026-11-18T09:30:00.000Z -> 16:30 VN
      {
        ...mockPendingOrder,
        id: 'ord-prep',
        orderCode: 'OM-20261118-P2Q3',
        customerName: 'Trần Bảo Ngọc',
        customerPhone: '0912345678',
        deliveryAddress: '45 Phan Đình Phùng, Đà Lạt',
        paymentMethod: 'qr',
        status: 'preparing',
        grandTotal: 65000,
        subtotal: 65000,
      },
      {
        ...mockPendingOrder,
        id: 'ord-deliv',
        orderCode: 'OM-20261118-D4E5',
        customerName: 'Lê Đặng Khoa',
        customerPhone: '0988777666',
        deliveryAddress: '544 Quốc lộ 20, Đức Trọng',
        paymentMethod: 'cod',
        status: 'delivering',
        grandTotal: 50000,
        subtotal: 50000,
      },
      {
        ...mockPendingOrder,
        id: 'ord-comp',
        orderCode: 'OM-20261118-F6G7',
        customerName: 'Phạm Hoàng Yến',
        customerPhone: '0933111222',
        paymentMethod: 'cod',
        status: 'completed',
        grandTotal: 40000,
        subtotal: 40000,
      },
      {
        ...mockPendingOrder,
        id: 'ord-canc',
        orderCode: 'OM-20261118-X0X0',
        customerName: 'Võ Thanh Tùng',
        customerPhone: '0977000111',
        paymentMethod: 'cod',
        status: 'cancelled',
        grandTotal: 120000,
        subtotal: 120000,
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: ordersDataset,
        timestamp: '2026-11-18T10:00:00.000Z',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const pendingCard = await screen.findByTestId('order-card-ord-1');
    const qrCard = screen.getByTestId('order-card-ord-prep');

    // Deterministic Vietnam timezone (2026-11-18T09:30:00.000Z === 16:30 in Asia/Ho_Chi_Minh)
    expect(within(pendingCard).getByText(/16:30/)).toBeInTheDocument();

    // VietQR transfer memo shown ONLY on QR payment orders
    expect(
      within(qrCard).getByText('CK: OMSUA OM-20261118-P2Q3 0912345678'),
    ).toBeInTheDocument();
    expect(
      within(pendingCard).queryByText(/CK: OMSUA/),
    ).not.toBeInTheDocument();

    // 4-card top KPI strip (valid revenue excludes cancelled 120.000đ -> 95k + 65k + 50k + 40k = 250.000đ)
    const kpiSection = screen.getByRole('region', {
      name: 'Tổng quan đơn hàng',
    });
    expect(within(kpiSection).getByText('Tổng đơn hàng')).toBeInTheDocument();
    expect(within(kpiSection).getByText('Đang pha chế & giao')).toBeInTheDocument();
    expect(within(kpiSection).getByText('Doanh thu hợp lệ')).toBeInTheDocument();
    expect(within(kpiSection).getByText('250.000đ')).toBeInTheDocument();

    // Status tab counters + aria-pressed
    const statusGroup = screen.getByRole('group', {
      name: 'Lọc theo trạng thái',
    });
    const allTab = within(statusGroup).getByRole('button', {
      name: 'Tất cả (5)',
    });
    const pendingTab = within(statusGroup).getByRole('button', {
      name: 'Chờ xác nhận (1)',
    });
    expect(
      within(statusGroup).getByRole('button', { name: 'Đang pha chế (1)' }),
    ).toBeInTheDocument();
    expect(
      within(statusGroup).getByRole('button', { name: 'Đang giao (1)' }),
    ).toBeInTheDocument();
    expect(
      within(statusGroup).getByRole('button', { name: 'Hoàn tất (1)' }),
    ).toBeInTheDocument();
    expect(
      within(statusGroup).getByRole('button', { name: 'Đã hủy (1)' }),
    ).toBeInTheDocument();

    expect(allTab).toHaveAttribute('aria-pressed', 'true');
    expect(pendingTab).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(pendingTab);
    expect(pendingTab).toHaveAttribute('aria-pressed', 'true');
    expect(allTab).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('order-card-ord-1')).toBeInTheDocument();
    expect(screen.queryByTestId('order-card-ord-prep')).not.toBeInTheDocument();
    // Tab switch uses loaded branch orders without unnecessary status refetch, keeping all tab counts intact!
    expect(
      within(statusGroup).getByRole('button', { name: 'Tất cả (5)' }),
    ).toBeInTheDocument();

    fireEvent.click(allTab);

    // Diacritic-insensitive search + "Xóa tìm"
    const searchInput = screen.getByLabelText('Tìm kiếm đơn hàng');
    expect(searchInput).toHaveAttribute('id', 'order-search');
    expect(searchInput).toHaveAttribute('name', 'orderSearch');

    fireEvent.change(searchInput, { target: { value: 'nguyen minh anh' } });
    expect(screen.getByTestId('order-card-ord-1')).toBeInTheDocument();
    expect(screen.queryByTestId('order-card-ord-prep')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'duc trong' } });
    expect(screen.getByTestId('order-card-ord-deliv')).toBeInTheDocument();
    expect(screen.queryByTestId('order-card-ord-1')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'P2Q3' } });
    expect(screen.getByTestId('order-card-ord-prep')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '091234' } });
    expect(screen.getByTestId('order-card-ord-prep')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'atiso' } });
    expect(screen.getByTestId('order-card-ord-1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Xóa tìm' }));
    expect(searchInput).toHaveValue('');
    expect(screen.getAllByTestId(/^order-card-/)).toHaveLength(5);
  });

  it('guards Hủy đơn with inline 2-step confirmation (Xác nhận hủy đơn / Giữ lại)', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async (input: string, init?: RequestInit) => {
        if (input.endsWith('/orders/ord-1/status') && init?.method === 'PATCH') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                ...mockPendingOrder,
                status: 'cancelled',
                updatedAt: '2026-11-18T09:50:00.000Z',
              },
              timestamp: '2026-11-18T09:50:00.000Z',
            }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [mockPendingOrder],
            timestamp: '2026-11-18T09:35:00.000Z',
          }),
        };
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const orderCard = await screen.findByTestId('order-card-ord-1');

    // Step 1: Click Hủy đơn -> should NOT call PATCH yet
    fireEvent.click(within(orderCard).getByRole('button', { name: 'Hủy đơn' }));
    expect(fetchMock).toHaveBeenCalledTimes(1); // Only initial GET /orders
    expect(
      within(orderCard).getByRole('button', { name: 'Xác nhận hủy đơn' }),
    ).toBeInTheDocument();
    const keepButton = within(orderCard).getByRole('button', {
      name: 'Giữ lại',
    });

    // Clicking Giữ lại dismisses confirmation without network request
    fireEvent.click(keepButton);
    expect(
      within(orderCard).queryByRole('button', { name: 'Xác nhận hủy đơn' }),
    ).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Step 2: Click Hủy đơn then Xác nhận hủy đơn -> sends PATCH cancelled
    fireEvent.click(within(orderCard).getByRole('button', { name: 'Hủy đơn' }));
    fireEvent.click(
      within(orderCard).getByRole('button', { name: 'Xác nhận hủy đơn' }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/ord-1/status'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'cancelled' }),
        }),
      );
    });

    await waitFor(() => {
      expect(
        within(orderCard).getByTestId('order-status-ord-1'),
      ).toHaveTextContent('Đã hủy');
    });
  });

  it('silently auto-refreshes OrdersPage every 12s when tab is visible without loading flicker and cleans up on unmount', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });

    const newlyArrivedOrder: OrderRecord = {
      ...mockPendingOrder,
      id: 'ord-live-2',
      orderCode: 'OM-20261118-L9V9',
      customerName: 'Đỗ Khánh Linh',
    };

    let pollCount = 0;
    const fetchMock = vi.fn().mockImplementation(async () => {
      pollCount += 1;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data:
            pollCount >= 2
              ? [newlyArrivedOrder, mockPendingOrder]
              : [mockPendingOrder],
          timestamp: '2026-11-18T10:12:00.000Z',
        }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    await screen.findByTestId('order-card-ord-1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Làm mới' })).toBeEnabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(12_000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(await screen.findByTestId('order-card-ord-live-2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Làm mới' })).toBeEnabled();

    // When tab is hidden, background polling pauses
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(12_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Unmount cleans up interval
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(24_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('supports MenuPage search, availability & category filters with aria-pressed, WCAG AA Signature contrast, and empty-state reset', async () => {
    const baseCatalog = getDefaultCatalog();
    const customCatalog = {
      ...baseCatalog,
      products: baseCatalog.products.map((item, index) =>
        index === 1 ? { ...item, isAvailable: false } : item,
      ),
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: customCatalog,
          timestamp: '2026-11-18T10:00:00.000Z',
        }),
      }),
    );

    render(
      <MemoryRouter initialEntries={['/menu']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const atisoCard = await screen.findByTestId('menu-product-tra-sua-atiso');

    // WCAG AA contrast check on Signature badge (text-espresso on bg-card-olive-gold)
    const signatureBadge = within(atisoCard).getByText('Signature');
    expect(signatureBadge.className).toContain('bg-card-olive-gold');
    expect(signatureBadge.className).toContain('text-espresso');
    expect(signatureBadge.className).not.toContain('text-surface-light');

    // Availability filter pills with counts & aria-pressed
    const availabilityGroup = screen.getByRole('group', {
      name: 'Lọc theo trạng thái món',
    });
    const allAvailBtn = within(availabilityGroup).getByRole('button', {
      name: 'Tất cả trạng thái (30)',
    });
    const soldOutBtn = within(availabilityGroup).getByRole('button', {
      name: 'Đang tạm hết (1)',
    });
    expect(
      within(availabilityGroup).getByRole('button', { name: 'Đang bán (29)' }),
    ).toBeInTheDocument();
    expect(allAvailBtn).toHaveAttribute('aria-pressed', 'true');
    expect(soldOutBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(soldOutBtn);
    expect(soldOutBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByTestId(/^menu-product-/)).toHaveLength(1);
    fireEvent.click(allAvailBtn);
    expect(screen.getAllByTestId(/^menu-product-/)).toHaveLength(30);

    // Category filter pills with aria-pressed
    const categoryGroup = screen.getByRole('group', {
      name: 'Lọc theo nhóm thực đơn',
    });
    const snackCategoryBtn = within(categoryGroup).getByRole('button', {
      name: 'Bánh tráng Snack',
    });
    fireEvent.click(snackCategoryBtn);
    expect(snackCategoryBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByTestId(/^menu-product-/)).toHaveLength(6);
    expect(
      screen.getByTestId('menu-product-banh-trang-tron-top-mo'),
    ).toBeInTheDocument();

    fireEvent.click(
      within(categoryGroup).getByRole('button', { name: 'Tất cả nhóm' }),
    );

    // Diacritic-insensitive search across name, englishName, description + empty state reset
    const menuSearch = screen.getByLabelText('Tìm món trong thực đơn');
    expect(menuSearch).toHaveAttribute('id', 'menu-search');
    expect(menuSearch).toHaveAttribute('name', 'menuSearch');

    fireEvent.change(menuSearch, { target: { value: 'banh trang tron' } });
    expect(
      screen.getByTestId('menu-product-banh-trang-tron-top-mo'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('menu-product-tra-sua-atiso'),
    ).not.toBeInTheDocument();

    fireEvent.change(menuSearch, {
      target: { value: 'khong-ton-tai-mon-nay-999' },
    });
    expect(screen.queryAllByTestId(/^menu-product-/)).toHaveLength(0);

    const resetBtn = screen.getByRole('button', { name: 'Đặt lại bộ lọc' });
    fireEvent.click(resetBtn);
    expect(menuSearch).toHaveValue('');
    expect(screen.getAllByTestId(/^menu-product-/)).toHaveLength(30);
  });

  it('displays chain-wide KPI summary, per-branch Hoàn tất stat, and explicit alert when orders sync fails on BranchesPage', async () => {
    const completedOrder: OrderRecord = {
      ...mockPendingOrder,
      id: 'ord-comp-cs1',
      orderCode: 'OM-20261118-C9C9',
      status: 'completed',
      grandTotal: 55000,
    };

    const fetchSuccess = vi.fn().mockImplementation(async (input: string) => {
      if (input.endsWith('/branches')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: OMSUA_BRANCHES,
            timestamp: '2026-11-18T10:00:00.000Z',
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [mockPendingOrder, completedOrder],
          timestamp: '2026-11-18T10:00:00.000Z',
        }),
      };
    });
    vi.stubGlobal('fetch', fetchSuccess);

    const { unmount } = render(
      <MemoryRouter initialEntries={['/branches']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const chainSummary = await screen.findByRole('region', {
      name: 'Tổng quan toàn chuỗi',
    });
    expect(within(chainSummary).getByText('4 Cơ sở hoạt động')).toBeInTheDocument();
    expect(within(chainSummary).getByText('Tổng đơn toàn chuỗi')).toBeInTheDocument();
    expect(within(chainSummary).getByText('Đơn đang xử lý')).toBeInTheDocument();
    expect(within(chainSummary).getByText('Tổng doanh thu hợp lệ')).toBeInTheDocument();
    expect(within(chainSummary).getByText('150.000đ')).toBeInTheDocument();

    const cs1Card = screen.getByTestId('branch-card-cs1-hoang-dieu');
    expect(within(cs1Card).getByText('Hoàn tất')).toBeInTheDocument();

    unmount();

    // Partial failure: /branches succeeds, /orders fails -> explicit alert banner
    const fetchPartialError = vi.fn().mockImplementation(async (input: string) => {
      if (input.endsWith('/branches')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: OMSUA_BRANCHES,
            timestamp: '2026-11-18T10:05:00.000Z',
          }),
        };
      }
      return {
        ok: false,
        status: 503,
        json: async () => ({ message: 'Dịch vụ đơn hàng tạm gián đoạn' }),
      };
    });
    vi.stubGlobal('fetch', fetchPartialError);

    render(
      <MemoryRouter initialEntries={['/branches']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const alertBanner = await screen.findByRole('alert');
    expect(alertBanner).toHaveTextContent(/Dịch vụ đơn hàng tạm gián đoạn/i);
  });

  it('displays active Admin origin and Swagger /docs URL on SettingsPage', async () => {
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
            uptime: 25,
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

    await screen.findByText(/omsua-backend/i);
    expect(screen.getByText(window.location.origin)).toBeInTheDocument();
    expect(
      screen.getByText('http://localhost:4000/api/docs'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Web :3000 · Admin :3001 · Backend :4000/),
    ).toBeInTheDocument();
  });
});
