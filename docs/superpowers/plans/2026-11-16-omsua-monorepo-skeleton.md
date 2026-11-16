# OmSua Monorepo Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable, tested `pnpm` monorepo base skeleton for OmSua with `@omsua/shared` (TypeScript contracts), `@omsua/backend` (NestJS), `@omsua/web` (Next.js App Router), and `@omsua/admin` (React + Vite).

**Architecture:** Single `pnpm` workspace (`pnpm-workspace.yaml`) with shared TypeScript contracts in `packages/shared` built via `tsup` into dual CJS/ESM bundles + `.d.ts` declarations. `apps/backend` exposes `/api/health` and `/api/docs` (Swagger) on port `4000` with CORS and validation configured; `apps/web` (`:3000`) and `apps/admin` (`:3001`) consume `@omsua/shared` and verify live connectivity against `/api/health` with graceful offline fallbacks.

**Tech Stack:** Node.js v22, pnpm v12, TypeScript 5, `tsup`, NestJS 11 (`@nestjs/config`, `@nestjs/swagger`, `class-validator`, `class-transformer`, Jest, Supertest), Next.js 15+ (App Router, React 19, Tailwind CSS, Vitest), Vite 6+ (React 19, `react-router-dom` v7, Tailwind CSS, Vitest, Testing Library).

**Spec:** `docs/superpowers/specs/2026-11-16-omsua-monorepo-skeleton-design.md`

## Global Constraints

- Host runtime: Linux, Node.js `v22.23.4`, `pnpm` `12.18.0`, `git` `2.56.1`, no Docker dependency.
- Configure `pnpm.onlyBuiltDependencies` in root `package.json` (`["@nestjs/core", "@swc/core", "esbuild", "sharp", "unrs-resolver"]`) so `pnpm install` runs non-interactively on pnpm v12.
- Package names: `@omsua/shared`, `@omsua/backend`, `@omsua/web`, `@omsua/admin`.
- Fixed default ports: `web` = `3000`, `admin` = `3001`, `backend` = `4000` (API prefix `/api`, Swagger `/api/docs`).
- Zero business/domain bloat, zero database/ORM dependencies, zero auth boilerplate.
- Commit `.env.example` in each app and create gitignored local `.env` / `.env.local` files so `pnpm dev` works immediately after install.

## Review Focus

1. **Backend offline (`ECONNREFUSED`) during `next build` or UI boot:** `fetchBackendHealth` in both `web` and `admin` must catch network/HTTP/JSON errors and return `{ ok: false, error }` without throwing or breaking static build prerendering.
2. **Whitespace or trailing slashes in `CORS_ORIGINS` and API URL env vars (e.g. `"http://localhost:3000, http://localhost:3001/"` or `"http://localhost:4000/api/"`):** `parseCorsOrigins` and `normalizeApiBaseUrl` must trim whitespace and strip trailing slashes so CORS never silently blocks valid origins and requests never hit `/api//health`.
3. **CommonJS vs ESM dual-consumption of `@omsua/shared`:** `@omsua/shared` built output must load cleanly via both Node CommonJS `require('@omsua/shared')` (used by NestJS `dist/main.js`) and ESM `import('@omsua/shared')` (used by Next.js and Vite).
4. **Silent Vite port bump (`3001` -> `3002`) breaking CORS:** `apps/admin/vite.config.ts` must enforce `server.port: 3001` and `server.strictPort: true` so port conflicts fail loudly instead of silently breaking backend CORS.
5. **Missing `.env` file on fresh checkout:** `backend`, `web`, and `admin` must fall back to `DEFAULT_PORTS` (`4000`, `3000`, `3001`) and `DEFAULT_API_BASE_URL` (`http://localhost:4000/api`) when env vars are unset.

---

## Planned File Structure

