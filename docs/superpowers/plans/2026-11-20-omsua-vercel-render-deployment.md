# Ốm Sữa Cloud Deployment (Vercel + Render) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden `@omsua/backend`, `@omsua/web`, and `@omsua/admin` for production cloud hosting and deploy the backend API + SQLite service to Render (`https://dashboard.render.com/`) and both frontend apps (`omsua-web`, `omsua-admin`) to Vercel (`https://vercel.com/luong-cao-chan-huys-projects`).

**Architecture:** Prepare deterministic infrastructure-as-code manifests (`render.yaml`, `.node-version`, `apps/web/vercel.json`, `apps/admin/vercel.json`), upgrade NestJS CORS to safely validate scoped Vercel preview/team subdomain wildcards (`https://omsua-web*.vercel.app`) alongside exact origins and `'0.0.0.0'` host binding, publish the verified `main` branch to GitHub (`LuongCaoChanHuyIT/omsua`), deploy `omsua-backend` on Render Singapore, and deploy `omsua-web` + `omsua-admin` on Vercel wired to the live Render API URL.

**Tech Stack:** Node.js 22 (`node:sqlite`), pnpm 12 Workspaces, NestJS 11 (Render Native Node Web Service), Next.js 15.5 App Router (Vercel Project `omsua-web`), Vite 6 + React Router 7 SPA (Vercel Project `omsua-admin`), GitHub CLI (`gh`), Vercel MCP / CLI.

**Spec:** `docs/superpowers/specs/2026-11-20-omsua-vercel-render-deployment-design.md`

## Global Constraints

- Node.js `>= 22.5.0` (`.node-version` = `22`) and `pnpm@12.18.0`; install zero new runtime npm packages inside `packages/shared`, `apps/backend`, `apps/web`, or `apps/admin`.
- Never commit secrets, tokens, `.env`, or `.vercel/` directories to Git (`.vercel` must be listed in `.gitignore`).
- Zero pure white or black tokens (`#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)`, `*-white`, `*-black`) anywhere in repository files.
- Keep all existing 173+ automated tests passing (`pnpm build && pnpm typecheck && pnpm lint && pnpm test`) and never stop local dev servers if running.

## Review Focus

1. **Spoofed suffix or protocol mismatch against wildcard `CORS_ORIGINS` (`https://omsua-web*.vercel.app`):** `isCorsOriginAllowed` must match `https://omsua-web.vercel.app` and `https://omsua-web-git-main-luong-cao-chan-huys-projects.vercel.app`, but strictly reject `https://omsua-web.vercel.app.evil.com`, `https://evil-omsua-web.vercel.app`, `http://omsua-web.vercel.app` (wrong scheme), and `https://omsua-web.evil.vercel.app` (extra dot label injected inside single-label `*`) (tested in Task 1).
2. **Server-to-server requests with no `Origin` header (`GET /api/health` from Render probe, SSR `fetchCatalog` from Vercel server):** `createCorsOriginDelegate` must allow `origin === undefined` without throwing or returning a CORS rejection error, while passing `false` for disallowed browser `Origin` headers (tested in Task 1).
3. **Render `NODE_ENV=production` skipping `devDependencies` (`tsup`, `@nestjs/cli`) or booting Node 20 without `node:sqlite`:** `render.yaml` and `.node-version` must pin Node `22`, run `pnpm install --frozen-lockfile --prod=false && pnpm --filter @omsua/shared build && pnpm --filter @omsua/backend build`, and set `healthCheckPath: /api/health` (tested in Task 1).
4. **Direct browser refresh on Admin SPA subroutes (`/menu`, `/branches`, `/settings`) vs static assets (`/assets/index.js`, `/images/fanpage/...`, `/favicon.svg`) on Vercel:** `apps/admin/vercel.json` must rewrite SPA routes to `/index.html` without rewriting `/assets/*`, `/images/*`, `/favicon.svg`, or `/robots.txt` (tested in Task 2).
5. **Render free-tier cold start (~25s) vs Storefront SSR TTFB (`1.5s`):** `HomePage` SSR must keep its `1500ms` timeout fallback so Vercel never stalls first paint, while `StorefrontClientShell` background catalog sync uses `CLIENT_CATALOG_TIMEOUT_MS = 20_000` so Render wakes up and syncs live availability in the background (tested in Task 2).

