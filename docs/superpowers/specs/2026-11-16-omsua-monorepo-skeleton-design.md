# OmSua Base Monorepo Skeleton — Design Specification

**Date:** 2026-11-16  
**Workspace:** `/home/fedora/Documents/OmSua`  
**Status:** Approved

---

## 1. Intent & Why

Establish a clean, lightweight, production-ready monorepo skeleton for **OmSua** comprising three applications—`backend` (NestJS), `web` (Next.js), and `admin` (React + Vite)—alongside a shared TypeScript package (`packages/shared`).

The goal is to get the foundational repository layout, workspace tooling, environment configuration, TypeScript sharing, and cross-app API connectivity working out of the box first, before introducing domain-specific business modules, authentication, or database lock-in.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Unified `pnpm` Monorepo:** Manage all packages from root (`pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`) plus per-app dev scripts (`pnpm dev:backend`, `pnpm dev:web`, `pnpm dev:admin`).
- **Shared TypeScript Package (`@omsua/shared`):** Share API contracts, DTO interfaces, and constants seamlessly across NestJS (CommonJS), Next.js (ESM/Bundler), and Vite (ESM).
- **`apps/backend` (`@omsua/backend` — NestJS):**
  - Runs on port `4000` with global prefix `/api`.
  - Environment config via `@nestjs/config` (`.env` + `.env.example`).
  - CORS configured for `web` (`http://localhost:3000`) and `admin` (`http://localhost:3001`) via env variable `CORS_ORIGINS`.
  - Global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
  - Swagger OpenAPI docs served at `/api/docs`.
  - `/api/health` endpoint returning a typed `ApiResponse<HealthStatus>` imported from `@omsua/shared`.
- **`apps/web` (`@omsua/web` — Next.js):**
  - Next.js App Router + TypeScript + Tailwind CSS running on port `3000`.
  - Typed API helper reading `NEXT_PUBLIC_API_URL` (`http://localhost:4000/api`).
  - Minimal starter home page displaying project overview and live `/api/health` connection status from `backend` (gracefully handling offline backend state during static/SSR or client fetch).
- **`apps/admin` (`@omsua/admin` — React + Vite):**
  - Vite + React + TypeScript + Tailwind CSS + `react-router-dom` running on port `3001`.
  - Typed API helper reading `VITE_API_URL` (`http://localhost:4000/api`).
  - Minimal admin shell layout (sidebar navigation, header bar, `/` Dashboard page showing live `/api/health` status from `backend`, and `/settings` placeholder route).
- **Developer Experience:** Root `.gitignore`, per-app `.env.example` (committed) + pre-created local `.env` (gitignored) so `pnpm dev` runs immediately after install without extra setup steps, and a clear root `README.md`.

### Non-Goals
- Business/domain modules (products, categories, orders, customers, etc.).
- Database & ORM integration (PostgreSQL/MySQL, Prisma/TypeORM) — deferred intentionally so the skeleton starts with zero external daemon dependencies on a machine without Docker.
- Authentication, sessions, or RBAC.
- Turborepo, Dockerfiles, or CI/CD workflows.

### Anti-Goals
- **Boilerplate bloat:** Do not add fake CRUD entities, mock databases, or heavy UI component libraries that must be ripped out before real development begins.
- **Fragile workspace imports:** Importing `@omsua/shared` must not break `node dist/main` in NestJS, `next build` in Next.js, or `vite build` in Admin.
- **Hardcoded ports/URLs:** Ports and API base URLs must come from environment configuration with sensible fallbacks, never scattered across UI components.

---

## 3. Environment & Constraints

- **OS:** Linux
- **Node.js:** `v22.23.4`
- **Package Manager:** `pnpm` `12.18.0` (note: pnpm v10+ blocks lifecycle build scripts of dependencies by default unless configured via `pnpm.onlyBuiltDependencies` in root `package.json` — configure this explicitly so native/core packages like `@nestjs/core`, `esbuild`, `swc` build cleanly without interactive prompts).
- **Git:** `2.56.1` (repository to be initialized at `/home/fedora/Documents/OmSua`).
- **Docker:** Not installed; everything must run natively on the host with zero external services.
- **Port Allocation:**
  - `apps/web`: `3000`
  - `apps/admin`: `3001`
  - `apps/backend`: `4000` (API at `http://localhost:4000/api`, Swagger at `http://localhost:4000/api/docs`)

---

## 4. Approaches Considered

### Approach 1: `pnpm workspaces` Monorepo *(Selected)*
Organize `apps/backend`, `apps/web`, `apps/admin`, and `packages/shared` under a single `pnpm-workspace.yaml` and root `package.json`.
- **Pros:** Uses `pnpm` v12 already installed on the host; single dependency installation; single `pnpm dev` command to run the whole stack; native workspace linking (`workspace:*`) for `@omsua/shared` types across all 3 apps.
- **Trade-offs:** Apps share root workspace configuration rather than living in completely isolated trees.

