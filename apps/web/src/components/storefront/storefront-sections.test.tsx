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

    expect(
      screen.getByRole('button', { name: 'SẢN PHẨM' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('link', { name: 'CỬA HÀNG' })).toHaveAttribute(
      'href',
      '#chi-nhanh',
    );
    expect(screen.getByRole('link', { name: 'TUYỂN DỤNG' })).toHaveAttribute(
      'href',
      '#tuyen-dung',
    );
    expect(screen.getByRole('link', { name: 'THÀNH VIÊN' })).toHaveAttribute(
      'href',
      '#thanh-vien',
    );
    expect(screen.getByRole('link', { name: 'NHƯỢNG QUYỀN' })).toHaveAttribute(
      'href',
      '#nhuong-quyen',
    );

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
    const firstBranchOption = branchSelect.querySelector('option');
    expect(firstBranchOption?.className).toContain('bg-surface-light');
    expect(firstBranchOption?.className).toContain('text-espresso');

    const storesNavLink = screen.getByRole('link', { name: 'CỬA HÀNG' });
    expect(storesNavLink.className).toContain('min-h-11');

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
    expect(branch1Btn.tagName).toBe('BUTTON');
    expect(branch4Btn.tagName).toBe('BUTTON');
    expect(branch1Btn).toHaveAttribute('aria-pressed', 'true');
    expect(branch4Btn).toHaveAttribute('aria-pressed', 'false');

    const footerEl = container.querySelector('footer')!;
    const footerHeadings = footerEl.querySelectorAll('h3');
    expect(footerHeadings).toHaveLength(4);
    for (const h3 of footerHeadings) {
      expect(h3.closest('button')).toBeNull();
    }
    fireEvent.click(branch4Btn);
    expect(onSelectBranch).toHaveBeenCalledWith('cs4-duc-trong');

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

  it('filters drinks by FlavorMoodId, syncs ?mood= while clamping unknown moods, focuses search on /, ignores / inside inputs or modals, and applies distinct editorial surfaces', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('offline fallback')),
    );
    const originalUrl = window.location.href;

    try {
      window.history.replaceState(null, '', '/?mood=unknown-mood');
      const { unmount, container } = render(
        <StorefrontClientShell
          initialCatalog={getDefaultCatalog()}
          initialBranches={[...OMSUA_BRANCHES]}
        />,
      );

      const allMoodBtn = await screen.findByRole('button', {
        name: 'Tất cả vị',
        pressed: true,
      });
      expect(allMoodBtn).toBeInTheDocument();

      // ToppingStripSection uses warm parchment band, BrandStorySection uses open broadsheet border-y
      const toppingHeading = screen.getByRole('heading', {
        name: /TOPPING NHÀ LÀM MỖI NGÀY/i,
      });
      const toppingSection = toppingHeading.closest('section')!;
      expect(toppingSection.className).toContain('bg-card-butter/45');

      const storySection = container.querySelector('#cau-chuyen')!;
      expect(storySection.className).toContain('border-y');
      expect(storySection.className).not.toContain('bg-surface-light');

      // Select "Đậm trà béo mịn" mood -> syncs ?mood=dam-vi and filters drinks
      fireEvent.click(
        screen.getByRole('button', { name: /Đậm trà béo mịn/i }),
      );
      expect(window.location.search).toBe('?mood=dam-vi');
      expect(
        screen.getByText('Trà Sữa Flan Cháy Cạnh'),
      ).toBeInTheDocument();
      expect(screen.queryByText('Cà Phê Đen')).not.toBeInTheDocument();

      // Non-overlapping Category + Mood with empty search query renders filter-specific empty message (never empty quotes “”)
      fireEvent.click(
        screen.getByRole('button', { name: /Giữ Dáng \(6\)/i }),
      );
      expect(screen.queryByText(/khớp từ khóa “”/)).not.toBeInTheDocument();
      expect(
        screen.getByText(
          /Chưa có thức uống phù hợp với bộ lọc nhóm và khẩu vị đang chọn/i,
        ),
      ).toBeInTheDocument();
      fireEvent.click(
        screen.getByRole('button', { name: 'Xóa bộ lọc tìm kiếm' }),
      );

      // BrandFooter branch buttons conform to WCAG 2.5.3 Label in Name (accessible name contains visible text)
      const cs1FooterBtn = screen.getByRole('button', {
        name: /Cơ sở 1 — Hoàng Diệu/i,
      });
      expect(cs1FooterBtn.getAttribute('aria-label')).toBeNull();
      expect(cs1FooterBtn).toHaveTextContent(/Đang giao cơ sở này/);

      // "/" shortcut focuses searchbox when outside inputs and no modal is open
      const searchbox = screen.getByRole('searchbox', {
        name: /Tìm nhanh thức uống/i,
      });
      (document.activeElement as HTMLElement | null)?.blur?.();
      fireEvent.keyDown(window, { key: '/' });
      expect(document.activeElement).toBe(searchbox);

      // "/" while focused in an input does not preventDefault
      const branchSelect = screen.getByLabelText(/Chọn chi nhánh/i);
      branchSelect.focus();
      const slashInSelect = new KeyboardEvent('keydown', {
        key: '/',
        bubbles: true,
        cancelable: true,
      });
      branchSelect.dispatchEvent(slashInSelect);
      expect(slashInSelect.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(branchSelect);

      // "/" while a modal is open is ignored
      fireEvent.click(screen.getByRole('button', { name: 'Đơn đã đặt' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      const slashInModal = new KeyboardEvent('keydown', {
        key: '/',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(slashInModal);
      expect(slashInModal.defaultPrevented).toBe(false);
      expect(document.activeElement).not.toBe(searchbox);

      unmount();
    } finally {
      window.history.replaceState(null, '', originalUrl);
      vi.unstubAllGlobals();
    }
  });

  it('renders 2-tier bg-hero-espresso Flagship StorefrontHeader with 7 nav items, mutually exclusive disclosure dropdowns, Escape focus return, outside-click close, and mobile Menu panel', () => {
    const onSelectDrinkCategory = vi.fn();
    const onSelectNewsCategory = vi.fn();

    const { container } = render(
      <div>
        <StorefrontHeader
          branches={OMSUA_BRANCHES}
          selectedBranch={OMSUA_BRANCHES[0]!}
          onSelectBranch={vi.fn()}
          cartItemCount={1}
          cartTotal={45000}
          onOpenCart={vi.fn()}
          onSelectDrinkCategory={onSelectDrinkCategory}
          onSelectNewsCategory={onSelectNewsCategory}
        />
        <ToppingStripSection toppings={getDefaultCatalog().toppings} />
      </div>,
    );

    const header = container.querySelector('header')!;
    expect(header.className).toContain('bg-hero-espresso');
    expect(container.querySelector('#topping')).not.toBeNull();

    const gioiThieuBtn = screen.getByRole('button', { name: 'GIỚI THIỆU' });
    const sanPhamBtn = screen.getByRole('button', { name: 'SẢN PHẨM' });
    const tinTucBtn = screen.getByRole('button', { name: 'TIN TỨC' });

    for (const btn of [gioiThieuBtn, sanPhamBtn, tinTucBtn]) {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
      expect(btn.getAttribute('aria-label')).toBeNull();
      expect(btn.className).toContain('min-h-11');
    }

    // Open SẢN PHẨM dropdown -> reveals drink categories, #topping, and #banh-trang
    fireEvent.click(sanPhamBtn);
    expect(sanPhamBtn).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('link', { name: /Tất cả Thực đơn Đồ uống/i }),
    ).toHaveAttribute('href', '#thuc-don');
    expect(
      screen.getByRole('link', { name: /Topping Nhà Làm Mỗi Sáng/i }),
    ).toHaveAttribute('href', '#topping');
    const snackSubLink = screen.getByRole('link', {
      name: /Bánh Tráng Snack Đà Lạt/i,
    });
    expect(snackSubLink).toHaveAttribute('href', '#banh-trang');
    expect(snackSubLink.className).toContain('min-h-11');

    // Clicking a drink category invokes onSelectDrinkCategory and closes the dropdown
    fireEvent.click(
      screen.getByRole('link', { name: /2\. Giữ Dáng — Fruit Tea & Kombucha/i }),
    );
    expect(onSelectDrinkCategory).toHaveBeenCalledWith('fruit-tea');
    expect(sanPhamBtn).toHaveAttribute('aria-expanded', 'false');

    // Mutual exclusion: opening SẢN PHẨM then GIỚI THIỆU closes SẢN PHẨM
    fireEvent.click(sanPhamBtn);
    expect(sanPhamBtn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(gioiThieuBtn);
    expect(sanPhamBtn).toHaveAttribute('aria-expanded', 'false');
    expect(gioiThieuBtn).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('link', { name: /Ấn phẩm Menu Đà Lạt \(PDF\)/i }),
    ).toHaveAttribute('href', '/brand/omsua-botanical-menu-poster.pdf');

    // Pressing Escape closes GIỚI THIỆU and restores focus to gioiThieuBtn
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(gioiThieuBtn).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(gioiThieuBtn);

    // Outside pointerDown closes TIN TỨC
    fireEvent.click(tinTucBtn);
    expect(tinTucBtn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.pointerDown(document.body);
    expect(tinTucBtn).toHaveAttribute('aria-expanded', 'false');

    // Tabbing / blurring outside the open dropdown <li> closes it (Review Focus #1)
    fireEvent.click(sanPhamBtn);
    expect(sanPhamBtn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.blur(sanPhamBtn, { relatedTarget: document.body });
    expect(sanPhamBtn).toHaveAttribute('aria-expanded', 'false');

    // Clicking Giỏ hàng CTA closes any open header dropdown
    fireEvent.click(sanPhamBtn);
    expect(sanPhamBtn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Giỏ hàng/i }));
    expect(sanPhamBtn).toHaveAttribute('aria-expanded', 'false');

    // Mobile Menu toggle mounts #mobile-flagship-nav with viewport scroll cap, starts collapsed, and restores focus on Escape
    expect(container.querySelector('#mobile-flagship-nav')).toBeNull();
    const mobileMenuBtn = screen.getByRole('button', { name: 'Menu' });
    expect(mobileMenuBtn.getAttribute('aria-label')).toBeNull();
    expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(mobileMenuBtn);
    expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'true');
    const mobileNav = container.querySelector('#mobile-flagship-nav')!;
    expect(mobileNav).not.toBeNull();
    expect(mobileNav.className).toContain('max-h-[calc(100dvh-7.5rem)]');
    expect(mobileNav.className).toContain('overflow-y-auto');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(mobileMenuBtn);
  });

  it('wires StorefrontClientShell flagship header category/news jumps, resets conflicting mood/search filters, mounts all 4 brand hubs, and protects hub inputs from / shortcut', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('offline fallback')),
    );
    try {
      const { container } = render(
        <StorefrontClientShell
          initialCatalog={getDefaultCatalog()}
          initialBranches={[...OMSUA_BRANCHES]}
        />,
      );

      for (const anchorId of [
        '#topping',
        '#tin-tuc',
        '#thanh-vien',
        '#tuyen-dung',
        '#nhuong-quyen',
        '#chi-nhanh',
      ]) {
        expect(container.querySelector(anchorId)).not.toBeNull();
      }

      // DrinkMenuSection sticky filter bar clears the ~118px 2-tier header (lg:top-[122px], never lg:top-[69px])
      const searchbox = screen.getByRole('searchbox', {
        name: /Tìm nhanh thức uống/i,
      });
      const stickyBar = searchbox.closest('.lg\\:sticky') as HTMLElement;
      expect(stickyBar).not.toBeNull();
      expect(stickyBar.className).toContain('lg:top-[122px]');
      expect(stickyBar.className).not.toContain('lg:top-[69px]');

      // Activate a conflicting mood ("dam-vi") and search query ("flan")
      const drinkMenuEl = container.querySelector('#thuc-don') as HTMLElement;
      fireEvent.click(screen.getByRole('button', { name: /Đậm trà béo mịn/i }));
      fireEvent.change(searchbox, { target: { value: 'flan' } });
      expect(
        within(drinkMenuEl).queryByText('Trà Dâu Tằm Đà Lạt'),
      ).not.toBeInTheDocument();

      // Open SẢN PHẨM in header and select "2. Giữ Dáng — Fruit Tea & Kombucha" -> resets mood & search and renders Fruit Tea
      fireEvent.click(screen.getByRole('button', { name: 'SẢN PHẨM' }));
      fireEvent.click(
        screen.getByRole('link', {
          name: /2\. Giữ Dáng — Fruit Tea & Kombucha/i,
        }),
      );
      expect(searchbox).toHaveValue('');
      expect(
        await screen.findByRole('button', { name: 'Tất cả vị', pressed: true }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Giữ Dáng \(6\)/i }),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(
        within(drinkMenuEl).getByText('Trà Dâu Tằm Đà Lạt'),
      ).toBeInTheDocument();

      // Open TIN TỨC in header and select "Ưu đãi & Sự kiện tại quán" -> syncs NewsSeasonSection filter
      fireEvent.click(screen.getByRole('button', { name: 'TIN TỨC' }));
      fireEvent.click(
        screen.getByRole('link', { name: /Ưu đãi & Sự kiện tại quán/i }),
      );
      const newsSection = container.querySelector('#tin-tuc') as HTMLElement;
      expect(
        within(newsSection).getByRole('button', {
          name: 'Ưu đãi & Sự kiện',
          pressed: true,
        }),
      ).toBeInTheDocument();

      // Pressing "/" inside #thanh-vien phone input must NOT hijack focus to drink searchbox
      const memberPhoneInput = screen.getByLabelText(/Số điện thoại tích điểm/i);
      memberPhoneInput.focus();
      const slashInMemberInput = new KeyboardEvent('keydown', {
        key: '/',
        bubbles: true,
        cancelable: true,
      });
      memberPhoneInput.dispatchEvent(slashInMemberInput);
      expect(slashInMemberInput.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(memberPhoneInput);

      // Opening NewsSeasonSection modal suppresses header viewTransitionName (Review Focus #5)
      const headerEl = container.querySelector('header') as HTMLElement;
      expect(headerEl.style.viewTransitionName).toBe('omsua-site-header');
      const readButtons = within(newsSection).getAllByRole('button', {
        name: /Đọc chi tiết/i,
      });
      fireEvent.click(readButtons[0]!);
      expect(headerEl.style.viewTransitionName).toBe('');
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(headerEl.style.viewTransitionName).toBe('omsua-site-header');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