```text
OmSua/
├── .gitignore
├── package.json                            # Root workspace scripts & pnpm.onlyBuiltDependencies
├── pnpm-workspace.yaml                     # Workspace globs: apps/*, packages/*
├── tsconfig.base.json                      # Shared strict TypeScript compiler options
├── README.md                               # Quickstart, ports, scripts, architecture overview
├── docs/superpowers/
│   ├── specs/2026-11-16-omsua-monorepo-skeleton-design.md
│   └── plans/2026-11-16-omsua-monorepo-skeleton.md
├── packages/shared/
│   ├── package.json                        # @omsua/shared dual CJS/ESM exports
│   ├── tsconfig.json
│   ├── tsup.config.ts
│   └── src/
│       ├── index.ts                        # Public barrel export
│       ├── constants.ts                    # DEFAULT_PORTS, DEFAULT_API_BASE_URL
│       ├── contracts.ts                    # ApiResponse<T>, HealthStatus, HealthFetchResult
│       ├── utils.ts                        # createApiResponse, normalizeApiBaseUrl
│       └── index.test.ts                   # Unit + dual CJS/ESM import tests
├── apps/backend/
│   ├── .env.example
│   ├── .env                                # Gitignored local defaults
│   ├── package.json                        # @omsua/backend scripts & dependencies
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── eslint.config.mjs
│   ├── src/
│   │   ├── main.ts                         # Boots Nest app on PORT (4000)
│   │   ├── app.setup.ts                    # configureApp(): /api prefix, ValidationPipe, CORS, Swagger
│   │   ├── app.module.ts                   # ConfigModule.forRoot({ isGlobal: true }) + HealthModule
│   │   ├── config/
│   │   │   ├── cors.config.ts              # parseCorsOrigins(raw?: string): string[]
│   │   │   └── cors.config.spec.ts
│   │   └── health/
│   │       ├── health.module.ts
│   │       ├── health.service.ts           # getHealth(): ApiResponse<HealthStatus>
│   │       ├── health.controller.ts        # GET /api/health (+ ping echo validation query DTO)
│   │       └── health.controller.spec.ts
│   └── test/
│       ├── jest-e2e.json
│       └── app.e2e-spec.ts                 # Supertest e2e: /api/health, CORS headers, ValidationPipe, /api/docs
├── apps/web/
│   ├── .env.example
│   ├── .env.local                          # Gitignored local defaults
│   ├── package.json                        # @omsua/web scripts (port 3000)
│   ├── next.config.ts                      # transpilePackages: ['@omsua/shared']
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   ├── vitest.config.ts
│   └── src/
│       ├── app/
│       │   ├── globals.css                 # Tailwind CSS entry
│       │   ├── layout.tsx                  # Root HTML layout & metadata
│       │   └── page.tsx                    # OmSua Web starter page + HealthStatusCard
│       ├── components/
│       │   └── health-status-card.tsx      # Client component polling/refreshing backend health
│       └── lib/
│           ├── api.ts                      # fetchBackendHealth()
│           └── api.test.ts                 # Unit tests: online, offline, trailing slash, non-200, missing env
└── apps/admin/
    ├── .env.example
    ├── .env                                # Gitignored local defaults
    ├── index.html
    ├── package.json                        # @omsua/admin scripts (port 3001)
    ├── tsconfig.json
    ├── eslint.config.js
    ├── vite.config.ts                      # React + Tailwind + strictPort 3001 + Vitest config
    └── src/
        ├── main.tsx
        ├── index.css                       # Tailwind CSS entry
        ├── App.tsx                         # App & AppRoutes (/ and /settings)
        ├── App.test.tsx                    # Route & dashboard status rendering + strictPort config tests
        ├── layouts/
        │   └── AdminLayout.tsx             # Sidebar + topbar shell + <Outlet />
        ├── pages/
        │   ├── DashboardPage.tsx           # Live backend health status & skeleton cards
        │   └── SettingsPage.tsx            # Environment & API config overview placeholder
        └── lib/
            ├── api.ts                      # fetchBackendHealth()
            └── api.test.ts                 # Unit tests: online, offline, trailing slash, missing env
```

---

### Task 1: Workspace Foundation & `@omsua/shared` Package

