import { parseCorsOrigins } from './cors.config';

describe('parseCorsOrigins', () => {
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
});
