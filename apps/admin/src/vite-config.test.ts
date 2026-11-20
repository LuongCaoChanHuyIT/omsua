// @vitest-environment node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import viteConfig, { resolveAdminPort } from '../vite.config';

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_ROOT = path.resolve(CURRENT_DIR, '..');

const FORBIDDEN_BW_PATTERNS: ReadonlyArray<{ label: string; regex: RegExp }> = [
  { label: '#fff', regex: /#fff\b/i },
  { label: '#ffffff', regex: /#ffffff\b/i },
  { label: '#000', regex: /#000\b/i },
  { label: '#000000', regex: /#000000\b/i },
  {
    label: 'rgb(255,255,255)',
    regex: /rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/i,
  },
  {
    label: 'rgb(0,0,0)',
    regex: /rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/i,
  },
  {
    label: 'Tailwind *-white / *-black utility',
    regex: /\b(bg|text|border|ring|fill|stroke|outline)-(white|black)\b/i,
  },
];

const BINARY_ASSET_EXTENSION_REGEX = /\.(webp|png|jpe?g|gif|ico|avif|woff2?)$/i;

function collectScannableFiles(targetPath: string): string[] {
  if (!fs.existsSync(targetPath)) {
    return [];
  }
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (
      /\.test\.(ts|tsx)$/.test(targetPath) ||
      BINARY_ASSET_EXTENSION_REGEX.test(targetPath)
    ) {
      return [];
    }
    return [targetPath];
  }
  if (!stat.isDirectory()) {
    return [];
  }

  const results: string[] = [];
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    const childPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectScannableFiles(childPath));
    } else if (
      entry.isFile() &&
      !/\.test\.(ts|tsx)$/.test(entry.name) &&
      !BINARY_ASSET_EXTENSION_REGEX.test(entry.name)
    ) {
      results.push(childPath);
    }
  }
  return results;
}

describe('Vite server configuration (admin)', () => {
  it('pins Vite dev and preview servers strictly to port 3001 by default', () => {
    expect(viteConfig.server?.port).toBe(3001);
    expect(viteConfig.server?.strictPort).toBe(true);
    expect(viteConfig.preview?.port).toBe(3001);
    expect(viteConfig.preview?.strictPort).toBe(true);
  });

  it('resolveAdminPort reads ADMIN_PORT ?? PORT and falls back to 3001 on invalid values', () => {
    expect(resolveAdminPort({})).toBe(3001);
    expect(resolveAdminPort({ ADMIN_PORT: '3101' })).toBe(3101);
    expect(resolveAdminPort({ PORT: '3102' })).toBe(3102);
    expect(resolveAdminPort({ ADMIN_PORT: '3101', PORT: '3102' })).toBe(3101);
    expect(resolveAdminPort({ ADMIN_PORT: 'abc' })).toBe(3001);
    expect(resolveAdminPort({ ADMIN_PORT: '0' })).toBe(3001);
    expect(resolveAdminPort({ ADMIN_PORT: '70000' })).toBe(3001);
  });

  it('configures apps/admin/vercel.json with shared prebuild, dist output, and SPA deep-link rewrite excluding static assets', () => {
    const vercelJsonPath = path.join(ADMIN_ROOT, 'vercel.json');
    expect(fs.existsSync(vercelJsonPath)).toBe(true);

    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8')) as {
      framework?: string;
      installCommand?: string;
      buildCommand?: string;
      outputDirectory?: string;
      rewrites?: Array<{ source: string; destination: string }>;
    };

    expect(vercelConfig.framework).toBe('vite');
    expect(vercelConfig.installCommand).toContain('--frozen-lockfile');
    expect(vercelConfig.buildCommand).toBe(
      'pnpm --dir ../.. build:shared && pnpm build',
    );
    expect(vercelConfig.outputDirectory).toBe('dist');
    expect(vercelConfig.rewrites?.length).toBe(1);

    const rewrite = vercelConfig.rewrites![0]!;
    expect(rewrite.destination).toBe('/index.html');

    const routePattern = new RegExp(`^${rewrite.source}$`);
    expect(routePattern.test('/')).toBe(true);
    expect(routePattern.test('/menu')).toBe(true);
    expect(routePattern.test('/branches')).toBe(true);
    expect(routePattern.test('/settings')).toBe(true);

    expect(routePattern.test('/assets/index-abc.js')).toBe(false);
    expect(
      routePattern.test(
        '/images/fanpage/branches/branch-cs1-hoang-dieu.webp',
      ),
    ).toBe(false);
    expect(routePattern.test('/favicon.svg')).toBe(false);
    expect(routePattern.test('/robots.txt')).toBe(false);
  });
});

