import { parseCorsOrigins, resolveBackendPort } from './cors.config';

describe('parseCorsOrigins & resolveBackendPort', () => {
  it('falls back to web (3000) and admin (3001) when unset or blank', () => {
    expect(parseCorsOrigins(undefined)).toEqual([
      'http://localhost:3000',
      'http://localhost:3001',
    ]);
    expect(parseCorsOrigins('  ,  ')).toEqual([
      'http://localhost:3000',
      'http://localhost:3001',
    ]);
  });

  it('trims whitespace and strips trailing slashes on custom origins', () => {
    expect(
      parseCorsOrigins(' http://localhost:3000/ , https://admin.omsua.vn/// '),
    ).toEqual(['http://localhost:3000', 'https://admin.omsua.vn']);
  });

  it('resolveBackendPort checks BACKEND_PORT ?? PORT and falls back to 4000', () => {
    expect(resolveBackendPort({})).toBe(4000);
    expect(resolveBackendPort({ PORT: '4100' })).toBe(4100);
    expect(resolveBackendPort({ BACKEND_PORT: '4200', PORT: '4100' })).toBe(
      4200,
    );
    expect(resolveBackendPort({ BACKEND_PORT: '', PORT: '4100' })).toBe(4100);
    expect(resolveBackendPort({ BACKEND_PORT: 'invalid' })).toBe(4000);
    expect(resolveBackendPort({ BACKEND_PORT: '70000' })).toBe(4000);
  });
});
