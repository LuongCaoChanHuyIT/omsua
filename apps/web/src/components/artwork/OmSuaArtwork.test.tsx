import '@testing-library/jest-dom/vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { OMSUA_PRODUCTS, OMSUA_TOPPINGS } from '@omsua/shared';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  AtisoMascot,
  OmSuaLogo,
  ProductIllustration,
} from './OmSuaArtwork';

afterEach(() => {
  cleanup();
});

function normalizeGeometry(svgMarkup: string): string {
  return svgMarkup
    .replace(/aria-label="[^"]*"/g, '')
    .replace(/#[0-9a-fA-F]{3,8}\b/g, '#HEX')
    .replace(/id="[^"]*"/g, 'id="ID"')
    .replace(/url\(#[^)]*\)/g, 'url(#ID)');
}

const FORBIDDEN_BW_PATTERN =
  /(#fff\b|#ffffff\b|#000\b|#000000\b|\bwhite\b|\bblack\b)/i;

describe('OmSuaArtwork — Đà Lạt Artisanal Studio Vector Illustrations', () => {
  const drinks = OMSUA_PRODUCTS.filter((item) => item.kind === 'drink');
  const snacks = OMSUA_PRODUCTS.filter((item) => item.kind === 'snack');

  it('renders 24 unique SVG markup & geometry compositions across all 24 Đà Lạt drinks on rich dark-wood studio backdrops', () => {
    expect(drinks).toHaveLength(24);

    const rawMarkups = new Set<string>();
    const normalizedGeometries = new Set<string>();

    for (const drink of drinks) {
      const { container, unmount } = render(
        <ProductIllustration
          productId={drink.id}
          categoryId={drink.categoryId}
          variant="card"
        />,
      );
      const svg = container.querySelector('svg');
      expect(svg, `Missing SVG for drink ${drink.id}`).not.toBeNull();

      const markup = svg!.outerHTML;
      rawMarkups.add(markup);
      normalizedGeometries.add(normalizeGeometry(markup));

      // Every drink studio card sits on a warm dark-wood / espresso studio backdrop (never flat pale #EEEADF backdrop)
      const firstBackdropRect = svg!.querySelector('rect');
      expect(firstBackdropRect).not.toBeNull();
      expect(firstBackdropRect?.getAttribute('fill')?.toUpperCase()).not.toBe(
        '#EEEADF',
      );

      unmount();
    }

    expect(rawMarkups.size).toBe(24);
    expect(normalizedGeometries.size).toBe(24);
  });

  it('renders 6 unique SVG markup & geometry compositions across all 6 Đà Lạt Bánh Tráng snacks', () => {
    expect(snacks).toHaveLength(6);

    const rawMarkups = new Set<string>();
    const normalizedGeometries = new Set<string>();

    for (const snack of snacks) {
      const { container, unmount } = render(
        <ProductIllustration
          productId={snack.id}
          categoryId="snack"
          variant="snack"
        />,
      );
      const svg = container.querySelector('svg');
      expect(svg, `Missing SVG for snack ${snack.id}`).not.toBeNull();

      const markup = svg!.outerHTML;
      rawMarkups.add(markup);
      normalizedGeometries.add(normalizeGeometry(markup));
      unmount();
    }

    expect(rawMarkups.size).toBe(6);
    expect(normalizedGeometries.size).toBe(6);
  });

  it('renders 8 unique SVG markup & geometry compositions across all 8 homemade toppings', () => {
    expect(OMSUA_TOPPINGS).toHaveLength(8);

    const rawMarkups = new Set<string>();
    const normalizedGeometries = new Set<string>();

    for (const topping of OMSUA_TOPPINGS) {
      const { container, unmount } = render(
        <ProductIllustration
          toppingId={topping.id}
          categoryId="topping"
          variant="topping"
        />,
      );
      const svg = container.querySelector('svg');
      expect(svg, `Missing SVG for topping ${topping.id}`).not.toBeNull();

      const markup = svg!.outerHTML;
      rawMarkups.add(markup);
      normalizedGeometries.add(normalizeGeometry(markup));
      unmount();
    }

    expect(rawMarkups.size).toBe(8);
    expect(normalizedGeometries.size).toBe(8);
  });

  it('sets aria-hidden="true" without leaking kebab-case slugs by default, and sets role="img" + aria-label when title is provided', () => {
    const { container: defaultDrink } = render(
      <ProductIllustration
        productId="tra-sua-atiso-chuoi"
        categoryId="milk-tea"
      />,
    );
    const defaultDrinkSvg = defaultDrink.querySelector('svg')!;
    expect(defaultDrinkSvg).toHaveAttribute('aria-hidden', 'true');
    expect(defaultDrinkSvg).not.toHaveAttribute('aria-label');
    expect(defaultDrinkSvg).not.toHaveAttribute('role');
    expect(defaultDrinkSvg.outerHTML).not.toContain('tra-sua-atiso-chuoi');

    const { container: defaultSnack } = render(
      <ProductIllustration
        productId="banh-trang-tron-top-mo"
        categoryId="snack"
        variant="snack"
      />,
    );
    const defaultSnackSvg = defaultSnack.querySelector('svg')!;
    expect(defaultSnackSvg).toHaveAttribute('aria-hidden', 'true');
    expect(defaultSnackSvg).not.toHaveAttribute('aria-label');
    expect(defaultSnackSvg.outerHTML).not.toContain('banh-trang-tron-top-mo');

    const { container: defaultTopping } = render(
      <ProductIllustration
        toppingId="tran-chau-den"
        categoryId="topping"
        variant="topping"
      />,
    );
    const defaultToppingSvg = defaultTopping.querySelector('svg')!;
    expect(defaultToppingSvg).toHaveAttribute('aria-hidden', 'true');
    expect(defaultToppingSvg).not.toHaveAttribute('aria-label');
    expect(defaultToppingSvg.outerHTML).not.toContain('tran-chau-den');

    const { container: titledDrink } = render(
      <ProductIllustration
        productId="tra-sua-atiso"
        categoryId="milk-tea"
        title="Trà Sữa Atiso"
      />,
    );
    const titledDrinkSvg = titledDrink.querySelector('svg')!;
    expect(titledDrinkSvg).toHaveAttribute('role', 'img');
    expect(titledDrinkSvg).toHaveAttribute('aria-label', 'Trà Sữa Atiso');
    expect(titledDrinkSvg).not.toHaveAttribute('aria-hidden');
  });

  it('uses CSS font variables in OmSuaLogo and respects ingredient accuracy on Oreo Trà Đá Xay and Cà Phê Đen', () => {
    const { container: logoContainer } = render(<OmSuaLogo />);
    const logoMarkup = logoContainer.innerHTML;
    expect(logoMarkup).toContain('var(--font-editorial), Georgia, serif');
    expect(logoMarkup).toContain('var(--font-sans), system-ui, sans-serif');

    const { container: oreoTeaContainer } = render(
      <ProductIllustration
        productId="oreo-tra-da-xay"
        categoryId="fresh-milk-blended"
      />,
    );
    // Oreo Trà Đá Xay is a cocoa/roasted black-tea ice blend, never matcha green
    expect(oreoTeaContainer.innerHTML.toUpperCase()).not.toContain('#7A8B3B');
    expect(oreoTeaContainer.innerHTML.toUpperCase()).not.toContain('#95A74E');

    const { container: blackCoffeeContainer } = render(
      <ProductIllustration productId="ca-phe-den" categoryId="coffee" />,
    );
    // Cà Phê Đen features roasted Cầu Đất coffee beans on dark wood, never a green tea leaf
    expect(blackCoffeeContainer.innerHTML.toUpperCase()).not.toContain(
      '#7A8B3B',
    );
  });

  it('contains zero #fff, #ffffff, #000, #000000, white, or black across all 38 items, OmSuaLogo, AtisoMascot, and OmSuaArtwork.tsx source', () => {
    const { container: brandContainer } = render(
      <div>
        <OmSuaLogo />
        <AtisoMascot />
      </div>,
    );
    expect(brandContainer.innerHTML).not.toMatch(FORBIDDEN_BW_PATTERN);

    for (const product of OMSUA_PRODUCTS) {
      const { container, unmount } = render(
        <ProductIllustration
          productId={product.id}
          categoryId={product.categoryId}
          variant={product.kind === 'snack' ? 'snack' : 'card'}
          title={product.name}
        />,
      );
      expect(
        container.innerHTML,
        `Forbidden B/W token in product ${product.id}`,
      ).not.toMatch(FORBIDDEN_BW_PATTERN);
      unmount();
    }

    for (const topping of OMSUA_TOPPINGS) {
      const { container, unmount } = render(
        <ProductIllustration
          toppingId={topping.id}
          categoryId="topping"
          variant="topping"
          title={topping.name}
        />,
      );
      expect(
        container.innerHTML,
        `Forbidden B/W token in topping ${topping.id}`,
      ).not.toMatch(FORBIDDEN_BW_PATTERN);
      unmount();
    }

    const artworkDir = path.resolve(__dirname);
    const artworkSourceFiles = readdirSync(artworkDir).filter(
      (file) =>
        (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.endsWith('.test.tsx') &&
        !file.endsWith('.test.ts'),
    );
    expect(artworkSourceFiles.length).toBeGreaterThanOrEqual(1);

    for (const file of artworkSourceFiles) {
      const sourceContent = readFileSync(path.join(artworkDir, file), 'utf8');
      expect(
        sourceContent,
        `Forbidden B/W token in source file ${file}`,
      ).not.toMatch(FORBIDDEN_BW_PATTERN);
    }
  });
});
