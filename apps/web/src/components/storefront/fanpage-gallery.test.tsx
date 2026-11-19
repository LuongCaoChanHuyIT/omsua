// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { OMSUA_BRANCHES } from '@omsua/shared';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BrandFooter } from './BrandFooter';
import { FanpageGallerySection } from './FanpageGallerySection';

afterEach(() => cleanup());

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
  });
});