describe('Admin brand favicon, typography, a11y CSS, and zero pure B/W rule', () => {
  it('ships warm brand /favicon.svg and links it + Dancing Script 700 in index.html', () => {
    const faviconPath = path.join(ADMIN_ROOT, 'public', 'favicon.svg');
    expect(fs.existsSync(faviconPath)).toBe(true);

    const faviconSvg = fs.readFileSync(faviconPath, 'utf8');
    expect(faviconSvg).toContain('viewBox="0 0 64 64"');
    expect(faviconSvg).toMatch(/#29261D/i);
    expect(faviconSvg).toMatch(/#F4E3AD/i);
    expect(faviconSvg).toMatch(/#7A8B3B/i);
    expect(faviconSvg).toMatch(/#D96B1E/i);

    const indexHtml = fs.readFileSync(
      path.join(ADMIN_ROOT, 'index.html'),
      'utf8',
    );
    expect(indexHtml).toContain(
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    );
    expect(indexHtml).toContain('Dancing+Script:wght@700');
    expect(indexHtml).toContain('Be+Vietnam+Pro:wght@400;500;600;700;800');
    expect(indexHtml).toContain('Lora:ital,wght@0,400;0,500;0,600;1,400');
    expect(indexHtml).toContain('<meta name="description"');

    const robotsPath = path.join(ADMIN_ROOT, 'public', 'robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);
    expect(fs.readFileSync(robotsPath, 'utf8')).toContain('User-agent: *');
  });

  it('defines --font-quote, :focus-visible outline, dark surface focus contrast, and prefers-reduced-motion in src/index.css', () => {
    const indexCss = fs.readFileSync(
      path.join(ADMIN_ROOT, 'src', 'index.css'),
      'utf8',
    );
    expect(indexCss).toContain('--font-quote: "Dancing Script", cursive;');
    expect(indexCss).toContain(':focus-visible');
    expect(indexCss).toContain('2px solid var(--color-olive-primary)');
    expect(indexCss).toContain('.bg-hero-espresso :focus-visible');
    expect(indexCss).toContain('var(--color-card-butter)');
    expect(indexCss).toContain('prefers-reduced-motion: reduce');
    expect(indexCss).toContain('--color-terracotta-deep: #9E450B');
    expect(indexCss).toContain('--color-artichoke-deep: #4D5922');
    expect(indexCss).toContain('--color-ochre-deep: #805B1A');
    expect(indexCss).toContain('@media print');
    expect(indexCss).toContain(
      '[data-print-isolating="true"] article[data-testid^="order-card-"]:not([data-print-active="true"])',
    );
  });

  it('contains zero pure #FFFFFF / #000000 or *-white / *-black tokens across index.html, public/, and src/', () => {
    const filesToScan = [
      ...collectScannableFiles(path.join(ADMIN_ROOT, 'index.html')),
      ...collectScannableFiles(path.join(ADMIN_ROOT, 'public')),
      ...collectScannableFiles(path.join(ADMIN_ROOT, 'src')),
    ];

    expect(filesToScan.length).toBeGreaterThanOrEqual(8);

    const violations: string[] = [];
    for (const filePath of filesToScan) {
      const content = fs.readFileSync(filePath, 'utf8');
      const relative = path.relative(ADMIN_ROOT, filePath);
      for (const rule of FORBIDDEN_BW_PATTERNS) {
        const match = content.match(rule.regex);
        if (match) {
          violations.push(`${relative}: matched ${rule.label} ("${match[0]}")`);
        }
      }
    }

    expect(violations).toEqual([]);

    const tsxFiles = collectScannableFiles(
      path.join(ADMIN_ROOT, 'src'),
    ).filter((filePath) => filePath.endsWith('.tsx'));
    expect(tsxFiles.length).toBeGreaterThanOrEqual(5);

    const uiViolations: string[] = [];
    const uiRules: ReadonlyArray<{ label: string; regex: RegExp }> = [
      { label: 'sm:min-h-9/10 regression', regex: /\bsm:min-h-(9|10)\b/ },
      { label: 'sub-12px text-[9/10/11px]', regex: /\btext-\[(9|10|11)px\]/ },
      { label: 'non-compositor transition-all', regex: /\btransition-all\b/ },
      { label: 'ASCII three-dot UI copy', regex: /[A-Za-zÀ-ỹ0-9]\.\.\./ },
      {
        label: 'low-contrast bg-terracotta/bg-artichoke paired with text-surface-light',
        regex:
          /\bbg-(terracotta|artichoke)(?![-a-z0-9])(?=[^\n`"]*text-surface-light)/,
      },
      {
        label: 'low-contrast text-subhead-ochre, text-terracotta, or text-artichoke',
        regex: /\btext-(subhead-ochre|terracotta|artichoke)(?![-a-z0-9])/,
      },
    ];

    for (const filePath of tsxFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const relative = path.relative(ADMIN_ROOT, filePath);
      for (const rule of uiRules) {
        const match = content.match(rule.regex);
        if (match) {
          uiViolations.push(`${relative}: matched ${rule.label} ("${match[0]}")`);
        }
      }
    }
    expect(uiViolations).toEqual([]);
  });
});
