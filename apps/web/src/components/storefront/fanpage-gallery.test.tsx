// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { OMSUA_BRANCHES, getDefaultCatalog } from '@omsua/shared';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrandFooter } from './BrandFooter';
import { FanpageGallerySection } from './FanpageGallerySection';
import { StorefrontClientShell } from './StorefrontClientShell';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  cleanup();
});

describe('FanpageGallerySection, PhotoLightboxModal & BrandFooter social/branch photos', () => {
  it('filters gallery photos by category, cycles lightbox with ArrowRight/ArrowLeft wrap-around, and restores focus on Escape', () => {
    render(<FanpageGallerySection />);

    expect(
      screen.getByRole('button', { name: 'Tất cả (12)' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/14K người theo dõi/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Bánh tráng Nhà Ốm \(3\)/i }),
    );
    const triggers = screen.getAllByRole('button', { name: /Xem ảnh lớn:/i });
    expect(triggers).toHaveLength(3);

    triggers[2]!.focus();
    fireEvent.click(triggers[2]!);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('3 / 3')).toBeInTheDocument();

    // Wrap-around from last (index 2) -> first (index 0)
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(within(dialog).getByText('1 / 3')).toBeInTheDocument();

    // Wrap-around from first (index 0) -> last (index 2)
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(within(dialog).getByText('3 / 3')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(triggers[2]);
  });

  it('renders verified Facebook, Instagram, TikTok links and branch storefront photos in BrandFooter', () => {
    const { container } = render(<BrandFooter branches={OMSUA_BRANCHES} />);

    expect(
      screen.getByRole('link', { name: /Facebook Fanpage/i }),
    ).toHaveAttribute('href', 'https://www.facebook.com/trasuadalatomsua');
    expect(screen.getByRole('link', { name: /Instagram/i })).toHaveAttribute(
      'href',
      'https://www.instagram.com/omsuadalat',
    );
    expect(screen.getByRole('link', { name: /TikTok/i })).toHaveAttribute(
      'href',
      'https://tiktok.com/@omsuaphache',
    );

    const branchImages = container.querySelectorAll(
      'img[src^="/images/fanpage/branches/"]',
    );
    expect(branchImages).toHaveLength(4);

    fireEvent.error(branchImages[0]!);
    expect(
      container.querySelectorAll('img[src^="/images/fanpage/branches/"]'),
    ).toHaveLength(3);
  });

  it('retains broken-image placeholders across multiple slides in PhotoLightboxModal and in FanpageGallerySection cards', () => {
    const { container } = render(<FanpageGallerySection />);

    const gridImages = container.querySelectorAll(
      '#khong-gian img[src^="/images/fanpage/"]',
    );
    expect(gridImages).toHaveLength(12);
    fireEvent.error(gridImages[0]!);
    expect(
      container.querySelectorAll('#khong-gian img[src^="/images/fanpage/"]'),
    ).toHaveLength(11);

    const triggers = screen.getAllByRole('button', { name: /Xem ảnh lớn:/i });
    fireEvent.click(triggers[0]!);

    const dialog = screen.getByRole('dialog');
    const slide1Img = dialog.querySelector('img');
    expect(slide1Img).not.toBeNull();
    fireEvent.error(slide1Img!);
    expect(
      within(dialog).getByText(/Ảnh đang được đồng bộ từ Fanpage Ốm Sữa/i),
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    const slide2Img = dialog.querySelector('img');
    expect(slide2Img).not.toBeNull();
    fireEvent.error(slide2Img!);
    expect(
      within(dialog).getByText(/Ảnh đang được đồng bộ từ Fanpage Ốm Sữa/i),
    ).toBeInTheDocument();

    // Navigating back to slide 1 must retain its broken-image fallback state
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(dialog.querySelector('img')).toBeNull();
    expect(
      within(dialog).getByText(/Ảnh đang được đồng bộ từ Fanpage Ốm Sữa/i),
    ).toBeInTheDocument();
  });

  it('enforces min-h-11 (>= 44px) without sm:min-h-* shrinkage on media mode toggles and gallery filter pills', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('offline fallback')),
    );

    render(
      <StorefrontClientShell
        initialCatalog={getDefaultCatalog()}
        initialBranches={[...OMSUA_BRANCHES]}
      />,
    );

    const realModeBtn = screen.getByRole('button', { name: 'Ảnh thực tế' });
    const studioModeBtn = screen.getByRole('button', {
      name: 'Minh họa Studio',
    });
    expect(realModeBtn.className).toContain('min-h-11');
    expect(realModeBtn.className).not.toMatch(/sm:min-h-(9|10)\b/);
    expect(studioModeBtn.className).toContain('min-h-11');
    expect(studioModeBtn.className).not.toMatch(/sm:min-h-(9|10)\b/);

    const galleryFilterButtons = within(
      screen.getByRole('group', { name: 'Lọc album ảnh thực tế' }),
    ).getAllByRole('button');
    for (const pill of galleryFilterButtons) {
      expect(pill.className).toContain('min-h-11');
      expect(pill.className).not.toMatch(/sm:min-h-(9|10)\b/);
    }
  });

  it('propagates Minh họa Studio mode into ProductCustomizerModal and CartCheckoutDrawer', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('offline fallback')),
    );

    render(
      <StorefrontClientShell
        initialCatalog={getDefaultCatalog()}
        initialBranches={[...OMSUA_BRANCHES]}
      />,
    );

    const studioModeBtn = screen.getByRole('button', {
      name: 'Minh họa Studio',
    });
    fireEvent.click(studioModeBtn);
    expect(studioModeBtn).toHaveAttribute('aria-pressed', 'true');

    // Open ProductCustomizerModal for Trà Sữa Atiso from Spotlight
    const orderNowButtons = screen.getAllByRole('button', {
      name: /Đặt ngay/i,
    });
    fireEvent.click(orderNowButtons[0]!);

    const customizerDialog = screen.getByRole('dialog');
    expect(
      customizerDialog.querySelector('img[src^="/images/fanpage/"]'),
    ).toBeNull();
    expect(customizerDialog.querySelectorAll('svg').length).toBeGreaterThan(0);

    fireEvent.click(
      within(customizerDialog).getByRole('button', { name: /Thêm vào giỏ/i }),
    );

    // Open CartCheckoutDrawer
    fireEvent.click(screen.getByRole('button', { name: /^Giỏ hàng \(/i }));
    const cartDialog = screen.getByRole('dialog');
    expect(cartDialog.querySelector('img[src^="/images/fanpage/"]')).toBeNull();
    expect(cartDialog.querySelectorAll('svg').length).toBeGreaterThan(0);
  });
});
