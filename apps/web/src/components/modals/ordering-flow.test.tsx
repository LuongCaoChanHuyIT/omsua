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
import { OrderLookupModal } from './OrderLookupModal';
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

  it('opens ProductCustomizerModal pre-checked from ToppingStripSection + Chọn, renders custom warm checkboxes & sticky breakdown, and displays mobile sticky bottom cart bar + skip link', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    render(
      <StorefrontClientShell
        initialCatalog={getDefaultCatalog()}
        initialBranches={OMSUA_BRANCHES}
      />,
    );

    const skipLink = screen.getByRole('link', {
      name: 'Chuyển đến thực đơn chính',
    });
    expect(skipLink).toHaveAttribute('href', '#thuc-don');

    // Click "+ Chọn" on Kem trứng (+20k) in ToppingStripSection
    fireEvent.click(
      screen.getByRole('button', { name: 'Chọn topping Kem trứng' }),
    );

    const customizer = screen.getByRole('dialog', {
      name: /Tùy chỉnh ly của bạn/i,
    });
    expect(
      within(customizer).getByRole('heading', { name: 'Trà Sữa Atiso' }),
    ).toBeInTheDocument();

    const kemTrungCheckbox = within(customizer).getByRole('checkbox', {
      name: /Kem trứng khò béo mịn/i,
    });
    expect(kemTrungCheckbox).toBeChecked();
    expect(kemTrungCheckbox.className).toContain('sr-only');

    // Sticky footer breakdown has aria-live="polite" and reflects 45k + 20k = 65.000đ
    const breakdown = within(customizer).getByText(
      '45k (Size M) + 20k (Kem trứng) = 65.000đ',
    );
    expect(breakdown).toHaveAttribute('aria-live', 'polite');

    fireEvent.click(
      within(customizer).getByRole('button', {
        name: 'Thêm vào giỏ • 65.000đ',
      }),
    );

    // Header cart button remains uniquely queryable while mobile sticky bar uses distinct copy
    expect(
      screen.getByRole('button', { name: 'Giỏ hàng (1) • 65k' }),
    ).toBeInTheDocument();
    const mobileStickyBtn = screen.getByRole('button', {
      name: 'Xem giỏ hàng (1 món) • 65.000đ →',
    });
    expect(mobileStickyBtn).toBeInTheDocument();

    fireEvent.click(mobileStickyBtn);
    expect(
      screen.getByRole('dialog', { name: /Giỏ hàng của bạn \(1 món\)/i }),
    ).toBeInTheDocument();
  });

  it('renders VietQrTransferCard with copy feedback, Đức Trọng ETA/shipping copy, itemized receipt, and clears unavailable error on last per-item Xóa', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    const itemizedQrOrder: OrderRecord = {
      id: 'ord-qr-full',
      orderCode: 'OM-20261119-5566',
      branchId: 'cs4-duc-trong',
      branchName: 'Cơ sở 4 — Đức Trọng',
      customerName: 'Phạm Hoàng Yến',
      customerPhone: '0937444555',
      deliveryAddress: '544 Quốc lộ 20, Liên Nghĩa, Đức Trọng',
      paymentMethod: 'qr',
      status: 'pending',
      items: [
        {
          canonicalKey:
            'tra-sua-atiso|size:L|sugar:50|ice:70|spice:-|toppings:tran-chau-den',
          productId: 'tra-sua-atiso',
          productName: 'Trà Sữa Atiso',
          kind: 'drink',
          quantity: 2,
          size: 'L',
          sizeLabel: 'Size L (Lớn)',
          basePrice: 50000,
          sugarLevel: '50',
          iceLevel: '70',
          toppings: [
            {
              id: 'tran-chau-den',
              name: 'Trân châu đen nấu mật',
              shortName: 'Trân châu đen',
              price: 10000,
            },
          ],
          unitPrice: 60000,
          lineTotal: 120000,
        },
      ],
      subtotal: 120000,
      shippingFee: 0,
      ecoFee: 0,
      grandTotal: 120000,
      totalItems: 2,
      createdAt: '2026-11-19T03:00:00.000Z',
      updatedAt: '2026-11-19T03:00:00.000Z',
    };

    // First verify per-item Xóa clears unavailable error message when removing the last unavailable item
    const catalogWithSoldOutSnack = getDefaultCatalog();
    catalogWithSoldOutSnack.products = catalogWithSoldOutSnack.products.map(
      (p) =>
        p.id === 'com-chay-cha-bong' ? { ...p, isAvailable: false } : p,
    );

    window.localStorage.setItem(
      'omsua.cart.v1',
      JSON.stringify({
        selectedBranchId: 'cs4-duc-trong',
        items: [
          {
            productId: 'com-chay-cha-bong',
            quantity: 1,
            size: 'STD',
            spiceLevel: 'cay-vua',
          },
          {
            productId: 'tra-sua-atiso',
            quantity: 2,
            size: 'L',
            sugarLevel: '50',
            iceLevel: '70',
            toppingIds: ['tran-chau-den'],
          },
        ],
      }),
    );

    const submitOrderMock = vi
      .fn()
      .mockResolvedValue({ ok: true, order: itemizedQrOrder });

    render(
      <CartProvider catalog={catalogWithSoldOutSnack} branches={OMSUA_BRANCHES}>
        <CartCheckoutDrawer
          isOpen={true}
          onClose={vi.fn()}
          submitOrderFn={submitOrderMock}
        />
      </CartProvider>,
    );

    const drawer = await screen.findByRole('dialog', {
      name: /Giỏ hàng của bạn \(2 món\)/i,
    });

    // Đức Trọng ETA & shipping copy
    expect(
      within(drawer).getByText(
        /Giao tận nơi khu vực Đức Trọng dự kiến 20–25 phút/i,
      ),
    ).toBeInTheDocument();
    expect(
      within(drawer).getByText(/Phí giao hàng khu vực Đức Trọng:/i),
    ).toBeInTheDocument();

    // Form inputs carry explicit name attributes and mobile anti-zoom text-base sm:text-sm
    const phoneInput = within(drawer).getByLabelText(/Số điện thoại/i);
    expect(phoneInput).toHaveAttribute('name', 'customerPhone');
    expect(phoneInput.className).toContain('text-base');

    // Trigger unavailable error via form submit (bypassing disabled button via form submit event) then click per-item Xóa
    fireEvent.submit(drawer.querySelector('form')!);
    expect(within(drawer).getByRole('alert')).toHaveTextContent(/tạm hết/i);

    fireEvent.click(
      within(drawer).getByRole('button', {
        name: 'Xóa món tạm hết Cơm Cháy Chà Bông',
      }),
    );
    expect(within(drawer).queryByRole('alert')).not.toBeInTheDocument();

    // Select QR payment -> renders VietQrTransferCard with Vietcombank details + copy button
    fireEvent.change(
      within(drawer).getByLabelText(/Họ và tên người nhận/i),
      { target: { value: 'Phạm Hoàng Yến' } },
    );
    fireEvent.change(phoneInput, { target: { value: '0937444555' } });
    fireEvent.change(within(drawer).getByLabelText(/Địa chỉ giao hàng/i), {
      target: { value: '544 Quốc lộ 20, Liên Nghĩa, Đức Trọng' },
    });

    fireEvent.click(
      within(drawer).getByRole('button', { name: /Chuyển khoản QR/i }),
    );
    expect(
      within(drawer).getByText(/Vietcombank — CN Lâm Đồng/i),
    ).toBeInTheDocument();
    expect(within(drawer).getByText(/OM SUA DA LAT/i)).toBeInTheDocument();
    expect(within(drawer).getByText(/0561 0005 20178/i)).toBeInTheDocument();

    const copyBtn = within(drawer).getByRole('button', {
      name: 'Sao chép nội dung CK',
    });
    fireEvent.click(copyBtn);
    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('OMSUA 0937444555');
    });
    const copiedStatus = await within(drawer).findByText('✓ Đã sao chép');
    expect(copiedStatus).toHaveAttribute('aria-live', 'polite');

    // Submit order -> receipt renders status pill, itemized items, and VietQrTransferCard with orderCode
    fireEvent.click(
      within(drawer).getByRole('button', {
        name: 'Xác nhận đặt món • 120.000đ →',
      }),
    );

    expect(await within(drawer).findByText('OM-20261119-5566')).toBeInTheDocument();
    expect(within(drawer).getByText('Chờ xác nhận')).toBeInTheDocument();
    expect(within(drawer).getByText('Trà Sữa Atiso')).toBeInTheDocument();
    expect(
      within(drawer).getByText(/Size L • 50% đường • 70% đá/i),
    ).toBeInTheDocument();
    expect(
      within(drawer).getByText('OMSUA OM-20261119-5566 0937444555'),
    ).toBeInTheDocument();
  });

  it('persists recent orders across reloads, updates header Đơn đã đặt (N) pill, and tracks live status + refresh + cancelled state in OrderLookupModal', async () => {
    let currentOrderStatus: OrderRecord['status'] = 'preparing';

    const trackedOrderBase: OrderRecord = {
      id: 'ord-track-1',
      orderCode: 'OM-20261119-3344',
      branchId: 'cs1-hoang-dieu',
      branchName: 'Cơ sở 1 — Hoàng Diệu',
      customerName: 'Đỗ Gia Huy',
      customerPhone: '0988112233',
      deliveryAddress: '08 Bùi Thị Xuân, Đà Lạt',
      paymentMethod: 'qr',
      status: 'pending',
      items: [
        {
          canonicalKey:
            'banh-trang-tron-top-mo|size:STD|sugar:-|ice:-|spice:cay-nhieu|toppings:-',
          productId: 'banh-trang-tron-top-mo',
          productName: 'Bánh Tráng Trộn Tóp Mỡ',
          kind: 'snack',
          quantity: 1,
          size: 'STD',
          sizeLabel: 'Phần chuẩn',
          basePrice: 40000,
          spiceLevel: 'cay-nhieu',
          toppings: [],
          unitPrice: 40000,
          lineTotal: 40000,
        },
      ],
      subtotal: 40000,
      shippingFee: 0,
      ecoFee: 0,
      grandTotal: 40000,
      totalItems: 1,
      createdAt: '2026-11-19T04:00:00.000Z',
      updatedAt: '2026-11-19T04:05:00.000Z',
    };

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.endsWith('/api/orders') && init?.method === 'POST') {
        return {
          ok: true,
          status: 201,
          json: async () => ({
            success: true,
            data: trackedOrderBase,
            timestamp: '2026-11-19T04:00:00.000Z',
          }),
        } as Response;
      }

      if (url.endsWith('/api/orders/code/OM-20261119-3344')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { ...trackedOrderBase, status: currentOrderStatus },
            timestamp: '2026-11-19T04:06:00.000Z',
          }),
        } as Response;
      }

      if (url.endsWith('/api/orders/code/OM-20261119-9999')) {
        return {
          ok: false,
          status: 404,
          json: async () => ({
            statusCode: 404,
            message: 'Không tìm thấy đơn hàng "OM-20261119-9999".',
          }),
        } as Response;
      }

      return { ok: false, status: 503, json: async () => ({}) } as Response;
    });

    const { container, unmount } = render(
      <StorefrontClientShell
        initialCatalog={getDefaultCatalog()}
        initialBranches={OMSUA_BRANCHES}
        apiBaseUrl="http://localhost:4000/api"
      />,
    );

    // Initially 0 recent orders -> header pill says "Đơn đã đặt"
    expect(
      screen.getByRole('button', { name: 'Đơn đã đặt' }),
    ).toBeInTheDocument();

    // Add snack and submit order
    const topMoCard = screen
      .getByText('Bánh Tráng Trộn Tóp Mỡ')
      .closest('article') as HTMLElement;
    fireEvent.click(
      within(topMoCard).getByRole('button', { name: '+ Thêm món ăn vặt' }),
    );
    const snackDialog = screen.getByRole('dialog');
    fireEvent.click(
      within(snackDialog).getByRole('button', {
        name: 'Thêm vào giỏ • 40.000đ',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Giỏ hàng (1) • 40k' }),
    );
    const drawer = screen.getByRole('dialog', {
      name: /Giỏ hàng của bạn/i,
    });
    fireEvent.change(
      within(drawer).getByLabelText(/Họ và tên người nhận/i),
      { target: { value: 'Đỗ Gia Huy' } },
    );
    fireEvent.change(within(drawer).getByLabelText(/Số điện thoại/i), {
      target: { value: '0988112233' },
    });
    fireEvent.change(within(drawer).getByLabelText(/Địa chỉ giao hàng/i), {
      target: { value: '08 Bùi Thị Xuân, Đà Lạt' },
    });
    fireEvent.click(
      within(drawer).getByRole('button', { name: /Chuyển khoản QR/i }),
    );
    fireEvent.click(
      within(drawer).getByRole('button', {
        name: 'Xác nhận đặt món • 40.000đ →',
      }),
    );

    expect(await within(drawer).findByText('OM-20261119-3344')).toBeInTheDocument();

    // Header pill immediately reflects 1 saved recent order!
    expect(
      screen.getByRole('button', { name: 'Đơn đã đặt (1)' }),
    ).toBeInTheDocument();

    // Click "Theo dõi trạng thái đơn" on receipt -> opens OrderLookupModal and syncs live status ("Đang pha chế")
    fireEvent.click(
      within(drawer).getByRole('button', { name: 'Theo dõi trạng thái đơn' }),
    );

    const lookupDialog = await screen.findByRole('dialog', {
      name: /Tra cứu & theo dõi đơn hàng/i,
    });
    await waitFor(() => {
      expect(
        within(lookupDialog).getByText('Đang pha chế').closest('[aria-current="step"]'),
      ).not.toBeNull();
    });
    expect(
      within(lookupDialog).getByText('Bánh Tráng Trộn Tóp Mỡ'),
    ).toBeInTheDocument();
    expect(
      within(lookupDialog).getByText('OMSUA OM-20261119-3344 0988112233'),
    ).toBeInTheDocument();

    expect(container.innerHTML).not.toMatch(
      /(#fff\b|#ffffff\b|#000\b|#000000\b|bg-white|text-white|bg-black|text-black)/i,
    );

    // Simulate F5 reload by unmounting and mounting a fresh StorefrontClientShell
    unmount();
    render(
      <StorefrontClientShell
        initialCatalog={getDefaultCatalog()}
        initialBranches={OMSUA_BRANCHES}
        apiBaseUrl="http://localhost:4000/api"
      />,
    );

    const headerSavedBtn = await screen.findByRole('button', {
      name: 'Đơn đã đặt (1)',
    });
    fireEvent.click(headerSavedBtn);

    const reloadedModal = screen.getByRole('dialog', {
      name: /Tra cứu & theo dõi đơn hàng/i,
    });

    // Click recent order chip in 1 click!
    const recentChip = within(reloadedModal).getByRole('button', {
      name: /OM-20261119-3344/i,
    });
    fireEvent.click(recentChip);

    expect(
      await within(reloadedModal).findByText('Bánh Tráng Trộn Tóp Mỡ'),
    ).toBeInTheDocument();

    // Backend transitions to cancelled -> click "Làm mới trạng thái" -> shows Đã hủy badge and hides VietQR card
    currentOrderStatus = 'cancelled';
    fireEvent.click(
      within(reloadedModal).getByRole('button', {
        name: 'Làm mới trạng thái',
      }),
    );

    await waitFor(() => {
      expect(
        within(reloadedModal).queryByText('OMSUA OM-20261119-3344 0988112233'),
      ).not.toBeInTheDocument();
    });
    expect(
      within(reloadedModal).getAllByText('Đã hủy').length,
    ).toBeGreaterThanOrEqual(1);

    // Also test manual input lookup for a 404 order code
    const codeInput = within(reloadedModal).getByLabelText(/Mã đơn hàng/i);
    expect(codeInput).toHaveAttribute('name', 'orderCode');
    fireEvent.change(codeInput, { target: { value: 'om-20261119-9999' } });
    fireEvent.click(
      within(reloadedModal).getByRole('button', { name: 'Tra cứu đơn' }),
    );
    expect(
      await within(reloadedModal).findByRole('alert'),
    ).toHaveTextContent('Không tìm thấy đơn hàng "OM-20261119-9999".');
  });

  it('supports standalone OrderLookupModal direct prop injection', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      error: 'Không tìm thấy đơn.',
    });
    render(
      <OrderLookupModal
        isOpen={true}
        onClose={vi.fn()}
        fetchOrderByCodeFn={fetchMock}
      />,
    );
    const modal = screen.getByRole('dialog', {
      name: /Tra cứu & theo dõi đơn hàng/i,
    });
    fireEvent.change(within(modal).getByLabelText(/Mã đơn hàng/i), {
      target: { value: 'OM-20261119-0000' },
    });
    fireEvent.click(
      within(modal).getByRole('button', { name: 'Tra cứu đơn' }),
    );
    expect(await within(modal).findByRole('alert')).toHaveTextContent(
      'Không tìm thấy đơn.',
    );
  });
});
