// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { getDefaultCatalog } from '@omsua/shared';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroSpotlight } from '@/components/storefront/HeroSpotlight';
import { ProductMedia } from './ProductMedia';

afterEach(() => cleanup());

describe('ProductMedia hybrid photo + studio SVG fallback', () => {
  it('renders local .webp img with alt="" and aria-hidden when no title/alt is given, and falls back to SVG on error', () => {
    const { container } = render(<ProductMedia productId="tra-sua-atiso" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute(
      'src',
      '/images/fanpage/products/drink-tra-sua-atiso.webp',
    );
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('aria-hidden', 'true');
    expect(img).toHaveAttribute('width', '320');
    expect(img).toHaveAttribute('height', '380');
    expect(img).toHaveAttribute('loading', 'lazy');

    fireEvent.error(img!);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('recovers and renders the new .webp photo when productId changes after a previous image load error', () => {
    const { rerender, container } = render(
      <ProductMedia productId="tra-sua-atiso" />,
    );
    const firstImg = container.querySelector('img');
    expect(firstImg).not.toBeNull();
    fireEvent.error(firstImg!);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();

    rerender(<ProductMedia productId="quyt-nhai-cat-tuong" />);
    const nextImg = container.querySelector('img');
    expect(nextImg).not.toBeNull();
    expect(nextImg).toHaveAttribute(
      'src',
      '/images/fanpage/products/drink-quyt-nhai-cat-tuong.webp',
    );
    expect((nextImg as HTMLImageElement).style.objectPosition).toBe(
      'center 38%',
    );
  });

  it('renders accessible img label when alt is passed, and renders SVG directly when preferIllustration is true or product has no photo', () => {
    const { rerender, container } = render(
      <ProductMedia productId="tra-sua-atiso" alt="Ly Trà Sữa Atiso thực tế" />,
    );
    expect(
      screen.getByRole('img', { name: 'Ly Trà Sữa Atiso thực tế' }),
    ).toBeInTheDocument();

    rerender(<ProductMedia productId="tra-sua-atiso" preferIllustration />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();

    rerender(<ProductMedia productId="tra-sua-flan-chay-canh" />);
    const flanImg = container.querySelector('img');
    expect(flanImg).not.toBeNull();
    expect(flanImg).toHaveAttribute(
      'src',
      '/images/fanpage/products/drink-tra-sua-flan-chay-canh.webp',
    );

    rerender(<ProductMedia productId="unmapped-custom-sku" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();

    rerender(<ProductMedia toppingId="hat-sen" variant="topping" />);
    const toppingImg = container.querySelector('img');
    expect(toppingImg).toHaveAttribute(
      'src',
      '/images/fanpage/products/topping-hat-sen.webp',
    );
    expect(toppingImg).toHaveAttribute('width', '256');
    expect(toppingImg).toHaveAttribute('height', '256');

    rerender(
      <ProductMedia
        productId="tra-sua-atiso"
        variant="spotlight"
        priority={true}
      />,
    );
    const primarySpotlightImg = container.querySelector('img');
    expect(primarySpotlightImg).toHaveAttribute('width', '640');
    expect(primarySpotlightImg).toHaveAttribute('height', '480');
    expect(primarySpotlightImg).toHaveAttribute('loading', 'eager');
    expect(primarySpotlightImg).toHaveAttribute('fetchpriority', 'high');
    expect(primarySpotlightImg).toHaveAttribute('decoding', 'sync');

    rerender(
      <ProductMedia productId="quyt-nhai-cat-tuong" variant="spotlight" />,
    );
    const secondarySpotlightImg = container.querySelector('img');
    expect(secondarySpotlightImg).toHaveAttribute('loading', 'eager');
    expect(secondarySpotlightImg).toHaveAttribute('decoding', 'async');
    expect(secondarySpotlightImg).not.toHaveAttribute('fetchpriority', 'high');

    const spotlightProducts = getDefaultCatalog().products.filter(
      (p) => p.isSpotlight,
    );
    const { container: heroContainer } = render(
      <HeroSpotlight
        spotlightProducts={spotlightProducts}
        onSelectProduct={vi.fn()}
      />,
    );
    const highPriorityImgs = heroContainer.querySelectorAll(
      'img[fetchpriority="high"]',
    );
    expect(highPriorityImgs).toHaveLength(1);
    expect(highPriorityImgs[0]).toHaveAttribute(
      'src',
      '/images/fanpage/products/drink-tra-sua-atiso.webp',
    );
  });
});