---

## Planned File Structure

- **Create:**
  - `.node-version` — Pins Node `22` for Render and Vercel build images.
  - `render.yaml` — Render Blueprint defining the `omsua-backend` Singapore Node 22 Web Service, build/start commands, `/api/health` probe, and production env vars.
  - `apps/web/vercel.json` — Vercel monorepo build config for `@omsua/web` ensuring `@omsua/shared` builds before `next build`.
  - `apps/admin/vercel.json` — Vercel monorepo build + SPA rewrite config for `@omsua/admin`.
- **Modify:**
  - `.gitignore` — Add `.vercel/` so local Vercel CLI linking metadata is never committed.
  - `package.json` — Tighten `engines.node` to `">=22.5.0"` (required by `node:sqlite`).
  - `apps/backend/src/config/cors.config.ts`, `apps/backend/src/app.setup.ts`, `apps/backend/src/main.ts` — Add safe wildcard-aware CORS origin validation and bind NestJS to `'0.0.0.0'`.
  - `apps/backend/src/config/cors.config.spec.ts` & `apps/backend/test/app.e2e-spec.ts` — Unit & Supertest E2E tests for wildcard CORS security, spoof rejection, and `render.yaml` / `.node-version` invariants.
  - `apps/web/src/components/storefront/StorefrontClientShell.tsx` — Pass `CLIENT_CATALOG_TIMEOUT_MS = 20_000` on client-side `fetchCatalog` wake-up calls while preserving `1500ms` SSR timeout.
  - `apps/web/src/lib/web-review.test.ts` & `apps/admin/src/vite-config.test.ts` — Static assertions validating `apps/web/vercel.json`, `apps/admin/vercel.json` SPA rewrites, and `.gitignore`.
  - `README.md` — Document production Vercel & Render architecture, live URLs, and 1-click redeploy commands.

---

### Task 1: Cloud-Ready Backend CORS, `0.0.0.0` Binding & Render Blueprint (`@omsua/backend` + `render.yaml`)

**Files:**
- Create: `.node-version`, `render.yaml`
- Modify: `.gitignore`, `package.json`, `apps/backend/src/config/cors.config.ts`, `apps/backend/src/app.setup.ts`, `apps/backend/src/main.ts`
- Test: `apps/backend/src/config/cors.config.spec.ts`, `apps/backend/test/app.e2e-spec.ts`

**Interfaces:**
- Consumes: `DEFAULT_PORTS` from `@omsua/shared`
- Produces:
  - `export function isCorsOriginAllowed(origin: string, allowedPatterns: readonly string[]): boolean` in `apps/backend/src/config/cors.config.ts`
  - `export function createCorsOriginDelegate(rawOrigins?: string): (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void` in `apps/backend/src/config/cors.config.ts`
  - Root `render.yaml` (`name: omsua-backend`, `region: singapore`, `healthCheckPath: /api/health`) and `.node-version` (`22`)

- [ ] **Step 1: Write failing tests in `apps/backend/src/config/cors.config.spec.ts` and `apps/backend/test/app.e2e-spec.ts`**

1. In `apps/backend/src/config/cors.config.spec.ts`, add tests asserting:
   - `isCorsOriginAllowed` matches exact origins and single-label DNS wildcard patterns (`https://omsua-web*.vercel.app` matches `https://omsua-web.vercel.app` and `https://omsua-web-git-main-luong-cao-chan-huys-projects.vercel.app`), while rejecting `https://omsua-web.vercel.app.evil.com`, `https://evil-omsua-web.vercel.app`, `http://omsua-web.vercel.app`, and `https://omsua-web.sub.vercel.app` (`Review Focus #1`).
   - `createCorsOriginDelegate` invokes `callback(null, true)` when `requestOrigin` is `undefined` (health checks / SSR) or matched, and `callback(null, false)` when unmatched (`Review Focus #2`).
   - Root `.node-version` equals `'22'`, `package.json` `engines.node` is `'>=22.5.0'`, `.gitignore` contains `.vercel`, and `render.yaml` defines `name: omsua-backend`, `runtime: node`, `region: singapore`, `healthCheckPath: /api/health`, `--prod=false`, and `node apps/backend/dist/main.js` (`Review Focus #3`).
