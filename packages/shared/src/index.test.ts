import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import tsupConfig from '../tsup.config';
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_PORTS,
  createApiResponse,
  normalizeApiBaseUrl,
  normalizeVietnameseText,
  resolveOrderAge,
} from './index';

describe('@omsua/shared', () => {
  it('disables dist cleaning in watch mode so pnpm dev never deletes active declarations', () => {
    expect(typeof tsupConfig).toBe('function');
    if (typeof tsupConfig === 'function') {
      const watchResolved = tsupConfig({ watch: true });
      const buildResolved = tsupConfig({});
      expect(watchResolved).toMatchObject({ clean: false });
      expect(buildResolved).toMatchObject({ clean: true });
    }
  });

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

  it('normalizes Vietnamese diacritics/Đ and resolves order age SLA badges safely across clock skew, invalid dates, and terminal statuses', () => {
    expect(normalizeVietnameseText('  Đức Trọng — Sữa Tươi Đường Đen  ')).toBe(
      'duc trong — sua tuoi duong den',
    );
    const baseNow = Date.parse('2026-11-19T08:30:00.000Z');
    expect(
      resolveOrderAge('2026-11-19T08:35:00.000Z', 'pending', baseNow),
    ).toEqual({
      label: 'Vừa đặt',
      minutes: 0,
      isOverdue: false,
    });
    expect(
      resolveOrderAge('2026-11-19T08:09:00.000Z', 'pending', baseNow),
    ).toEqual({
      label: '21 phút trước',
      minutes: 21,
      isOverdue: true,
    });
    expect(
      resolveOrderAge('2026-11-19T07:00:00.000Z', 'completed', baseNow),
    ).toEqual({
      label: '1 giờ 30 phút trước',
      minutes: 90,
      isOverdue: false,
    });
    expect(resolveOrderAge('not-a-date', 'pending', baseNow)).toBeNull();
  });
});