### Approach 2: Three Standalone Folders (`backend/`, `web/`, `admin/`)
Three independent projects in subdirectories, each with its own lockfile and `node_modules`.
- **Pros:** Zero coupling; trivial to split into separate git repositories.
- **Trade-offs:** Triples install/script management overhead and prevents sharing TypeScript contracts directly between backend and frontends.

### Approach 3: Turborepo + `pnpm workspaces`
Same layout as Approach 1 plus `turbo.json` for task graph orchestration and caching.
- **Pros:** Faster cached builds as package count grows.
- **Trade-offs:** Extra configuration layer not needed for a 4-package base skeleton (`pnpm` filtering and parallel execution cover current needs, and Turborepo can be layered on later without restructuring).

---

## 5. Architecture & Decisions

### Agreed with User
- **Repository structure:** `pnpm workspaces` monorepo (`apps/backend`, `apps/web`, `apps/admin`, `packages/shared`).
- **Scope:** Base skeleton first.
- **Language:** TypeScript across all apps and packages.
- **Backend:** NestJS on port `4000`, `.env` support, CORS for `web` & `admin`, global `ValidationPipe`, Swagger at `/api/docs`, sample `/api/health` endpoint, no DB attached yet.
- **Web:** Next.js (App Router) + Tailwind CSS on port `3000` with sample fetch to `backend`.
- **Admin:** React + Vite + React Router + Tailwind CSS on port `3001` with basic admin layout and sample fetch to `backend`.

### Proposed Defaults *(Builder Calls)*
1. **Package Scope & Naming:** `@omsua/shared`, `@omsua/backend`, `@omsua/web`, `@omsua/admin`.
2. **Directory Layout:**
   ```text
   OmSua/
   ├── apps/
   │   ├── backend/          # @omsua/backend (NestJS, port 4000)
   │   ├── web/              # @omsua/web (Next.js App Router, port 3000)
   │   └── admin/            # @omsua/admin (React + Vite, port 3001)
   ├── packages/
   │   └── shared/           # @omsua/shared (Shared TS types & constants)
   ├── docs/
   │   └── superpowers/specs/
   ├── .gitignore
   ├── package.json
   ├── pnpm-workspace.yaml
   ├── tsconfig.base.json
   └── README.md
   ```
3. **`@omsua/shared` Packaging Strategy:** Build `@omsua/shared` with `tsup` outputting dual CJS (`dist/index.cjs`), ESM (`dist/index.js`), and TypeScript declarations (`dist/index.d.ts` / `.d.cts`) via `exports` map in `packages/shared/package.json`. Root `dev` and `build` scripts ensure `@omsua/shared` builds first (`pnpm --filter @omsua/shared build`) before launching or building apps (and watches in `dev`), guaranteeing zero CommonJS/ESM friction across NestJS, Next.js, and Vite.
4. **Shared Contracts (`@omsua/shared`):**
   - `ApiResponse<T>`: `{ success: boolean; data: T; timestamp: string }`
   - `HealthStatus`: `{ status: 'ok'; service: string; version: string; uptime: number; environment: string }`
   - `DEFAULT_PORTS`: `{ WEB: 3000, ADMIN: 3001, BACKEND: 4000 }`
5. **Root Scripts (`package.json`):**
   - `pnpm dev`: Builds `@omsua/shared` once, then runs `@omsua/shared` (watch), `@omsua/backend`, `@omsua/web`, and `@omsua/admin` concurrently via `pnpm --parallel --stream`.
   - `pnpm dev:backend`, `pnpm dev:web`, `pnpm dev:admin`: Run individual apps (after ensuring `@omsua/shared` is built).
   - `pnpm build`: Builds `@omsua/shared` first, then builds `backend`, `web`, and `admin`.
   - `pnpm typecheck`: Runs `tsc --noEmit` across all packages.
   - `pnpm lint`: Runs ESLint across all packages.
   - `pnpm test`: Runs test suites across packages (`jest` in backend, smoke tests where configured).
6. **Web Connectivity Pattern (`apps/web`):** Include a clean client status component (or server fetch with `cache: 'no-store'` + error boundary fallback) on the starter page so `next build` succeeds even when `backend` is not running at build time, while showing live status when `pnpm dev` runs.

---

## 6. Left to the Builder

- Internal folder structure inside `apps/backend/src` (e.g., `health/` module, `config/`, `main.ts`), `apps/web/src` (`app/`, `components/`, `lib/api.ts`), and `apps/admin/src` (`layouts/AdminLayout.tsx`, `pages/DashboardPage.tsx`, `pages/SettingsPage.tsx`, `lib/api.ts`).
- Specific major versions of NestJS, Next.js, React, Vite, and Tailwind CSS (use current stable releases compatible with Node 22).
- Clean, minimal Tailwind styling for the `web` landing skeleton and `admin` dashboard shell.
- Unit/smoke tests verifying `@omsua/shared` exports and `/api/health` controller response.

