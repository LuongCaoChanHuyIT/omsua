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
});
