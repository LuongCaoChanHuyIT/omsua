# OmSua Monorepo

Base monorepo skeleton for **OmSua** built with `pnpm workspaces`, TypeScript, NestJS, Next.js, and React + Vite.

## Architecture

| Workspace Package | Path | Stack | Default Port / URL |
|---|---|---|---|
| `@omsua/shared` | `packages/shared` | TypeScript + `tsup` (dual CJS/ESM) | Library |
| `@omsua/backend` | `apps/backend` | NestJS + Swagger + ValidationPipe | `http://localhost:4000/api` (`Swagger`: `/api/docs`) |
| `@omsua/web` | `apps/web` | Next.js (App Router) + Tailwind CSS | `http://localhost:3000` |
| `@omsua/admin` | `apps/admin` | React + Vite + React Router + Tailwind CSS | `http://localhost:3001` |

## Prerequisites

- **Node.js** `>= 22.0.0`
- **pnpm** `>= 10.0.0` (tested with `pnpm 12.18.0`)

## Quick Start

```bash
# 1. Install dependencies across all workspace packages
pnpm install

# 2. Copy environment files if starting from a fresh clone
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env

# 3. Start shared watcher + backend + web + admin concurrently
pnpm dev
```

## Workspace Commands

| Command | Description |
|---|---|
| `pnpm dev` | Build `@omsua/shared`, then run `shared` (watch), `backend`, `web`, and `admin` in parallel |
| `pnpm dev:backend` | Run only NestJS backend (`:4000`) |
| `pnpm dev:web` | Run only Next.js web storefront (`:3000`) |
| `pnpm dev:admin` | Run only React + Vite admin dashboard (`:3001`) |
| `pnpm build` | Build `@omsua/shared` followed by all applications |
| `pnpm typecheck` | Run TypeScript typechecking across all packages |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm test` | Run unit and e2e test suites across all packages |
