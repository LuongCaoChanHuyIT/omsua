import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from 'next/constants';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import eslintConfig from '../../eslint.config.mjs';
import nextConfig from '../../next.config';
import NotFound from '../app/not-found';
import HomePage, { dynamic as homePageDynamic } from '../app/page';

function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSourceFiles(fullPath));
    } else if (
      /\.(ts|tsx|css|svg)$/.test(entry.name) &&
      !/\.test\.(ts|tsx)$/.test(entry.name)
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('web config & HomePage Storefront SSR consistency', () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const originalServerApiUrl = process.env.API_URL;

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }
    if (originalServerApiUrl === undefined) {
      delete process.env.API_URL;
    } else {
      process.env.API_URL = originalServerApiUrl;
    }
  });

  it('enforces react-hooks rules-of-hooks and exhaustive-deps in web ESLint flat config', () => {
    const mergedRules = Object.assign(
      {},
      ...eslintConfig.map(
        (entry: { rules?: Record<string, unknown> }) => entry.rules ?? {},
      ),
    );
    expect(mergedRules['react-hooks/rules-of-hooks']).toBeDefined();
    expect(mergedRules['react-hooks/exhaustive-deps']).toBeDefined();
  });

  it('normalizes NEXT_PUBLIC_API_URL for HomePage SSR fetches (falling through blank API_URL) and renders warm Ốm Sữa Storefront fallback markup', async () => {
    process.env.API_URL = '   ';
    process.env.NEXT_PUBLIC_API_URL = 'https://api.staging.omsua.vn/api///';
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('Backend offline during build'));

    const element = await HomePage();
    const html = renderToStaticMarkup(element);

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.staging.omsua.vn/api/catalog',
      expect.objectContaining({ cache: 'no-store' }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.staging.omsua.vn/api/branches',
      expect.objectContaining({ cache: 'no-store' }),
    );
    expect(html).toContain('data-api-base-url="https://api.staging.omsua.vn/api"');
    expect(html).toContain('Trà Sữa Atiso');
    expect(html).toContain('THỰC ĐƠN NGUYÊN BẢN ỐM SỮA');
    expect(html).toContain('BÁNH TRÁNG SNACK ĐÀ LẠT');
    expect(html).not.toMatch(
      /(#fff\b|#ffffff\b|#000\b|#000000\b|bg-white|text-white|bg-black|text-black)/i,
    );
  });

  it('provides warm brand icon.svg using Ốm Sữa palette and passes recursive static pure B/W source scan across apps/web/src', () => {
    const srcRoot = path.resolve(__dirname, '..');
    const iconSvgPath = path.join(srcRoot, 'app', 'icon.svg');

    expect(existsSync(iconSvgPath)).toBe(true);
    const iconSvg = readFileSync(iconSvgPath, 'utf8');
    expect(iconSvg).toContain('<svg');
    expect(iconSvg).toMatch(/#EEEADF/i);
    expect(iconSvg).toMatch(/#594C00/i);
    expect(iconSvg).toMatch(/#7A8B3B/i);
    expect(iconSvg).toMatch(/#D96B1E/i);

    const globalsCss = readFileSync(
      path.join(srcRoot, 'app', 'globals.css'),
      'utf8',
    );
    expect(globalsCss).toContain(':focus-visible');
    expect(globalsCss).toContain('.bg-hero-espresso :focus-visible');
    expect(globalsCss).toContain('var(--color-card-butter)');
    expect(globalsCss).toContain('prefers-reduced-motion: reduce');
    expect(globalsCss).toContain('--shadow-paper-rest');
    expect(globalsCss).toContain('--shadow-paper-lift');
    expect(globalsCss).toContain('bg-paper-grain');

    const layoutSource = readFileSync(
      path.join(srcRoot, 'app', 'layout.tsx'),
      'utf8',
    );
    expect(layoutSource).toContain('export const viewport: Viewport');
    expect(layoutSource).toMatch(/themeColor:\s*['"]#EEEADF['"]/);
    expect(layoutSource.match(/preload:\s*false/g)?.length ?? 0).toBe(3);

    const forbiddenPatterns: Array<{ label: string; regex: RegExp }> = [
      { label: 'hex #fff/#ffffff/#000/#000000', regex: /(#fff\b|#ffffff\b|#000\b|#000000\b)/i },
      { label: 'rgb(255,255,255) or rgb(0,0,0)', regex: /rgb\(\s*(255\s*,\s*255\s*,\s*255|0\s*,\s*0\s*,\s*0)/i },
      {
        label: 'Tailwind pure white/black utility',
        regex: /\b(bg|text|border|ring|fill|stroke|outline)-(white|black)\b/,
      },
      {
        label: '<44px sm:min-h-9/10 touch-target regression',
        regex: /\bsm:min-h-(9|10)\b/,
      },
      {
        label: 'sub-12px micro-badge text-[9px]/text-[10px]/text-[11px]',
        regex: /\btext-\[(9|10|11)px\]/,
      },
      {
        label: 'non-compositor transition-all',
        regex: /\btransition-all\b/,
      },
      {
        label: 'straight three-dot loading string',
        regex: /Đang (xử lý đơn hàng|tra cứu)\.\.\./,
      },
      {
        label: 'legacy React forwardRef (use React 19 ref prop)',
        regex: /\bforwardRef\s*[<(]/,
      },
      {
        label: 'legacy React useContext (use React 19 use())',
        regex: /\buseContext\s*\(/,
      },
    ];

    const files = collectSourceFiles(srcRoot);
    expect(files.length).toBeGreaterThanOrEqual(20);

    for (const filePath of files) {
      const content = readFileSync(filePath, 'utf8');
      const relativeFile = path.relative(srcRoot, filePath);
      for (const { label, regex } of forbiddenPatterns) {
        expect(
          content,
          `Forbidden ${label} found in ${relativeFile}`,
        ).not.toMatch(regex);
      }
    }
  });

  it('renders branded warm Vietnamese NotFound page with link to / and zero pure white/black tokens', () => {
    const html = renderToStaticMarkup(createElement(NotFound));

    expect(html).toContain('Không tìm thấy trang này');
    expect(html).toContain(
      'Trang bạn tìm kiếm không tồn tại hoặc đã chuyển về quầy thực đơn chính của Ốm Sữa.',
    );
    expect(html).toContain('Quay về Thực đơn Ốm Sữa');
    expect(html).toContain('href="/"');
    expect(html).toContain('min-h-11');
    expect(html).not.toMatch(
      /(#fff\b|#ffffff\b|#000\b|#000000\b|bg-white|text-white|bg-black|text-black)/i,
    );
  });

  it('isolates next dev into .next-dev while keeping production builds in .next and forces dynamic runtime rendering on HomePage', () => {
    expect(typeof nextConfig).toBe('function');
    const configFn = nextConfig as unknown as (phase: string) => {
      distDir?: string;
      devIndicators?: false | object;
      transpilePackages?: string[];
    };
    expect(configFn(PHASE_DEVELOPMENT_SERVER).distDir).toBe('.next-dev');
    expect(configFn(PHASE_DEVELOPMENT_SERVER).devIndicators).toBe(false);
    expect(configFn(PHASE_PRODUCTION_BUILD).distDir).toBe('.next');
    expect(configFn(PHASE_PRODUCTION_BUILD).transpilePackages).toContain(
      '@omsua/shared',
    );
    expect(homePageDynamic).toBe('force-dynamic');

    const catchAllPath = path.resolve(
      __dirname,
      '..',
      'app',
      '[...notFound]',
      'page.tsx',
    );
    expect(existsSync(catchAllPath)).toBe(true);
    expect(readFileSync(catchAllPath, 'utf8')).toContain('notFound()');

    const pageSource = readFileSync(
      path.resolve(__dirname, '..', 'app', 'page.tsx'),
      'utf8',
    );
    expect(pageSource).not.toMatch(/process\.env(?:\.NEXT_PUBLIC_API_URL|\[\s*['"`]NEXT_PUBLIC_API_URL['"`]\s*\])/);
  });
});