2. In `apps/backend/test/app.e2e-spec.ts`, add a Supertest CORS preflight `OPTIONS /api/orders` check verifying `Origin: https://omsua-web-luong-cao-chan-huys-projects.vercel.app` receives `Access-Control-Allow-Origin` when `CORS_ORIGINS=https://omsua-web*.vercel.app`, while `Origin: https://attacker.vercel.app` does not.

- [ ] **Step 2: Run backend tests to verify they fail**

Run: `pnpm --filter @omsua/backend test`
Expected: FAIL (`isCorsOriginAllowed` / `createCorsOriginDelegate` not exported, `render.yaml` and `.node-version` missing).

- [ ] **Step 3: Implement wildcard-safe CORS, `'0.0.0.0'` host binding, `.node-version`, and `render.yaml`**

1. In `apps/backend/src/config/cors.config.ts`:
   - Keep `parseCorsOrigins(rawOrigins?: string): string[]` unchanged for existing callers.
   - Implement `patternToRegex(pattern: string): RegExp | null` validating `^https?://[a-z0-9.*-]+(?::\d+)?$` (case-insensitive), escaping regex metacharacters except `*`, and replacing each `*` with `[a-z0-9-]*` (single DNS label characters only — no dots or slashes).
   - Export `isCorsOriginAllowed` and `createCorsOriginDelegate`, wire `origin: createCorsOriginDelegate(configService.get<string>('CORS_ORIGINS'))` in `apps/backend/src/app.setup.ts`, and update `apps/backend/src/main.ts` to `await app.listen(port, '0.0.0.0')`.
2. Create `.node-version` (`22`), update `.gitignore` (`.vercel/`), update root `package.json` (`"node": ">=22.5.0"`), and create `render.yaml` configuring `omsua-backend` (`runtime: node`, `region: singapore`, `plan: free`, `buildCommand: pnpm install --frozen-lockfile --prod=false && pnpm --filter @omsua/shared build && pnpm --filter @omsua/backend build`, `startCommand: node apps/backend/dist/main.js`, `healthCheckPath: /api/health`, `NODE_VERSION: "22"`, `NODE_ENV: production`, `SQLITE_PATH: /tmp/omsua.sqlite`, `CORS_ORIGINS: https://omsua-web.vercel.app,https://omsua-admin.vercel.app,https://omsua-web*.vercel.app,https://omsua-admin*.vercel.app,http://localhost:3000,http://localhost:3001`).

- [ ] **Step 4: Run backend tests to verify they pass**

Run: `pnpm --filter @omsua/backend test`
Expected: PASS (all unit and E2E suites green).

- [ ] **Step 5: Commit**

```bash
git add .gitignore .node-version package.json render.yaml apps/backend
git commit -m "feat(backend,deploy): add scoped wildcard CORS, 0.0.0.0 binding, and Render Blueprint"
```

---

### Task 2: Vercel Monorepo Configs & Cold-Start Resilient Client Sync (`apps/web/vercel.json` + `apps/admin/vercel.json`)

**Files:**
- Create: `apps/web/vercel.json`, `apps/admin/vercel.json`
- Modify: `apps/web/src/components/storefront/StorefrontClientShell.tsx`
- Test: `apps/web/src/lib/web-review.test.ts`, `apps/web/src/components/modals/ordering-flow.test.tsx`, `apps/admin/src/vite-config.test.ts`

**Interfaces:**
- Consumes: `fetchCatalog(apiBaseUrl, fetchImpl, timeoutMs)` from `apps/web/src/lib/api.ts`
- Produces:
  - `apps/web/vercel.json` (`framework: "nextjs"`, `installCommand: "pnpm install --frozen-lockfile"`, `buildCommand: "pnpm --dir ../.. build:shared && pnpm build"`)
  - `apps/admin/vercel.json` (`framework: "vite"`, `installCommand: "pnpm install --frozen-lockfile"`, `buildCommand: "pnpm --dir ../.. build:shared && pnpm build"`, `outputDirectory: "dist"`, SPA rewrite rule)
  - `export const CLIENT_CATALOG_TIMEOUT_MS = 20_000` in `StorefrontClientShell.tsx`

