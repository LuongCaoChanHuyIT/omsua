import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import eslintConfig from '../../eslint.config.mjs';
import HomePage from '../app/page';

describe('web config & HomePage URL consistency', () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }
  });

  it('enforces react-hooks rules-of-hooks and exhaustive-deps in web ESLint flat config', () => {
    const mergedRules = Object.assign(
      {},
      ...eslintConfig.map((entry: { rules?: Record<string, unknown> }) => entry.rules ?? {}),
    );
    expect(mergedRules['react-hooks/rules-of-hooks']).toBeDefined();
    expect(mergedRules['react-hooks/exhaustive-deps']).toBeDefined();
  });

  it('derives Backend Health and Swagger links on HomePage from NEXT_PUBLIC_API_URL', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.staging.omsua.vn/api///';
    const html = renderToStaticMarkup(createElement(HomePage));
    expect(html).toContain('https://api.staging.omsua.vn/api/health');
    expect(html).toContain('https://api.staging.omsua.vn/api/docs');
    expect(html).not.toContain('http://localhost:4000/api/health');
  });
});

