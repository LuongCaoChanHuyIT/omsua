import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import eslintConfig from '../../eslint.config.mjs';
import HomePage from '../app/page';

describe('web config & HomePage Storefront SSR consistency', () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
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

  it('normalizes NEXT_PUBLIC_API_URL for HomePage SSR fetches and renders warm Ốm Sữa Storefront fallback markup', async () => {
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
});