- [ ] **Step 1: Write failing tests in `web-review.test.ts`, `ordering-flow.test.tsx`, and `vite-config.test.ts`**

1. In `apps/web/src/lib/web-review.test.ts`, assert `apps/web/vercel.json` exists, parses as valid JSON, sets `framework === 'nextjs'`, and runs `build:shared` before `pnpm build`.
2. In `apps/web/src/components/modals/ordering-flow.test.tsx`, assert `CLIENT_CATALOG_TIMEOUT_MS === 20_000` while SSR `HomePage` (`web-review.test.ts`) continues using the fast `1500ms` SSR timeout (`Review Focus #5`).
3. In `apps/admin/src/vite-config.test.ts`, assert `apps/admin/vercel.json` exists, sets `framework === 'vite'`, `outputDirectory === 'dist'`, builds `build:shared` first, and defines a SPA rewrite regex whose pattern matches `/menu`, `/branches`, `/settings` while NOT matching `/assets/index-abc.js`, `/images/fanpage/branches/branch-cs1-hoang-dieu.webp`, `/favicon.svg`, or `/robots.txt` (`Review Focus #4`).

- [ ] **Step 2: Run Web & Admin tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/lib/web-review.test.ts src/components/modals/ordering-flow.test.tsx && pnpm --filter @omsua/admin test src/vite-config.test.ts`
Expected: FAIL (`apps/web/vercel.json` and `apps/admin/vercel.json` missing, `CLIENT_CATALOG_TIMEOUT_MS` undefined).

- [ ] **Step 3: Create `apps/web/vercel.json`, `apps/admin/vercel.json`, and wire `CLIENT_CATALOG_TIMEOUT_MS`**

1. Create `apps/web/vercel.json`:
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "framework": "nextjs",
     "installCommand": "pnpm install --frozen-lockfile",
     "buildCommand": "pnpm --dir ../.. build:shared && pnpm build"
   }
   ```
