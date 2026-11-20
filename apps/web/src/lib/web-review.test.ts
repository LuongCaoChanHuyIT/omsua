import { execFileSync } from 'node:child_process';
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

function wcagContrastRatio(hexA: string, hexB: string): number {
  const luminance = (hex: string): number => {
    const num = Number.parseInt(hex.replace('#', ''), 16);
    const channels = [(num >> 16) & 255, (num >> 8) & 255, num & 255].map(
      (value) => {
        const srgb = value / 255;
        return srgb <= 0.03928
          ? srgb / 12.92
          : Math.pow((srgb + 0.055) / 1.055, 2.4);
      },
    );
    return (
      0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
    );
  };
  const lum1 = luminance(hexA);
  const lum2 = luminance(hexB);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
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
    expect(globalsCss).toContain('--color-terracotta-deep: #A84B0D');
    expect(globalsCss).toContain('--color-artichoke-deep: #4D5922');
    expect(globalsCss).toContain('--color-ochre-deep: #805B1A');

    expect(wcagContrastRatio('#F7F4EC', '#A84B0D')).toBeGreaterThanOrEqual(4.5);
    expect(wcagContrastRatio('#EEEADF', '#A84B0D')).toBeGreaterThanOrEqual(4.5);
    expect(wcagContrastRatio('#F7F4EC', '#4D5922')).toBeGreaterThanOrEqual(4.5);
    expect(wcagContrastRatio('#F7F4EC', '#805B1A')).toBeGreaterThanOrEqual(4.5);
    expect(wcagContrastRatio('#EEEADF', '#805B1A')).toBeGreaterThanOrEqual(4.5);

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
      {
        label: 'non-semantic <div role="button"> anti-pattern',
        regex: /<div\b[^>]*\brole=(?:\{[^}]*['"]button['"][^}]*\}|['"]button['"])/,
      },
      {
        label: 'low-contrast bg-terracotta/bg-artichoke paired with text-surface-light',
        regex:
          /\bbg-(terracotta|artichoke)(?![-a-z0-9])(?=[^\n`"]*text-surface-light)/,
      },
      {
        label: 'low-contrast text-subhead-ochre, text-terracotta, or text-artichoke on text',
        regex: /\btext-(subhead-ochre|terracotta|artichoke)(?![-a-z0-9])/,
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

  it('configures apps/web/vercel.json for monorepo shared build and keeps fast 1500ms SSR timeout on HomePage', async () => {
    const webRoot = path.resolve(__dirname, '..', '..');
    const vercelJsonPath = path.join(webRoot, 'vercel.json');
    expect(existsSync(vercelJsonPath)).toBe(true);

    const vercelConfig = JSON.parse(readFileSync(vercelJsonPath, 'utf8')) as {
      framework?: string;
      installCommand?: string;
      buildCommand?: string;
    };
    expect(vercelConfig.framework).toBe('nextjs');
    expect(vercelConfig.installCommand).toContain('--frozen-lockfile');
    expect(vercelConfig.buildCommand).toBe(
      'pnpm --dir ../.. build:shared && pnpm build',
    );

    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('Simulated cold Render backend during SSR'),
    );

    await HomePage();

    const scheduledDelays = setTimeoutSpy.mock.calls.map((call) => call[1]);
    expect(scheduledDelays).toContain(1500);
    expect(scheduledDelays).not.toContain(20_000);
  });

  it('compiles scripts/webapp-playwright-verify.py cleanly with python3 -m py_compile and keeps zero pure B/W tokens in Python scripts', () => {
    const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
    const playwrightScriptPath = path.join(
      repoRoot,
      'scripts',
      'webapp-playwright-verify.py',
    );
    const posterScriptPath = path.join(
      repoRoot,
      'scripts',
      'generate-brand-poster.py',
    );

    expect(existsSync(playwrightScriptPath)).toBe(true);
    expect(existsSync(posterScriptPath)).toBe(true);

    execFileSync(
      'python3',
      ['-B', '-m', 'py_compile', playwrightScriptPath, posterScriptPath],
      { stdio: 'pipe' },
    );

    const playwrightSource = readFileSync(playwrightScriptPath, 'utf8');
    expect(playwrightSource).not.toMatch(
      /(#fff\b|#ffffff\b|#000\b|#000000\b|rgb\(\s*(255\s*,\s*255\s*,\s*255|0\s*,\s*0\s*,\s*0))/i,
    );

    const posterScriptSource = readFileSync(posterScriptPath, 'utf8');
    expect(posterScriptSource).not.toMatch(
      /(#fff\b|#ffffff\b|#000\b|#000000\b|rgb\(\s*(255\s*,\s*255\s*,\s*255|0\s*,\s*0\s*,\s*0))/i,
    );

    const posterPdfPath = path.join(
      repoRoot,
      'apps',
      'web',
      'public',
      'brand',
      'omsua-botanical-menu-poster.pdf',
    );
    expect(existsSync(posterPdfPath)).toBe(true);
    const pdfRaw = readFileSync(posterPdfPath, 'latin1');
    expect(pdfRaw.startsWith('%PDF-')).toBe(true);
    const pdfPages = pdfRaw.match(/\/Type\s*\/Page\b/g) ?? [];
    expect(pdfPages.length).toBeGreaterThanOrEqual(2);
  });
});