**Files:**
- Create: `.gitignore`
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `README.md`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/tsup.config.ts`
- Create: `packages/shared/src/constants.ts`
- Create: `packages/shared/src/contracts.ts`
- Create: `packages/shared/src/utils.ts`
- Create: `packages/shared/src/index.ts`
- Test: `packages/shared/src/index.test.ts`

**Interfaces:**
- Consumes: none (root foundation)
- Produces (`@omsua/shared`):
  - `DEFAULT_PORTS: { readonly WEB: 3000; readonly ADMIN: 3001; readonly BACKEND: 4000 }`
  - `DEFAULT_API_BASE_URL = 'http://localhost:4000/api'`
  - `interface ApiResponse<T> { success: boolean; data: T; timestamp: string }`
  - `interface HealthStatus { status: 'ok'; service: string; version: string; uptime: number; environment: string }`
  - `type HealthFetchResult = { ok: true; payload: ApiResponse<HealthStatus> } | { ok: false; error: string }`
  - `createApiResponse<T>(data: T, timestamp?: string): ApiResponse<T>`
  - `normalizeApiBaseUrl(rawUrl?: string): string`

- [ ] **Step 1: Initialize git repository and create workspace root files**

Initialize git (`git init -b main`), create `.gitignore` (ignoring `node_modules/`, `dist/`, `.next/`, `coverage/`, `.env`, `.env.local`, `.env.*.local`, `*.tsbuildinfo`, while keeping `!.env.example`), `pnpm-workspace.yaml` (`packages: ['apps/*', 'packages/*']`), `tsconfig.base.json` (`target: "ES2022"`, `strict: true`, `skipLibCheck: true`, `esModuleInterop: true`), `README.md`, and root `package.json` with:
- `"private": true`, `"packageManager": "pnpm@12.18.0"`, `"engines": { "node": ">=22.0.0" }`
- `"pnpm": { "onlyBuiltDependencies": ["@nestjs/core", "@swc/core", "esbuild", "sharp", "unrs-resolver"] }`
- Root scripts:
  - `"build:shared": "pnpm --filter @omsua/shared build"`
  - `"dev": "pnpm build:shared && pnpm --parallel --stream -r run dev"`
  - `"dev:backend": "pnpm build:shared && pnpm --filter @omsua/backend dev"`
  - `"dev:web": "pnpm build:shared && pnpm --filter @omsua/web dev"`
  - `"dev:admin": "pnpm build:shared && pnpm --filter @omsua/admin dev"`
  - `"build": "pnpm build:shared && pnpm --filter './apps/*' build"`
  - `"typecheck": "pnpm build:shared && pnpm -r run typecheck"`
  - `"lint": "pnpm build:shared && pnpm -r run lint"`
  - `"test": "pnpm build:shared && pnpm -r run test"`

- [ ] **Step 2: Scaffold `packages/shared` configuration and write the failing test**

Create `packages/shared/package.json` (`name: "@omsua/shared"`, `main: "./dist/index.cjs"`, `module: "./dist/index.js"`, `types: "./dist/index.d.ts"`, `exports: { ".": { "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }, "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" } } }`, scripts `build`, `dev` (`tsup --watch`), `typecheck`, `lint`, `test` (`vitest run`)), `tsconfig.json`, `tsup.config.ts` (`format: ['cjs', 'esm'], dts: true, clean: true`), install devDependencies (`typescript`, `tsup`, `vitest`, `@types/node`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`), and write `packages/shared/src/index.test.ts`:

```ts
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
    const cjsOut = execFileSync(
      process.execPath,
      ['-e', 'const s = require("./dist/index.cjs"); console.log(s.DEFAULT_PORTS.BACKEND);'],
      { cwd: process.cwd(), encoding: 'utf8' },
    ).trim();
    const esmOut = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', 'import { DEFAULT_PORTS } from "./dist/index.js"; console.log(DEFAULT_PORTS.WEB);'],
      { cwd: process.cwd(), encoding: 'utf8' },
    ).trim();
    expect(cjsOut).toBe('4000');
    expect(esmOut).toBe('3000');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @omsua/shared test`
Expected: FAIL (`Cannot find module './index'`)

- [ ] **Step 4: Implement `@omsua/shared` modules and build**

Implement `constants.ts`, `contracts.ts`, `utils.ts`, and barrel `index.ts` matching the exact signatures in **Interfaces**, plus ESLint flat config (`packages/shared/eslint.config.mjs`). Run `pnpm --filter @omsua/shared build`.

- [ ] **Step 5: Run build, typecheck, lint, and tests to verify they pass**

Run: `pnpm --filter @omsua/shared build && pnpm --filter @omsua/shared typecheck && pnpm --filter @omsua/shared lint && pnpm --filter @omsua/shared test`
Expected: PASS (4 tests passing, `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, `dist/index.d.cts` emitted)

- [ ] **Step 6: Commit**

```bash
git add .gitignore pnpm-workspace.yaml package.json tsconfig.base.json README.md docs/ packages/shared/ pnpm-lock.yaml
git commit -m "chore: initialize pnpm workspace and @omsua/shared package"
```

---

### Task 2: `@omsua/backend` (NestJS Application)

**Files:**
- Create: `apps/backend/.env.example`
- Create: `apps/backend/.env` (gitignored)
- Create: `apps/backend/package.json`
- Create: `apps/backend/nest-cli.json`
- Create: `apps/backend/tsconfig.json`
- Create: `apps/backend/tsconfig.build.json`
- Create: `apps/backend/eslint.config.mjs`
- Create: `apps/backend/src/config/cors.config.ts`
- Create: `apps/backend/src/health/dto/health-query.dto.ts`
- Create: `apps/backend/src/health/health.service.ts`
- Create: `apps/backend/src/health/health.controller.ts`
- Create: `apps/backend/src/health/health.module.ts`
- Create: `apps/backend/src/app.module.ts`
- Create: `apps/backend/src/app.setup.ts`
- Create: `apps/backend/src/main.ts`
- Test: `apps/backend/src/config/cors.config.spec.ts`
- Test: `apps/backend/src/health/health.controller.spec.ts`
- Test: `apps/backend/test/jest-e2e.json`
- Test: `apps/backend/test/app.e2e-spec.ts`

**Interfaces:**
- Consumes (`@omsua/shared`): `DEFAULT_PORTS`, `ApiResponse`, `HealthStatus`, `createApiResponse`
- Produces:
  - `parseCorsOrigins(rawOrigins?: string): string[]` in `apps/backend/src/config/cors.config.ts`
  - `configureApp(app: INestApplication): void` in `apps/backend/src/app.setup.ts`
  - HTTP `GET http://localhost:4000/api/health` -> `200 OK` JSON matching `ApiResponse<HealthStatus>` (`{ success: true, data: { status: 'ok', service: 'omsua-backend', version: '0.1.0', uptime: number, environment: string }, timestamp: string }`)
  - HTTP `GET http://localhost:4000/api/docs` -> `200 OK` Swagger UI

- [ ] **Step 1: Scaffold `apps/backend` config files and write failing unit & e2e tests**

Create `apps/backend/package.json` (`name: "@omsua/backend"`, dependency `"@omsua/shared": "workspace:*"`, `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/swagger`, `class-validator`, `class-transformer`, `reflect-metadata`, `rxjs`; devDependencies `@nestjs/cli`, `@nestjs/testing`, `jest`, `ts-jest`, `supertest`, `@types/jest`, `@types/supertest`, `@types/express`, `typescript`, `typescript-eslint`, `eslint`; scripts `dev`: `nest start --watch`, `build`: `nest build`, `start`: `node dist/main`, `typecheck`: `tsc --noEmit`, `lint`: `eslint "{src,test}/**/*.ts"`, `test`: `jest && jest --config ./test/jest-e2e.json`), `.env.example` & `.env` (`PORT=4000`, `NODE_ENV=development`, `CORS_ORIGINS=http://localhost:3000,http://localhost:3001`), `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `eslint.config.mjs`, and `test/jest-e2e.json`.

Write `apps/backend/src/config/cors.config.spec.ts`:
```ts
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
```

Write `apps/backend/src/health/health.controller.spec.ts` asserting `HealthController.check()` returns `success: true`, `data.status === 'ok'`, `data.service === 'omsua-backend'`, and numeric `uptime`.

Write `apps/backend/test/app.e2e-spec.ts` using `@nestjs/testing` + `configureApp(app)` + `supertest`:
1. `GET /api/health` returns `200` with `{ success: true, data: { status: 'ok', service: 'omsua-backend', ... }, timestamp }`.
2. `GET /api/health` with `Origin: http://localhost:3000` and `Origin: http://localhost:3001` sets `Access-Control-Allow-Origin` matching the origin; an unlisted `Origin: http://evil.example.com` omits `Access-Control-Allow-Origin`.
3. `GET /api/health?unexpectedParam=1` returns `400 Bad Request` (proving global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true` is active via `HealthQueryDto`).
4. `GET /api/docs` returns `200` containing Swagger HTML.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm install && pnpm --filter @omsua/backend test`
Expected: FAIL (missing source modules `./cors.config`, `./health.controller`, `../src/app.module`)

- [ ] **Step 3: Implement `@omsua/backend` modules**

Implement:
- `src/config/cors.config.ts`: `parseCorsOrigins(rawOrigins?: string): string[]`
- `src/health/dto/health-query.dto.ts`: `class HealthQueryDto { @IsOptional() @IsString() echo?: string; }`
- `src/health/health.service.ts`: `HealthService.getHealth(): ApiResponse<HealthStatus>` consuming `ConfigService` and `createApiResponse` from `@omsua/shared`
- `src/health/health.controller.ts`: `@Controller('health')` with `@Get() check(@Query() _query: HealthQueryDto): ApiResponse<HealthStatus>`
- `src/health/health.module.ts` & `src/app.module.ts` (`ConfigModule.forRoot({ isGlobal: true })`)
- `src/app.setup.ts`: `configureApp(app: INestApplication): void` setting global prefix `'api'`, global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`, CORS via `parseCorsOrigins`, and Swagger at `'api/docs'`
- `src/main.ts`: bootstraps `AppModule`, calls `configureApp(app)`, listens on `Number(process.env.PORT) || DEFAULT_PORTS.BACKEND`

- [ ] **Step 4: Run build, runtime CJS smoke check, typecheck, lint, and tests**

Run: `pnpm --filter @omsua/backend build && pnpm --filter @omsua/backend typecheck && pnpm --filter @omsua/backend lint && pnpm --filter @omsua/backend test`
Expected: PASS (all unit + e2e specs pass, `dist/main.js` compiled cleanly)

- [ ] **Step 5: Commit**

```bash
git add apps/backend pnpm-lock.yaml
git commit -m "feat(backend): scaffold NestJS API with health endpoint, CORS, validation, and Swagger"
```

---

### Task 3: `@omsua/web` (Next.js App Router Application)

**Files:**
- Create: `apps/web/.env.example`
- Create: `apps/web/.env.local` (gitignored)
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/eslint.config.mjs`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/components/health-status-card.tsx`
- Create: `apps/web/src/app/globals.css`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Test: `apps/web/src/lib/api.test.ts`

**Interfaces:**
- Consumes (`@omsua/shared`): `ApiResponse`, `HealthStatus`, `HealthFetchResult`, `normalizeApiBaseUrl`, `DEFAULT_PORTS`
- Consumes (`@omsua/backend` HTTP): `GET ${NEXT_PUBLIC_API_URL}/health`
- Produces:
  - `fetchBackendHealth(baseUrl?: string, fetchImpl?: typeof fetch): Promise<HealthFetchResult>` in `apps/web/src/lib/api.ts`
  - Next.js web app running on `http://localhost:3000`

- [ ] **Step 1: Scaffold `apps/web` configuration and write failing API client tests**

Create `apps/web/package.json` (`name: "@omsua/web"`, dependencies `"@omsua/shared": "workspace:*"`, `next`, `react`, `react-dom`; devDependencies `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `eslint`, `@eslint/eslintrc`, `eslint-config-next`, `vitest`; scripts `dev`: `next dev --port 3000`, `build`: `next build`, `start`: `next start --port 3000`, `typecheck`: `next typegen && tsc --noEmit`, `lint`: `eslint .`, `test`: `vitest run`), `.env.example` & `.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:4000/api`), `next.config.ts` (`transpilePackages: ['@omsua/shared']`), `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, and `vitest.config.ts`.

Write `apps/web/src/lib/api.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest';
import { fetchBackendHealth } from './api';

describe('fetchBackendHealth (web)', () => {
  it('calls normalized /health URL and returns payload when online', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          status: 'ok',
          service: 'omsua-backend',
          version: '0.1.0',
          uptime: 12.5,
          environment: 'development',
        },
        timestamp: '2026-11-16T00:00:00.000Z',
      }),
    });

    const result = await fetchBackendHealth(
      'http://localhost:4000/api///',
      mockFetch as unknown as typeof fetch,
    );
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/health', {
      cache: 'no-store',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.data.service).toBe('omsua-backend');
    }
  });

  it('falls back to default API URL when env var is missing and handles offline errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED'));
    const result = await fetchBackendHealth('', mockFetch as unknown as typeof fetch);

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/health', {
      cache: 'no-store',
    });
    expect(result).toEqual({ ok: false, error: 'connect ECONNREFUSED' });
  });

  it('returns error state on non-200 HTTP response without throwing', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    const result = await fetchBackendHealth(
      'http://localhost:4000/api',
      mockFetch as unknown as typeof fetch,
    );
    expect(result).toEqual({ ok: false, error: 'HTTP 503' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm install && pnpm --filter @omsua/web test`
Expected: FAIL (`Cannot find module './api'`)

- [ ] **Step 3: Implement `fetchBackendHealth`, `HealthStatusCard`, and Next.js App Router pages**

Implement:
- `src/lib/api.ts`: `fetchBackendHealth(baseUrl = process.env.NEXT_PUBLIC_API_URL, fetchImpl: typeof fetch = fetch): Promise<HealthFetchResult>`
- `src/components/health-status-card.tsx`: `'use client'` component calling `fetchBackendHealth()` on mount with a "Kiểm tra lại" (Refresh) button, showing green connected status (`service`, `environment`, `uptime`) or amber offline state (`error`) without throwing.
- `src/app/globals.css`, `src/app/layout.tsx`, and `src/app/page.tsx`: clean Tailwind starter page for OmSua Web displaying workspace links (`Web :3000`, `Admin :3001`, `API :4000/api/health`, `Swagger :4000/api/docs`) and `<HealthStatusCard />`.

- [ ] **Step 4: Run test, typecheck, lint, and offline `next build` verification**

Run: `pnpm --filter @omsua/web test && pnpm --filter @omsua/web typecheck && pnpm --filter @omsua/web lint && pnpm --filter @omsua/web build`
Expected: PASS (unit tests pass and `next build` completes cleanly with backend stopped)

- [ ] **Step 5: Commit**

```bash
git add apps/web pnpm-lock.yaml
git commit -m "feat(web): scaffold Next.js App Router storefront skeleton with backend health check"
```

---

### Task 4: `@omsua/admin` (React + Vite Application) & Full Monorepo Verification

**Files:**
- Create: `apps/admin/.env.example`
- Create: `apps/admin/.env` (gitignored)
- Create: `apps/admin/index.html`
- Create: `apps/admin/package.json`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/eslint.config.js`
- Create: `apps/admin/vite.config.ts`
- Create: `apps/admin/src/index.css`
- Create: `apps/admin/src/lib/api.ts`
- Create: `apps/admin/src/layouts/AdminLayout.tsx`
- Create: `apps/admin/src/pages/DashboardPage.tsx`
- Create: `apps/admin/src/pages/SettingsPage.tsx`
- Create: `apps/admin/src/App.tsx`
- Create: `apps/admin/src/main.tsx`
- Test: `apps/admin/src/lib/api.test.ts`
- Test: `apps/admin/src/App.test.tsx`

**Interfaces:**
- Consumes (`@omsua/shared`): `ApiResponse`, `HealthStatus`, `HealthFetchResult`, `normalizeApiBaseUrl`, `DEFAULT_PORTS`
- Consumes (`@omsua/backend` HTTP): `GET ${VITE_API_URL}/health`
- Produces:
  - `fetchBackendHealth(baseUrl?: string, fetchImpl?: typeof fetch): Promise<HealthFetchResult>` in `apps/admin/src/lib/api.ts`
  - `AppRoutes` and `App` in `apps/admin/src/App.tsx` serving `/` (`DashboardPage`) and `/settings` (`SettingsPage`) inside `AdminLayout`
  - Vite dev/preview server pinned strictly to port `3001` (`strictPort: true`)

- [ ] **Step 1: Scaffold `apps/admin` config files and write failing tests**

Create `apps/admin/package.json` (`name: "@omsua/admin"`, `"type": "module"`, dependencies `"@omsua/shared": "workspace:*"`, `react`, `react-dom`, `react-router-dom`; devDependencies `typescript`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `@types/react`, `@types/react-dom`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`; scripts `dev`: `vite`, `build`: `tsc --noEmit && vite build`, `preview`: `vite preview`, `typecheck`: `tsc --noEmit`, `lint`: `eslint .`, `test`: `vitest run`), `.env.example` & `.env` (`VITE_API_URL=http://localhost:4000/api`), `index.html`, `tsconfig.json`, `eslint.config.js`, and `vite.config.ts` (`server: { port: DEFAULT_PORTS.ADMIN, strictPort: true }`, `preview: { port: DEFAULT_PORTS.ADMIN, strictPort: true }`, `test: { environment: 'jsdom' }`).

Write `apps/admin/src/lib/api.test.ts` testing `fetchBackendHealth`:
1. Normalizes trailing slashes and parses `ApiResponse<HealthStatus>` on `200 OK`.
2. Falls back to `http://localhost:4000/api/health` when `baseUrl` is empty and returns `{ ok: false, error }` on network rejection.

Write `apps/admin/src/App.test.tsx`:
1. Asserts `vite.config.ts` sets `server.port === 3001` and `server.strictPort === true`.
2. Renders `<MemoryRouter initialEntries={['/']}><AppRoutes /></MemoryRouter>` with mocked `fetch`, verifying sidebar links (`Tổng quan`, `Cài đặt`) and live `omsua-backend` status appear on `/`.
3. Renders `<MemoryRouter initialEntries={['/settings']}><AppRoutes /></MemoryRouter>` verifying the Settings placeholder view renders.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm install && pnpm --filter @omsua/admin test`
Expected: FAIL (missing `./api` and `./App`)

- [ ] **Step 3: Implement `@omsua/admin` API client, layout, pages, and router**

Implement `src/index.css`, `src/lib/api.ts`, `src/layouts/AdminLayout.tsx`, `src/pages/DashboardPage.tsx`, `src/pages/SettingsPage.tsx`, `src/App.tsx`, and `src/main.tsx`.

- [ ] **Step 4: Run admin build, typecheck, lint, and tests**

Run: `pnpm --filter @omsua/admin test && pnpm --filter @omsua/admin typecheck && pnpm --filter @omsua/admin lint && pnpm --filter @omsua/admin build`
Expected: PASS (all tests pass and `apps/admin/dist` built cleanly)

- [ ] **Step 5: Run full root workspace verification & live HTTP smoke check**

1. Run root workspace pipeline:
   `pnpm build && pnpm typecheck && pnpm lint && pnpm test`
   Expected: PASS across all 4 workspace packages (`@omsua/shared`, `@omsua/backend`, `@omsua/web`, `@omsua/admin`).
2. Start `pnpm dev` briefly in a background process, verify HTTP `200` on `http://localhost:4000/api/health` (with `Origin: http://localhost:3000` and `Origin: http://localhost:3001`), `http://localhost:4000/api/docs`, `http://localhost:3000`, and `http://localhost:3001`, then stop the background process cleanly.

- [ ] **Step 6: Commit**

```bash
git add apps/admin pnpm-lock.yaml
git commit -m "feat(admin): scaffold React Vite admin shell and verify full monorepo pipeline"
```
