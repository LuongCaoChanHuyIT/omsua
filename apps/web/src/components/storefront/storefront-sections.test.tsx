import '@testing-library/jest-dom/vitest';
import { StrictMode } from 'react';
import {
  OMSUA_BRANCHES,
  type SpiceLevel,
  getDefaultCatalog,
} from '@omsua/shared';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrandFooter } from './BrandFooter';
import { BrandStorySection } from './BrandStorySection';
import { DrinkMenuSection } from './DrinkMenuSection';
import { HeroSpotlight } from './HeroSpotlight';
import { SnackMenuSection } from './SnackMenuSection';
import { StorefrontClientShell } from './StorefrontClientShell';
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
    for (const btn of orderButtons) {
      expect(btn.className).toContain('min-h-11');
      expect(btn.className).not.toContain('sm:min-h-9');
    }
    expect(screen.getByText(/ĐÀ LẠT • 1\.500M/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /hiệu ứng sương sớm/i }),
    ).toBeInTheDocument();
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

    const headerEl = container.querySelector('header') as HTMLElement;
    expect(headerEl.style.viewTransitionName).toBe('omsua-site-header');

    const vtNames = Array.from(container.querySelectorAll('[data-vt-name]'))
      .map((el) => el.getAttribute('data-vt-name'))
      .filter(Boolean);
    expect(new Set(vtNames).size).toBe(vtNames.length);
  });

  it('supports single mobile+desktop nav, branch select id/name, min-h-11 touch targets, and optional Đơn đã đặt pill in StorefrontHeader', () => {
    const onOpenOrderLookup = vi.fn();
    const { rerender } = render(
      <StorefrontHeader
        branches={OMSUA_BRANCHES}
        selectedBranch={OMSUA_BRANCHES[0]!}
        onSelectBranch={vi.fn()}
        cartItemCount={0}
        cartTotal={0}
        onOpenCart={vi.fn()}
        recentOrderCount={0}
        onOpenOrderLookup={onOpenOrderLookup}
      />,
    );

    const navs = screen.getAllByRole('navigation', {
      name: /Điều hướng cửa hàng/i,
    });
    expect(navs).toHaveLength(1);
    expect(navs[0]!.className).not.toContain('hidden');

    const branchSelect = screen.getByLabelText(/Chọn chi nhánh/i);
    expect(branchSelect).toHaveAttribute('id', 'storefront-branch-select');
    expect(branchSelect).toHaveAttribute('name', 'branchId');
    expect(branchSelect.className).toContain('min-h-11');
    expect(branchSelect.className).toContain('text-base');
    expect(branchSelect.className).toContain('sm:text-xs');

    const menuNavLink = screen.getByRole('link', { name: 'Thực đơn' });
    expect(menuNavLink.className).toContain('min-h-11');

    const lookupBtnZero = screen.getByRole('button', { name: 'Đơn đã đặt' });
    expect(lookupBtnZero.className).toContain('min-h-11');
    fireEvent.click(lookupBtnZero);
    expect(onOpenOrderLookup).toHaveBeenCalledTimes(1);

    rerender(
      <StorefrontHeader
        branches={OMSUA_BRANCHES}
        selectedBranch={OMSUA_BRANCHES[0]!}
        onSelectBranch={vi.fn()}
        cartItemCount={1}
        cartTotal={45000}
        onOpenCart={vi.fn()}
        recentOrderCount={3}
        onOpenOrderLookup={onOpenOrderLookup}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Đơn đã đặt (3)' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ốm sữa')).toHaveAttribute('translate', 'no');
    const cartBtn1 = screen.getByRole('button', { name: /Giỏ hàng \(1\)/i });
    expect(cartBtn1).toHaveAttribute('data-cart-pulse', 'true');
  });

  it('renders interactive + Chọn buttons and Tạm hết state in ToppingStripSection when onSelectTopping is provided', () => {
    const catalog = getDefaultCatalog();
    const toppings = catalog.toppings.map((topping) =>
      topping.id === 'kem-trung' ? { ...topping, isAvailable: false } : topping,
    );
    const onSelectTopping = vi.fn();

    render(
      <ToppingStripSection
        toppings={toppings}
        onSelectTopping={onSelectTopping}
      />,
    );

    const chooseBobaBtn = screen.getByRole('button', {
      name: 'Chọn topping Trân châu đen',
    });
    expect(chooseBobaBtn).toHaveTextContent('+ Chọn');
    expect(chooseBobaBtn.className).toContain('min-h-11');
    expect(chooseBobaBtn.className).not.toContain('sm:min-h-9');
    fireEvent.click(chooseBobaBtn);
    expect(onSelectTopping).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tran-chau-den' }),
    );

    const kemTrungCard = screen.getByText('Kem trứng').closest('div')!;
    const soldOutToppingBtn = within(kemTrungCard).getByRole('button', {
      name: 'Tạm hết',
    });
    expect(soldOutToppingBtn).toBeDisabled();
    expect(soldOutToppingBtn.className).toContain('min-h-11');
    expect(soldOutToppingBtn.className).not.toContain('sm:min-h-9');
  });

  it('renders BrandStorySection owning unique #cau-chuyen id, WCAG AA contrast on badges, and aria-pressed on BrandFooter branch cards', () => {
    const catalog = getDefaultCatalog();
    const onSelectBranch = vi.fn();

    const { container } = render(
      <div>
        <DrinkMenuSection
          categories={catalog.categories}
          drinks={catalog.products.filter((p) => p.kind === 'drink')}
          activeCategory="fresh-milk-blended"
          onChangeCategory={vi.fn()}
          onSelectDrink={vi.fn()}
        />
        <SnackMenuSection
          snacks={catalog.products.filter((p) => p.kind === 'snack')}
          activeSpice="cay-vua"
          onChangeSpice={vi.fn()}
          onSelectSnack={vi.fn()}
        />
        <BrandStorySection />
        <BrandFooter
          branches={OMSUA_BRANCHES}
          selectedBranchId="cs1-hoang-dieu"
          onSelectBranch={onSelectBranch}
        />
      </div>,
    );

    const storyAnchors = container.querySelectorAll('#cau-chuyen');
    expect(storyAnchors).toHaveLength(1);
    expect(
      screen.getByText(/✦ CÂU CHUYỆN ỐM SỮA • TỪ 2017/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Hành trình ủ vị Atiso xanh giữa sương sớm Đà Lạt/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Bông Atiso xanh Cầu Đất/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Lá trà ủ chậm & Sữa thanh trùng/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Topping & Sốt tắc nhà làm mỗi sáng/i),
    ).toBeInTheDocument();

    const creamBadge = screen.getByText('CREAM & BLENDED');
    expect(creamBadge.className).toContain('text-espresso');
    expect(creamBadge.className).not.toContain('text-surface-light');

    const categorySubtitle = screen.getByText(
      /Sữa tươi thanh trùng béo dịu/i,
    );
    expect(categorySubtitle.className).toContain('text-espresso/85');
    expect(categorySubtitle.className).not.toContain('text-warm-muted');

    const spiceBadges = screen.getAllByText('Cay vừa');
    const coralBadge = spiceBadges.find((el) =>
      el.className.includes('bg-coral-sketch'),
    );
    expect(coralBadge).toBeDefined();
    expect(coralBadge!.className).toContain('text-espresso');
    expect(coralBadge!.className).not.toContain('text-surface-light');

    const branch1Btn = screen.getByRole('button', {
      name: /Cơ sở 1 — Hoàng Diệu/i,
    });
    const branch4Btn = screen.getByRole('button', {
      name: /Cơ sở 4 — Đức Trọng/i,
    });
    expect(branch1Btn).toHaveAttribute('aria-pressed', 'true');
    expect(branch4Btn).toHaveAttribute('aria-pressed', 'false');

    const printMenuLink = screen.getByRole('link', {
      name: /Tải Menu Ấn Phẩm Đà Lạt \(PDF\)/i,
    });
    expect(printMenuLink).toHaveAttribute(
      'href',
      '/brand/omsua-botanical-menu-poster.pdf',
    );
    expect(printMenuLink).toHaveAttribute('download');

    const footerBranchImgs = container.querySelectorAll(
      'img[src^="/images/fanpage/branches/"]',
    );
    expect(footerBranchImgs.length).toBeGreaterThan(0);
    expect(footerBranchImgs[0]).toHaveAttribute('width', '960');
    expect(footerBranchImgs[0]).toHaveAttribute('height', '540');
  });

  it('filters DrinkMenuSection via diacritic-free search, offers 1-click reset when 0 drinks match, and eliminates sm:min-h-9/10 regressions', () => {
    const catalog = getDefaultCatalog();
    const drinks = catalog.products.filter((p) => p.kind === 'drink');
    const snacks = catalog.products.filter((p) => p.kind === 'snack');
    const onChangeCategory = vi.fn();
    const onChangeSearchQuery = vi.fn();

    const { rerender, container } = render(
      <div>
        <DrinkMenuSection
          categories={catalog.categories}
          drinks={drinks}
          activeCategory="all"
          searchQuery="khuc bach"
          onChangeCategory={onChangeCategory}
          onChangeSearchQuery={onChangeSearchQuery}
          onSelectDrink={vi.fn()}
        />
        <SnackMenuSection
          snacks={snacks}
          activeSpice="cay-vua"
          onChangeSpice={vi.fn()}
          onSelectSnack={vi.fn()}
        />
      </div>,
    );

    const searchbox = screen.getByRole('searchbox', {
      name: /Tìm nhanh thức uống/i,
    });
    expect(searchbox).toHaveValue('khuc bach');
    const discoveryBar = searchbox.parentElement?.parentElement as HTMLElement;
    expect(discoveryBar.className).toContain('lg:sticky');
    expect(discoveryBar.className).not.toMatch(/(?:^|\s)sticky(?:\s|$)/);
    expect(screen.getByText('Trà Sữa Gạo Rang Khúc Bạch')).toBeInTheDocument();
    expect(screen.queryByText('Cà Phê Muối')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/1 món/i);

    for (const btn of container.querySelectorAll('button')) {
      expect(btn.className).not.toMatch(/\bsm:min-h-(9|10)\b/);
    }

    rerender(
      <DrinkMenuSection
        categories={catalog.categories}
        drinks={drinks}
        activeCategory="coffee"
        searchQuery="atiso"
        onChangeCategory={onChangeCategory}
        onChangeSearchQuery={onChangeSearchQuery}
        onSelectDrink={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(/0 món/i);
    const resetBtn = screen.getByRole('button', {
      name: 'Xóa bộ lọc tìm kiếm',
    });
    fireEvent.click(resetBtn);
    expect(onChangeSearchQuery).toHaveBeenCalledWith('');
    expect(onChangeCategory).toHaveBeenCalledWith('all');
  });

  it('clamps malformed URL query params safely and syncs valid ?cat=&q=&media=studio params in StorefrontClientShell', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('offline fallback')),
    );
    const originalUrl = window.location.href;

    try {
      window.history.replaceState(
        null,
        '',
        '/?cat=invalid-cat&q=%20%20&media=foo',
      );
      const { unmount } = render(
        <StorefrontClientShell
          initialCatalog={getDefaultCatalog()}
          initialBranches={[...OMSUA_BRANCHES]}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'Tất cả (24)' }),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(
        screen.getByRole('button', { name: 'Ảnh thực tế' }),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(
        screen.getByRole('searchbox', { name: /Tìm nhanh thức uống/i }),
      ).toHaveValue('');
      unmount();

      window.history.replaceState(
        null,
        '',
        '/?cat=coffee&q=muoi&media=studio',
      );
      render(
        <StrictMode>
          <StorefrontClientShell
            initialCatalog={getDefaultCatalog()}
            initialBranches={[...OMSUA_BRANCHES]}
          />
        </StrictMode>,
      );

      expect(
        await screen.findByRole('button', {
          name: 'Cà Phê Phin (6)',
          pressed: true,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Minh họa Studio' }),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(
        screen.getByRole('searchbox', { name: /Tìm nhanh thức uống/i }),
      ).toHaveValue('muoi');
      expect(window.location.search).toBe('?cat=coffee&q=muoi&media=studio');
    } finally {
      window.history.replaceState(null, '', originalUrl);
      vi.unstubAllGlobals();
    }
  });
});
