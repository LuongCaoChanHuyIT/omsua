// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
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
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();

    rerender(<ProductMedia toppingId="hat-sen" variant="topping" />);
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/images/fanpage/products/topping-hat-sen.webp',
    );
  });
});