2. Create `apps/admin/vercel.json`:
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "framework": "vite",
     "installCommand": "pnpm install --frozen-lockfile",
     "buildCommand": "pnpm --dir ../.. build:shared && pnpm build",
     "outputDirectory": "dist",
     "rewrites": [
       {
         "source": "/((?!assets/|images/|favicon\\.svg|robots\\.txt).*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
3. Export `CLIENT_CATALOG_TIMEOUT_MS = 20_000` in `apps/web/src/components/storefront/StorefrontClientShell.tsx` and pass it as the 3rd argument (`fetchCatalog(resolvedApiBaseUrl, fetch, CLIENT_CATALOG_TIMEOUT_MS)`) in both `refreshCatalog` and the initial mount effect.

- [ ] **Step 4: Run full monorepo verification (`build`, `typecheck`, `lint`, `test`)**

Run: `pnpm --reporter=append-only build && pnpm --reporter=append-only typecheck && pnpm --reporter=append-only lint && pnpm --reporter=append-only test`
Expected: PASS across all 4 packages.

- [ ] **Step 5: Commit**

```bash
git add apps/web/vercel.json apps/admin/vercel.json apps/web/src apps/admin/src
git commit -m "feat(web,admin): add Vercel monorepo configs, Admin SPA rewrite, and cold-start client timeout"
```

---

### Task 3: GitHub Repository (`LuongCaoChanHuyIT/omsua`) & Live Render Backend Deployment (`https://dashboard.render.com/`)

**Files:**
- Modify: Git branch `main` + remote `origin` (`https://github.com/LuongCaoChanHuyIT/omsua.git`)

**Interfaces:**
- Consumes: `render.yaml`, `.node-version`, and authenticated `gh` CLI (`LuongCaoChanHuyIT`)
- Produces:
  - Live Render Backend URL `RENDER_API_BASE_URL = https://<service>.onrender.com/api` serving `200 OK` on `/api/health`, `/api/catalog`, `/api/branches`, and `/api/docs`

- [ ] **Step 1: Sync local `main` with verified release branch and push to GitHub (`LuongCaoChanHuyIT/omsua`)**

1. Confirm with user if needed or fast-forward/merge `feat/omsua-storefront-ordering` into `main` so `main` carries the complete verified codebase + `render.yaml` + `vercel.json` files.
2. Create public/private GitHub repository `LuongCaoChanHuyIT/omsua` (if not already created) via `gh repo create LuongCaoChanHuyIT/omsua --public --source=. --remote=origin --push` and push `main`.

- [ ] **Step 2: Provision & deploy `omsua-backend` on Render (`https://dashboard.render.com/`)**

1. Navigate via `browser` subagent to `https://dashboard.render.com/blueprint/new?repo=https://github.com/LuongCaoChanHuyIT/omsua` (if Render requests authentication in Chrome, pause and let the user sign in directly in the open tab, then resume the same `browser` subagent).
2. Apply Blueprint `omsua-backend` (`singapore`, `free` tier), wait for Render build & deploy status `Live`, and capture the canonical `https://<omsua-backend>.onrender.com` URL.

- [ ] **Step 3: Verify live Render REST endpoints & Swagger Docs**

Run:
```bash
curl -fsSL "https://<omsua-backend>.onrender.com/api/health"
curl -fsSL "https://<omsua-backend>.onrender.com/api/catalog" | head -c 400
```
Expected: HTTP `200` JSON with `"service":"omsua-backend"` and seeded 30 products / 8 toppings.

---

### Task 4: Dual Vercel Production Deployments (`omsua-web` & `omsua-admin` on `luong-cao-chan-huys-projects`) & End-to-End Live Smoke Verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: `RENDER_API_BASE_URL` from Task 3, `apps/web/vercel.json` & `apps/admin/vercel.json` from Task 2, authenticated Vercel account (`luong-cao-chan-huys-projects`)
- Produces:
  - Live Storefront Production URL (`https://omsua-web.vercel.app` or assigned domain under `luong-cao-chan-huys-projects`)
  - Live Admin Production URL (`https://omsua-admin.vercel.app` or assigned domain under `luong-cao-chan-huys-projects`)
  - Locked-down `CORS_ORIGINS` on Render matching exact production domains + `https://omsua-web*.vercel.app,https://omsua-admin*.vercel.app`

- [ ] **Step 1: Provision & deploy `omsua-web` (`apps/web`) to Vercel (`luong-cao-chan-huys-projects`)**

1. Verify Vercel authentication (`vercel-plugin` MCP or `npx vercel whoami --scope luong-cao-chan-huys-projects`).
2. Create/link Vercel project `omsua-web` under team `luong-cao-chan-huys-projects` connected to `LuongCaoChanHuyIT/omsua` with `Root Directory = apps/web`, set `NEXT_PUBLIC_API_URL` and `API_URL` (`production` & `preview`) to `https://<omsua-backend>.onrender.com/api`, and deploy to Production (`--prod`).

- [ ] **Step 2: Provision & deploy `omsua-admin` (`apps/admin`) to Vercel (`luong-cao-chan-huys-projects`)**

1. Create/link Vercel project `omsua-admin` under team `luong-cao-chan-huys-projects` connected to `LuongCaoChanHuyIT/omsua` with `Root Directory = apps/admin`, set `VITE_API_URL` (`production` & `preview`) to `https://<omsua-backend>.onrender.com/api`, and deploy to Production (`--prod`).

- [ ] **Step 3: Sync exact Vercel production domains into Render `CORS_ORIGINS` & run live E2E verification**

1. Confirm Render `CORS_ORIGINS` includes the exact deployed `omsua-web` and `omsua-admin` URLs alongside `https://omsua-web*.vercel.app,https://omsua-admin*.vercel.app`.
2. Run live smoke verification (`curl -I` CORS preflight + `browser` subagent / Playwright check against the live Vercel URLs):
   - Storefront loads with `0` console errors, all `.webp` photos `200 OK`, places a real test order `OM-...` against Render SQLite.
   - Admin loads `/`, `/menu` (including direct page refresh verifying SPA rewrite `200 OK`), `/branches`, `/settings` (`● Đã kết nối: omsua-backend`), and sees the newly created order.

- [ ] **Step 4: Document live production URLs & deployment runbook in `README.md` and commit**

```bash
git add README.md
git commit -m "docs(deploy): record live Vercel & Render production URLs and deployment runbook"
git push origin main
```
