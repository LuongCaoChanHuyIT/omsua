import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_PORTS,
  createApiResponse,
  normalizeApiBaseUrl,
} from './index';

describe('@omsua/shared', () => {
  it('exposes exact default ports and API base URL', () => {
    expect(DEFAULT_PORTS).toEqual({ WEB: 3000, ADMIN: 3001, BACKEND: 4000 });
    expect(DEFAULT_API_BASE_URL).toBe('http://localhost:4000/api');
  });

  it('normalizes trailing slashes, whitespace, and empty env values', () => {
    expect(normalizeApiBaseUrl(undefined)).toBe('http://localhost:4000/api');
    expect(normalizeApiBaseUrl('   ')).toBe('http://localhost:4000/api');
    expect(normalizeApiBaseUrl(' http://localhost:4000/api/// ')).toBe(
      'http://localhost:4000/api',
    );
  });

  it('wraps data in ApiResponse envelope', () => {
    const res = createApiResponse({ status: 'ok' }, '2026-11-16T00:00:00.000Z');
    expect(res).toEqual({
      success: true,
      data: { status: 'ok' },
      timestamp: '2026-11-16T00:00:00.000Z',
    });
  });

  it('resolves built package from both CommonJS require() and ESM import()', () => {
    const cleanEnv = { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' };
    const cjsOut = execFileSync(
      process.execPath,
      [
        '-e',
        'const s = require("./dist/index.cjs"); process.stdout.write(String(s.DEFAULT_PORTS.BACKEND));',
      ],
      { cwd: process.cwd(), encoding: 'utf8', env: cleanEnv },
    ).trim();
    const esmOut = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        'import { DEFAULT_PORTS } from "./dist/index.js"; process.stdout.write(String(DEFAULT_PORTS.WEB));',
      ],
      { cwd: process.cwd(), encoding: 'utf8', env: cleanEnv },
    ).trim();
    expect(cjsOut).toBe('4000');
    expect(esmOut).toBe('3000');
  });
});
