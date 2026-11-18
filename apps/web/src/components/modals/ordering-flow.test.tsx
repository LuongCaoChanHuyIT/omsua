// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import {
  OMSUA_BRANCHES,
  type CreateOrderPayload,
  type OrderRecord,
  type ProductItem,
  getDefaultCatalog,
} from '@omsua/shared';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StorefrontClientShell } from '@/components/storefront/StorefrontClientShell';
import { CartProvider } from '@/store/cart-store';
import { CartCheckoutDrawer } from './CartCheckoutDrawer';
import { ProductCustomizerModal } from './ProductCustomizerModal';

describe('Interactive Customizer Modal & Cart Checkout Flow', () => {
  const catalog = getDefaultCatalog();
  const traSuaAtiso = catalog.products.find(
    (product) => product.id === 'tra-sua-atiso',
  )!;

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('customizes Trà Sữa Atiso with 2 toppings (65.000đ) and submits QR checkout order displaying OM-... code', async () => {
    const mockOrder: OrderRecord = {
      id: 'ord-101',
      orderCode: 'OM-20261118-7788',
      branchId: 'cs1-hoang-dieu',
      branchName: 'Cơ sở 1 — Hoàng Diệu',
      customerName: 'Nguyễn Lan',
      customerPhone: '0945396117',
      deliveryAddress: '12 Khu Hòa Bình, Đà Lạt',
      paymentMethod: 'qr',
      status: 'pending',
      items: [],
      subtotal: 65000,
      shippingFee: 0,
      ecoFee: 0,
      grandTotal: 65000,
      totalItems: 1,
      createdAt: '2026-11-18T09:30:00.000Z',
      updatedAt: '2026-11-18T09:30:00.000Z',
    };

    const submitOrderMock = vi
      .fn<
        (
          payload: CreateOrderPayload,
        ) => Promise<{ ok: true; order: OrderRecord } | { ok: false; error: string }>
      >()
      .mockResolvedValue({ ok: true, order: mockOrder });

    function OrderingHarness() {
      const [activeProduct, setActiveProduct] = useState<ProductItem | null>(
        traSuaAtiso,
      );
      const [isCartOpen, setIsCartOpen] = useState(false);

      return (
        <CartProvider catalog={catalog} branches={OMSUA_BRANCHES}>
          <button type="button" onClick={() => setIsCartOpen(true)}>
            Mở giỏ hàng test
          </button>
          <ProductCustomizerModal
            product={activeProduct}
            toppings={catalog.toppings}
            onClose={() => setActiveProduct(null)}
          />
          <CartCheckoutDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            submitOrderFn={submitOrderMock}
          />
        </CartProvider>
      );
    }

    render(<OrderingHarness />);

    const customizerDialog = screen.getByRole('dialog', {
      name: /Tùy chỉnh ly của bạn/i,
    });
    expect(within(customizerDialog).getByText('+ SIGNATURE')).toBeInTheDocument();
    expect(
      within(customizerDialog).getByText('Giá gốc: 45.000đ'),
    ).toBeInTheDocument();

    fireEvent.click(
      within(customizerDialog).getByRole('checkbox', {
        name: /Trân châu đen nấu mật/i,
      }),
    );
    fireEvent.click(
      within(customizerDialog).getByRole('checkbox', {
        name: /Khúc bạch hạnh nhân/i,
      }),
    );

    const addToCartBtn = within(customizerDialog).getByRole('button', {
      name: 'Thêm vào giỏ • 65.000đ',
    });
    expect(addToCartBtn).toBeInTheDocument();
    expect(
      within(customizerDialog).getByText(
        '45k (Size M) + 10k (Khúc bạch) + 10k (Trân châu đen) = 65.000đ',
      ),
    ).toBeInTheDocument();

    fireEvent.click(addToCartBtn);
    expect(
      screen.queryByRole('dialog', { name: /Tùy chỉnh ly của bạn/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mở giỏ hàng test' }));

    const cartDialog = screen.getByRole('dialog', {
      name: /Giỏ hàng của bạn \(1 món\)/i,
    });
    expect(
      within(cartDialog).getByText('Size M • 70% đường • 70% đá'),
    ).toBeInTheDocument();
    expect(
      within(cartDialog).getByText(/\+ Khúc bạch \(\+10k\), Trân châu đen \(\+10k\)/i),
    ).toBeInTheDocument();
    expect(
      within(cartDialog).getByText(/CHI NHÁNH PHỤC VỤ GẦN BẠN NHẤT/i),
    ).toBeInTheDocument();
    expect(
      within(cartDialog).getByText(
        /Phí giao hàng nội thành Đà Lạt:/i,
      ),
    ).toBeInTheDocument();

    fireEvent.change(
      within(cartDialog).getByLabelText(/Họ và tên người nhận/i),
      { target: { value: 'Nguyễn Lan' } },
    );
    fireEvent.change(within(cartDialog).getByLabelText(/Số điện thoại/i), {
      target: { value: '0945396117' },
    });
    fireEvent.change(within(cartDialog).getByLabelText(/Địa chỉ giao hàng/i), {
      target: { value: '12 Khu Hòa Bình, Đà Lạt' },
    });

    fireEvent.click(
      within(cartDialog).getByRole('button', { name: /Chuyển khoản QR/i }),
    );
    expect(
      within(cartDialog).getByText(/OMSUA 0945396117/i),
    ).toBeInTheDocument();

    fireEvent.click(
      within(cartDialog).getByRole('button', {
        name: 'Xác nhận đặt món • 65.000đ →',
      }),
    );

    await waitFor(() => {
      expect(submitOrderMock).toHaveBeenCalledTimes(1);
    });

    expect(submitOrderMock.mock.calls[0]?.[0]).toEqual({
      branchId: 'cs1-hoang-dieu',
      customerName: 'Nguyễn Lan',
      customerPhone: '0945396117',
      deliveryAddress: '12 Khu Hòa Bình, Đà Lạt',
      paymentMethod: 'qr',
      items: [
        {
          productId: 'tra-sua-atiso',
          quantity: 1,
          size: 'M',
          sugarLevel: '70',
          iceLevel: '70',
          toppingIds: ['khuc-bach', 'tran-chau-den'],
        },
      ],
    });

    expect(await screen.findByText('OM-20261118-7788')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Tiếp tục đặt món' }),
    ).toBeInTheDocument();
  });

  it('wires StorefrontClientShell snack customization, branch switching, client validation, Escape close, and warm palette compliance', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    const { container } = render(
      <StorefrontClientShell
        initialCatalog={catalog}
        initialBranches={OMSUA_BRANCHES}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '🌶 Cay nhiều' }));

    const topMoCard = screen
      .getByText('Bánh Tráng Trộn Tóp Mỡ')
      .closest('article') as HTMLElement;
    fireEvent.click(
      within(topMoCard).getByRole('button', { name: '+ Thêm món ăn vặt' }),
    );

    const snackModal = screen.getByRole('dialog');
    expect(
      within(snackModal).getByRole('button', { name: 'Cay nhiều' }),
    ).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(
      within(snackModal).getByRole('button', { name: 'Tăng số lượng' }),
    );
    expect(
      within(snackModal).getByRole('button', {
        name: 'Thêm vào giỏ • 80.000đ',
      }),
    ).toBeInTheDocument();

    expect(container.innerHTML).not.toMatch(
      /(#fff\b|#ffffff\b|#000\b|#000000\b|bg-white|text-white|bg-black|text-black)/i,
    );

    fireEvent.click(
      within(snackModal).getByRole('button', {
        name: 'Thêm vào giỏ • 80.000đ',
      }),
    );

    const headerCartBtn = screen.getByRole('button', {
      name: /Giỏ hàng \(2\) • 80k/i,
    });
    fireEvent.click(headerCartBtn);

    const drawer = screen.getByRole('dialog', {
      name: /Giỏ hàng của bạn \(2 món\)/i,
    });
    expect(within(drawer).getByText('SL: 2 phần')).toBeInTheDocument();
    expect(
      within(drawer).getByText(/Độ cay: Cay nhiều/i),
    ).toBeInTheDocument();

    fireEvent.click(
      within(drawer).getByRole('button', { name: 'Đổi chi nhánh khác' }),
    );
    fireEvent.click(
      within(drawer).getByRole('button', { name: /Cơ sở 4 — Đức Trọng/i }),
    );
    expect(
      within(drawer).getByText(/544 Quốc lộ 20/i),
    ).toBeInTheDocument();

    expect(container.innerHTML).not.toMatch(
      /(#fff\b|#ffffff\b|#000\b|#000000\b|bg-white|text-white|bg-black|text-black)/i,
    );

    fireEvent.click(
      within(drawer).getByRole('button', {
        name: 'Xác nhận đặt món • 80.000đ →',
      }),
    );
    expect(within(drawer).getByRole('alert')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: /Giỏ hàng của bạn/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('blocks Escape, backdrop click, and close button while submitOrder is pending, and enforces quantity <= 99 and 300-char note limit', async () => {
    window.localStorage.setItem(
      'omsua.cart.v1',
      JSON.stringify({
        selectedBranchId: 'cs1-hoang-dieu',
        items: [
          {
            productId: 'tra-sua-atiso',
            quantity: 99,
            size: 'M',
            sugarLevel: '70',
            iceLevel: '70',
            toppingIds: [],
          },
        ],
      }),
    );

    let resolveSubmit!: (
      result: { ok: true; order: OrderRecord } | { ok: false; error: string },
    ) => void;
    const submitOrderMock = vi.fn(
      () =>
        new Promise<
          { ok: true; order: OrderRecord } | { ok: false; error: string }
        >((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const onCloseSpy = vi.fn();

    render(
      <CartProvider catalog={catalog} branches={OMSUA_BRANCHES}>
        <CartCheckoutDrawer
          isOpen={true}
          onClose={onCloseSpy}
          submitOrderFn={submitOrderMock}
        />
      </CartProvider>,
    );

    const dialog = await screen.findByRole('dialog', {
      name: /Giỏ hàng của bạn \(99 món\)/i,
    });

    // + button disabled at 99
    expect(
      within(dialog).getByRole('button', {
        name: 'Tăng số lượng Trà Sữa Atiso',
      }),
    ).toBeDisabled();

    // Note input maxLength=300 and client-side >300 validation
    const noteInput = within(dialog).getByLabelText(/Ghi chú đơn hàng/i);
    expect(noteInput).toHaveAttribute('maxLength', '300');

    fireEvent.change(
      within(dialog).getByLabelText(/Họ và tên người nhận/i),
      { target: { value: 'Nguyễn Lan' } },
    );
    fireEvent.change(within(dialog).getByLabelText(/Số điện thoại/i), {
      target: { value: '0945396117' },
    });
    fireEvent.change(within(dialog).getByLabelText(/Địa chỉ giao hàng/i), {
      target: { value: '12 Khu Hòa Bình, Đà Lạt' },
    });
    fireEvent.change(noteInput, {
      target: { value: 'A'.repeat(301) },
    });

    fireEvent.click(
      within(dialog).getByRole('button', {
        name: /Xác nhận đặt món/i,
      }),
    );
    expect(
      within(dialog).getByText('Ghi chú không được vượt quá 300 ký tự.'),
    ).toBeInTheDocument();
    expect(submitOrderMock).not.toHaveBeenCalled();

    // Fix note and submit (now pending)
    fireEvent.change(noteInput, {
      target: { value: 'Giao nhanh giúp mình' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', {
        name: /Xác nhận đặt món/i,
      }),
    );

    expect(
      await within(dialog).findByRole('button', {
        name: 'Đang xử lý đơn hàng...',
      }),
    ).toBeDisabled();

    const closeBtn = within(dialog).getByRole('button', {
      name: 'Đóng giỏ hàng',
    });
    expect(closeBtn).toBeDisabled();

    // Escape, close button click, and backdrop click must all be ignored while pending
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(closeBtn);
    fireEvent.click(dialog.parentElement as HTMLElement);

    expect(onCloseSpy).not.toHaveBeenCalled();

    resolveSubmit({
      ok: true,
      order: {
        id: 'ord-pending-guard',
        orderCode: 'OM-20261118-9999',
        branchId: 'cs1-hoang-dieu',
        branchName: 'Cơ sở 1 — Hoàng Diệu',
        customerName: 'Nguyễn Lan',
        customerPhone: '0945396117',
        deliveryAddress: '12 Khu Hòa Bình, Đà Lạt',
        note: 'Giao nhanh giúp mình',
        paymentMethod: 'cod',
        status: 'pending',
        items: [],
        subtotal: 4455000,
        shippingFee: 0,
        ecoFee: 0,
        grandTotal: 4455000,
        totalItems: 99,
        createdAt: '2026-11-18T10:00:00.000Z',
        updatedAt: '2026-11-18T10:00:00.000Z',
      },
    });

    expect(await screen.findByText('OM-20261118-9999')).toBeInTheDocument();
  });

  it('re-fetches catalog on drawer open and onOrderError, renders unavailableItems warning + 1-click "Gỡ món tạm hết" with visible errorMessage when lines.length === 0, and flips Storefront card to Tạm hết', async () => {
    let atisoAvailableOnBackend = true;

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input: string | URL | Request, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

        if (url.endsWith('/api/catalog')) {
          const liveCatalog = getDefaultCatalog();
          if (!atisoAvailableOnBackend) {
            liveCatalog.products = liveCatalog.products.map((product) =>
              product.id === 'tra-sua-atiso'
                ? { ...product, isAvailable: false }
                : product,
            );
          }
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: liveCatalog,
              timestamp: '2026-11-18T10:00:00.000Z',
            }),
          } as Response;
        }

        if (url.endsWith('/api/orders') && init?.method === 'POST') {
          atisoAvailableOnBackend = false;
          return {
            ok: false,
            status: 400,
            json: async () => ({
              statusCode: 400,
              message: 'Món "Trà Sữa Atiso" hiện đang tạm hết.',
              error: 'Bad Request',
            }),
          } as Response;
        }

        return { ok: false, status: 404, json: async () => ({}) } as Response;
      });

    const { container } = render(
      <StorefrontClientShell
        initialCatalog={getDefaultCatalog()}
        initialBranches={OMSUA_BRANCHES}
        apiBaseUrl="http://localhost:4000/api"
      />,
    );

    // Empty cart header button uses 0đ instead of 0k
    expect(
      screen.getByRole('button', { name: 'Giỏ hàng (0) • 0đ' }),
    ).toBeInTheDocument();

    // Add Trà Sữa Atiso (only item in cart)
    const menuSection = container.querySelector('#thuc-don') as HTMLElement;
    const atisoMenuCard = within(menuSection)
      .getByText('Trà Sữa Atiso')
      .closest('article') as HTMLElement;
    fireEvent.click(within(atisoMenuCard).getByRole('button', { name: '+ Thêm' }));

    const customizer = screen.getByRole('dialog', {
      name: /Tùy chỉnh ly của bạn/i,
    });
    fireEvent.click(
      within(customizer).getByRole('button', {
        name: 'Thêm vào giỏ • 45.000đ',
      }),
    );

    // Open cart drawer -> triggers catalog refresh
    const catalogCallsBeforeOpen = fetchSpy.mock.calls.filter(([u]) =>
      String(u).endsWith('/api/catalog'),
    ).length;
    fireEvent.click(
      screen.getByRole('button', { name: 'Giỏ hàng (1) • 45k' }),
    );

    await waitFor(() => {
      const catalogCallsAfterOpen = fetchSpy.mock.calls.filter(([u]) =>
        String(u).endsWith('/api/catalog'),
      ).length;
      expect(catalogCallsAfterOpen).toBeGreaterThan(catalogCallsBeforeOpen);
    });

    const drawer = screen.getByRole('dialog', {
      name: /Giỏ hàng của bạn/i,
    });
    fireEvent.change(
      within(drawer).getByLabelText(/Họ và tên người nhận/i),
      { target: { value: 'Lê Minh Tuấn' } },
    );
    fireEvent.change(within(drawer).getByLabelText(/Số điện thoại/i), {
      target: { value: '0912345678' },
    });
    fireEvent.change(within(drawer).getByLabelText(/Địa chỉ giao hàng/i), {
      target: { value: '25 Trương Công Định, Đà Lạt' },
    });

    // Submit order -> POST /api/orders fails 400 because Trà Sữa Atiso sold out mid-session -> triggers onOrderError catalog refresh!
    fireEvent.click(
      within(drawer).getByRole('button', {
        name: 'Xác nhận đặt món • 45.000đ →',
      }),
    );

    // Storefront menu card flips immediately to disabled "Tạm hết" without reload
    await waitFor(() => {
      expect(
        within(atisoMenuCard).getByRole('button', { name: 'Tạm hết' }),
      ).toBeDisabled();
    });

    // Even though lines.length === 0 now, BOTH errorMessage AND unavailableItems warning banner + 1-click "Gỡ món tạm hết" remain visible, and submit button is disabled!
    expect(within(drawer).getByRole('alert')).toHaveTextContent(
      'Món "Trà Sữa Atiso" hiện đang tạm hết.',
    );
    const removeSoldOutBtn = within(drawer).getByRole('button', {
      name: 'Gỡ món tạm hết',
    });
    expect(removeSoldOutBtn).toBeInTheDocument();
    expect(
      within(drawer).getByRole('button', {
        name: 'Xóa món tạm hết Trà Sữa Atiso',
      }),
    ).toBeInTheDocument();
    expect(
      within(drawer).getByRole('button', { name: /Xác nhận đặt món/i }),
    ).toBeDisabled();

    expect(container.innerHTML).not.toMatch(
      /(#fff\b|#ffffff\b|#000\b|#000000\b|bg-white|text-white|bg-black|text-black)/i,
    );

    // Clicking "Gỡ món tạm hết" clears unavailable items and shows empty cart state
    fireEvent.click(removeSoldOutBtn);
    expect(
      await within(drawer).findByText('Giỏ hàng của bạn đang trống'),
    ).toBeInTheDocument();
  });
});
