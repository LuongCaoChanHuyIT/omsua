import '@testing-library/jest-dom/vitest';
import {
  OMSUA_BRANCHES,
  type SpiceLevel,
  getDefaultCatalog,
} from '@omsua/shared';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrandFooter } from './BrandFooter';
import { DrinkMenuSection } from './DrinkMenuSection';
import { HeroSpotlight } from './HeroSpotlight';
import { SnackMenuSection } from './SnackMenuSection';
import { StorefrontHeader } from './StorefrontHeader';
import { ToppingStripSection } from './ToppingStripSection';

afterEach(() => {
  cleanup();
});

describe('Storefront Sections', () => {
  it('renders StorefrontHeader with branch selector pill and terracotta cart summary CTA', () => {
    const onSelectBranch = vi.fn();
    const onOpenCart = vi.fn();

    render(
      <StorefrontHeader
        branches={OMSUA_BRANCHES}
        selectedBranch={OMSUA_BRANCHES[0]!}
        onSelectBranch={onSelectBranch}
        cartItemCount={2}
        cartTotal={90000}
        onOpenCart={onOpenCart}
      />,
    );

    expect(screen.getByRole('link', { name: /Thực đơn/i })).toHaveAttribute(
      'href',
      '#thuc-don',
    );
    expect(
      screen.getByRole('link', { name: /Bánh tráng Snack/i }),
    ).toHaveAttribute('href', '#banh-trang');

    const branchSelect = screen.getByLabelText(/Chọn chi nhánh/i);
    fireEvent.change(branchSelect, { target: { value: 'cs4-duc-trong' } });
    expect(onSelectBranch).toHaveBeenCalledWith('cs4-duc-trong');

    const cartButton = screen.getByRole('button', {
      name: /Giỏ hàng \(2\) • 90k/i,
    });
    fireEvent.click(cartButton);
    expect(onOpenCart).toHaveBeenCalledTimes(1);
  });

  it('renders HeroSpotlight with Đà Lạt artichoke copy, mascot quote, and spotlight cards', () => {
    const catalog = getDefaultCatalog();
    const spotlightProducts = catalog.products.filter((p) => p.isSpotlight);
    const onSelectProduct = vi.fn();

    render(
      <HeroSpotlight
        spotlightProducts={spotlightProducts}
        onSelectProduct={onSelectProduct}
      />,
    );

    expect(
      screen.getByText(/✦ TRÀ SỮA CỦA NGƯỜI ĐÀ LẠT/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Đậm vị Atiso nguyên bản/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/★ BEST SELLER/i)).toBeInTheDocument();
    expect(screen.getByText(/★ MÓN MỚI/i)).toBeInTheDocument();

    const orderButtons = screen.getAllByRole('button', { name: /\+ Đặt ngay/i });
    expect(orderButtons).toHaveLength(2);
    fireEvent.click(orderButtons[0]!);
    expect(onSelectProduct).toHaveBeenCalledWith(spotlightProducts[0]);
  });

  it('filters DrinkMenuSection categories and disables unavailable drinks with Tạm hết', () => {
    const catalog = getDefaultCatalog();
    const drinks = catalog.products
      .filter((p) => p.kind === 'drink')
      .map((drink) =>
        drink.id === 'tra-sua-atiso' ? { ...drink, isAvailable: false } : drink,
      );
    const onChangeCategory = vi.fn();
    const onSelectDrink = vi.fn();

    const { rerender } = render(
      <DrinkMenuSection
        categories={catalog.categories}
        drinks={drinks}
        activeCategory="all"
        onChangeCategory={onChangeCategory}
        onSelectDrink={onSelectDrink}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Tất cả (24)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Trà Sữa (6)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Giữ Dáng (6)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sữa Tươi & Đá Xay (6)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cà Phê Phin (6)' }),
    ).toBeInTheDocument();

    const atisoCard = screen
      .getByText('Trà Sữa Atiso')
      .closest('article') as HTMLElement;
    const soldOutBtn = within(atisoCard).getByRole('button', {
      name: 'Tạm hết',
    });
    expect(soldOutBtn).toBeDisabled();
    fireEvent.click(soldOutBtn);
    expect(onSelectDrink).not.toHaveBeenCalled();

    const bananaCard = screen
      .getByText('Trà Sữa Atiso Chuối')
      .closest('article') as HTMLElement;
    fireEvent.click(within(bananaCard).getByRole('button', { name: '+ Thêm' }));
    expect(onSelectDrink).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tra-sua-atiso-chuoi' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Giữ Dáng (6)' }));
    expect(onChangeCategory).toHaveBeenCalledWith('fruit-tea');

    rerender(
      <DrinkMenuSection
        categories={catalog.categories}
        drinks={drinks}
        activeCategory="fruit-tea"
        onChangeCategory={onChangeCategory}
        onSelectDrink={onSelectDrink}
      />,
    );

    expect(
      screen.getByText('2. GIỮ DÁNG — FRUIT TEA & KOMBUCHA'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('1. TRÀ SỮA ĐÀ LẠT (MILK TEA)'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Trà Quýt Nhài Cát Tường')).toBeInTheDocument();
  });

  it('renders ToppingStripSection with all 8 homemade toppings and sugar/ice guidance', () => {
    const catalog = getDefaultCatalog();
    render(<ToppingStripSection toppings={catalog.toppings} />);

    expect(
      screen.getByText(/TOPPING NHÀ LÀM MỖI NGÀY/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Định lượng Đường \/ Đá tùy chọn miễn phí: 70% \(Chuẩn quán\) \| 50% \| 30% \| 0%/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Trân châu đen')).toBeInTheDocument();
    expect(screen.getByText('Kem trứng')).toBeInTheDocument();
    expect(screen.getByText('+20k')).toBeInTheDocument();
  });

  it('switches spice levels in SnackMenuSection and respects Tạm hết state', () => {
    const catalog = getDefaultCatalog();
    const snacks = catalog.products
      .filter((p) => p.kind === 'snack')
      .map((snack) =>
        snack.id === 'phoi-suong-toi-ot'
          ? { ...snack, isAvailable: false }
          : snack,
      );
    const onChangeSpice = vi.fn();
    const onSelectSnack = vi.fn();

    const { rerender } = render(
      <SnackMenuSection
        snacks={snacks}
        activeSpice="cay-vua"
        onChangeSpice={onChangeSpice}
        onSelectSnack={onSelectSnack}
      />,
    );

    expect(
      screen.getByRole('button', { name: '🌶 Cay nhiều' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cay vừa ✓' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ít cay' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '🌶 Cay nhiều' }));
    expect(onChangeSpice).toHaveBeenCalledWith('cay-nhieu');

    rerender(
      <SnackMenuSection
        snacks={snacks}
        activeSpice={'cay-nhieu' as SpiceLevel}
        onChangeSpice={onChangeSpice}
        onSelectSnack={onSelectSnack}
      />,
    );

    const topMoCard = screen
      .getByText('Bánh Tráng Trộn Tóp Mỡ')
      .closest('article') as HTMLElement;
    fireEvent.click(
      within(topMoCard).getByRole('button', { name: '+ Thêm món ăn vặt' }),
    );
    expect(onSelectSnack).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'banh-trang-tron-top-mo' }),
      'cay-nhieu',
    );

    const soldOutSnackCard = screen
      .getByText('Phơi Sương Tỏi Ớt')
      .closest('article') as HTMLElement;
    expect(
      within(soldOutSnackCard).getByRole('button', { name: 'Tạm hết' }),
    ).toBeDisabled();
  });

  it('renders BrandFooter with story quote, 4 Đà Lạt/Đức Trọng branches, QR card, and copyright', () => {
    render(<BrandFooter branches={OMSUA_BRANCHES} selectedBranchId="cs1-hoang-dieu" />);

    expect(
      screen.getByText(/Mộc mạc - Tinh tế - Nguyên bản/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Cơ sở 1 — Hoàng Diệu')).toBeInTheDocument();
    expect(screen.getByText('Cơ sở 4 — Đức Trọng')).toBeInTheDocument();
    expect(screen.getByText(/THEO DÕI ỐM/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /© 2017 - 2026 Ốm Sữa • Mở cửa 08:00 - 22:00 hàng ngày/i,
      ),
    ).toBeInTheDocument();
  });

  it('never emits pure #FFFFFF/#000000 or bg-white/text-white/bg-black/text-black in rendered sections', () => {
    const catalog = getDefaultCatalog();
    const { container } = render(
      <div>
        <StorefrontHeader
          branches={OMSUA_BRANCHES}
          selectedBranch={OMSUA_BRANCHES[0]!}
          onSelectBranch={vi.fn()}
          cartItemCount={1}
          cartTotal={45000}
          onOpenCart={vi.fn()}
        />
        <HeroSpotlight
          spotlightProducts={catalog.products.filter((p) => p.isSpotlight)}
          onSelectProduct={vi.fn()}
        />
        <DrinkMenuSection
          categories={catalog.categories}
          drinks={catalog.products.filter((p) => p.kind === 'drink')}
          activeCategory="all"
          onChangeCategory={vi.fn()}
          onSelectDrink={vi.fn()}
        />
        <ToppingStripSection toppings={catalog.toppings} />
        <SnackMenuSection
          snacks={catalog.products.filter((p) => p.kind === 'snack')}
          activeSpice="cay-vua"
          onChangeSpice={vi.fn()}
          onSelectSnack={vi.fn()}
        />
        <BrandFooter branches={OMSUA_BRANCHES} />
      </div>,
    );

    const markup = container.innerHTML;
    expect(markup).not.toMatch(
      /(#fff\b|#ffffff\b|#000\b|#000000\b|bg-white|text-white|bg-black|text-black)/i,
    );
  });
});
