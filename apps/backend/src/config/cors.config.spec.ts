import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createCorsOriginDelegate,
  isCorsOriginAllowed,
  parseCorsOrigins,
  resolveBackendPort,
} from './cors.config';

const REPO_ROOT = resolve(__dirname, '../../../..');

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

describe('isCorsOriginAllowed & createCorsOriginDelegate', () => {
  const vercelPatterns = [
    'https://omsua-web.vercel.app',
    'https://omsua-web*.vercel.app',
    'http://localhost:3000',
  ];

  it('matches exact origins and single-label DNS wildcard patterns', () => {
    expect(isCorsOriginAllowed('http://localhost:3000', vercelPatterns)).toBe(
      true,
    );
    expect(
      isCorsOriginAllowed('https://omsua-web.vercel.app', vercelPatterns),
    ).toBe(true);
    expect(
      isCorsOriginAllowed(
        'https://omsua-web-git-main-luong-cao-chan-huys-projects.vercel.app',
        vercelPatterns,
      ),
    ).toBe(true);
  });

  it('rejects subdomain spoofing, suffix spoofing, scheme downgrade, and multi-label wildcards', () => {
    expect(
      isCorsOriginAllowed(
        'https://omsua-web.vercel.app.evil.com',
        vercelPatterns,
      ),
    ).toBe(false);
    expect(
      isCorsOriginAllowed('https://evil-omsua-web.vercel.app', vercelPatterns),
    ).toBe(false);
    expect(
      isCorsOriginAllowed('http://omsua-web.vercel.app', vercelPatterns),
    ).toBe(false);
    expect(
      isCorsOriginAllowed('https://omsua-web.sub.vercel.app', vercelPatterns),
    ).toBe(false);
    expect(isCorsOriginAllowed('https://omsua-web.vercel.app', ['*'])).toBe(
      false,
    );
  });

  it('allows undefined requestOrigin (health checks / SSR) and delegates matched vs unmatched origins', () => {
    const delegate = createCorsOriginDelegate(
      'https://omsua-web*.vercel.app,http://localhost:3000',
    );

    const onUndefined = jest.fn();
    delegate(undefined, onUndefined);
    expect(onUndefined).toHaveBeenCalledWith(null, true);

    const onAllowed = jest.fn();
    delegate(
      'https://omsua-web-luong-cao-chan-huys-projects.vercel.app',
      onAllowed,
    );
    expect(onAllowed).toHaveBeenCalledWith(null, true);

    const onBlocked = jest.fn();
    delegate('https://attacker.vercel.app', onBlocked);
    expect(onBlocked).toHaveBeenCalledWith(null, false);
  });
});

describe('cloud deployment repository invariants (Render & Node 22)', () => {
  it('pins Node 22, ignores .vercel, binds 0.0.0.0, and configures render.yaml Blueprint', () => {
    const nodeVersion = readFileSync(
      resolve(REPO_ROOT, '.node-version'),
      'utf8',
    ).trim();
    expect(nodeVersion).toBe('22');

    const rootPkg = JSON.parse(
      readFileSync(resolve(REPO_ROOT, 'package.json'), 'utf8'),
    ) as { engines?: { node?: string } };
    expect(rootPkg.engines?.node).toBe('>=22.5.0');

    const gitignore = readFileSync(resolve(REPO_ROOT, '.gitignore'), 'utf8');
    expect(gitignore).toContain('.vercel');

    const mainTs = readFileSync(
      resolve(REPO_ROOT, 'apps/backend/src/main.ts'),
      'utf8',
    );
    expect(mainTs).toContain("app.listen(port, '0.0.0.0')");

    const renderYaml = readFileSync(resolve(REPO_ROOT, 'render.yaml'), 'utf8');
    expect(renderYaml).toContain('name: omsua-backend');
    expect(renderYaml).toContain('runtime: node');
    expect(renderYaml).toContain('region: singapore');
    expect(renderYaml).toContain('healthCheckPath: /api/health');
    expect(renderYaml).toContain('--prod=false');
    expect(renderYaml).toContain('node apps/backend/dist/main.js');
  });
});
