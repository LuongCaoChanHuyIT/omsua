# Ốm Sữa Storefront, Ordering API & Admin Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete **Ốm Sữa** Đà Lạt milk tea & snack ordering system from the approved Figma design across `@omsua/shared`, `@omsua/backend` (NestJS + SQLite), `@omsua/web` (Next.js 15 Storefront, Drink/Snack Customizer, Cart & Checkout), and `@omsua/admin` (Order Operations & Menu Availability Portal).

**Architecture:** `@omsua/shared` owns the canonical brand tokens, 30-product + 8-topping + 4-branch seed catalog, domain types, and pure VND pricing/validation functions. `@omsua/backend` persists products, toppings, branches, and customer orders in Node 22 built-in `node:sqlite` (`data/omsua.sqlite` in dev, `:memory:` in tests) and calculates order totals authoritatively on the server. `@omsua/web` renders the Figma storefront in the warm `#EEEADF` / `#29261D` / `#D96B1E` botanical palette with interactive customization & checkout modals, while `@omsua/admin` manages live incoming orders and menu item availability.

**Tech Stack:** Node.js v22 (`node:sqlite`), pnpm v12, TypeScript 5, NestJS 11 (`class-validator`, `@nestjs/swagger`, Jest, Supertest), Next.js 15 App Router (`next/font/google`, React 19, Tailwind CSS v4, Vitest, Testing Library), React 19 + Vite 6 (`react-router-dom` v7, Tailwind CSS v4, Vitest, Testing Library).

**Spec:** `docs/superpowers/specs/2026-11-18-omsua-storefront-ordering-design.md` (with Figma visual targets in `docs/superpowers/specs/assets/figma-01-storefront-landing.jpg`, `figma-02-customizer-and-cart.jpg`, `figma-03-brand-style-guide.jpg`)

## Global Constraints

- Base branch context: branch off current `feat/monorepo-skeleton` (`2fc17e9`, or `main` after merging `feat/monorepo-skeleton`) where `@omsua/shared`, `@omsua/backend`, `@omsua/web`, and `@omsua/admin` are already scaffolded.
- Zero external daemon requirement: no Docker, PostgreSQL, or Redis; use Node 22 built-in `node:sqlite` (`DatabaseSync`) with `SQLITE_PATH` defaulting to `apps/backend/data/omsua.sqlite` (gitignored) and `:memory:` in all automated tests.
- Strict color rule from Figma Style Guide: use the 14 warm cream/espresso/botanical tokens (`#EEEADF`, `#F7F4EC`, `#F4E3AD`, `#C7CBBD`, `#B6A152`, `#C8BA9B`, `#29261D`, `#594C00`, `#6B6255`, `#A67C2E`, `#D96B1E`, `#E07D77`, `#7A8B3B`); never use pure `#FFFFFF` or `#000000` on Storefront UI surfaces.
- Typography rule: load all 5 Vietnamese Google Fonts (`Fraunces`, `Lora`, `Be Vietnam Pro`, `Dancing Script`, `Shantell Sans`) via `next/font/google`.
- Authoritative pricing: clients send only IDs, sizes, customization codes, and quantities on `POST /api/orders`; the server computes all unit prices, subtotals, and grand totals from SQLite catalog records.
- Keep existing `/api/health` contract and tests passing alongside all new endpoints.

## Review Focus

1. **Client price tampering or invalid size/topping combinations on `POST /api/orders`:** Requesting an unavailable size (e.g. `Size M` on `Size L`-only `quyt-nhai-cat-tuong`), attaching drink toppings to a `snack` item (`banh-trang-tron-top-mo`), or passing `quantity <= 0` must fail with `400 Bad Request`, and server totals must come exclusively from DB prices via `resolveOrderLine`.
2. **Cart duplicate fragmentation when toppings are clicked in different orders:** Adding `tra-sua-atiso` (`M`, `70%` sugar, `70%` ice) with `['khuc-bach', 'tran-chau-den']` and again with `['tran-chau-den', 'khuc-bach']` must canonicalize & sort `toppingIds` so both merge into a single cart line (`quantity: 2`), whereas differing sugar/ice/size/spice keeps separate lines.
3. **Corrupted `localStorage` cart JSON or Next.js SSR hydration mismatch:** Reading `omsua.cart.v1` from `localStorage` must occur after mount inside `try/catch` with structural validation so invalid JSON or stale shapes reset cleanly without crashing hydration.
4. **Ordering an item marked "Tạm hết" (`isAvailable: false`) by Admin:** Toggling `PATCH /api/catalog/products/:id/availability` to `false` must disable ordering on the Storefront AND cause `POST /api/orders` to reject stale cart submissions containing that product with `400 Bad Request`.
5. **Offline backend during `next build` static generation:** `fetchCatalog()` and `fetchBranches()` in `apps/web` must fall back cleanly to `getDefaultCatalog()` and `OMSUA_BRANCHES` from `@omsua/shared` when `backend` is unreachable so `pnpm build` always succeeds with a complete pre-rendered menu.

---

## Planned File Structure

```text
OmSua/
├── .gitignore                                        # Ignore apps/backend/data/*.sqlite*
├── packages/shared/src/
│   ├── brand.ts                                      # OMSUA_COLORS (14 Figma hex tokens)
│   ├── domain.ts                                     # Product, Topping, Branch, Order & DTO contracts
│   ├── seed-data.ts                                  # 4 categories, 24 drinks, 8 toppings, 6 snacks, 4 branches
│   ├── pricing.ts                                    # resolveOrderLine, calculateOrderTotals, formatVnd, canonicalizeCartItemKey
│   ├── pricing.test.ts                               # Unit tests for pricing, validation, formatting & seed integrity
│   └── index.ts                                      # Re-exports existing + new domain/brand/seed/pricing modules
├── apps/backend/
│   ├── src/
│   │   ├── app.module.ts                             # Registers DatabaseModule, CatalogModule, OrdersModule, HealthModule
│   │   ├── database/
│   │   │   ├── database.module.ts                    # Global SQLite provider
│   │   │   └── database.service.ts                   # Schema DDL + idempotent seed from @omsua/shared
│   │   ├── catalog/
│   │   │   ├── dto/update-availability.dto.ts        # { isAvailable: boolean }
│   │   │   ├── catalog.service.ts                    # getCatalog(), getBranches(), setProductAvailability()
│   │   │   ├── catalog.controller.ts                 # GET /api/catalog, GET /api/branches, PATCH /api/catalog/products/:id/availability
│   │   │   ├── catalog.module.ts
│   │   │   └── catalog.service.spec.ts
│   │   └── orders/
│   │       ├── dto/create-order.dto.ts               # Validated customer info, branchId, paymentMethod, items[]
│   │       ├── dto/orders-query.dto.ts               # Optional status & branchId filters
│   │       ├── dto/update-order-status.dto.ts        # Validated OrderStatus transition
│   │       ├── orders.service.ts                     # Transactional order creation, listing & status updates
│   │       ├── orders.controller.ts                  # POST /api/orders, GET /api/orders, PATCH /api/orders/:id/status
│   │       ├── orders.module.ts
│   │       └── orders.service.spec.ts
│   └── test/
│       └── orders-catalog.e2e-spec.ts                # End-to-end tests for catalog, availability toggle, order creation & admin updates
├── apps/web/
│   ├── package.json                                  # Adds @testing-library/react, @testing-library/jest-dom, jsdom for UI modal tests
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css                           # 14 Figma color tokens & font utility classes
│   │   │   ├── layout.tsx                            # Loads Fraunces, Lora, Be Vietnam Pro, Dancing Script, Shantell Sans
│   │   │   └── page.tsx                              # Server entry fetching live catalog/branches with shared seed fallback
│   │   ├── lib/
│   │   │   ├── api.ts                                # fetchCatalog, fetchBranches, submitOrder (+ existing fetchBackendHealth)
│   │   │   └── api.test.ts                           # Tests online + offline seed fallback + submitOrder error handling
│   │   ├── store/
│   │   │   ├── cart-store.tsx                        # CartProvider, useCart(), canonical merging & safe localStorage sync
│   │   │   └── cart-store.test.tsx                   # Tests merging, separate options, quantity updates & corrupted localStorage recovery
│   │   └── components/
│   │       ├── artwork/
│   │       │   └── OmSuaArtwork.tsx                  # Vector Logo Ốm Sữa, Bé Búp Atiso mascot & categorized drink/snack/topping SVGs
│   │       ├── storefront/
│   │       │   ├── StorefrontClientShell.tsx         # Coordinates active category, spice filter, customizer modal & cart drawer
│   │       │   ├── StorefrontHeader.tsx              # Sticky nav, branch pill & live cart badge
│   │       │   ├── HeroSpotlight.tsx                 # Editorial hero, mascot quote & #29261D spotlight cards
│   │       │   ├── DrinkMenuSection.tsx              # Filter chips + 4 color-coded drink category sections (24 items)
│   │       │   ├── ToppingStripSection.tsx           # 8 homemade toppings strip + sugar/ice note
│   │       │   ├── SnackMenuSection.tsx              # Shantell Sans snack header, spice pills & 6 Đà Lạt snacks
│   │       │   └── BrandFooter.tsx                   # #29261D quote, 4 branch cards & QR follow block
│   │       └── modals/
│   │           ├── ProductCustomizerModal.tsx        # Figma Sheet 02 "Tùy chỉnh ly của bạn" (drink & snack modes)
│   │           ├── CartCheckoutDrawer.tsx            # Figma Sheet 02 "Giỏ hàng của bạn" + COD/QR checkout + order receipt
│   │           └── ordering-flow.test.tsx            # Interactive tests for customizer price formula & checkout submission
└── apps/admin/
    └── src/
        ├── index.css                                 # Matching warm Ốm Sữa palette tokens
        ├── lib/
        │   ├── api.ts                                # fetchOrders, updateOrderStatus, fetchCatalog, toggleProductAvailability, fetchBranches
        │   └── api.test.ts                           # Admin API client tests
        ├── layouts/
        │   └── AdminLayout.tsx                       # Warm espresso sidebar (Đơn hàng, Thực đơn, Chi nhánh, Cài đặt)
        ├── pages/
        │   ├── OrdersPage.tsx                        # Live order queue, branch/status filter & status transition actions
        │   ├── MenuPage.tsx                          # 30 products grouped list with instant Còn món / Tạm hết toggle
        │   ├── BranchesPage.tsx                      # 4 Đà Lạt / Đức Trọng branches + order statistics
        │   └── SettingsPage.tsx                      # Environment & backend health status
        ├── App.tsx                                   # Routes /, /menu, /branches, /settings, *
        └── App.test.tsx                              # Tests order status update, menu availability toggle & 404 route
```

---

### Task 1: `@omsua/shared` Brand Tokens, Seed Catalog & Pricing Engine

**Files:**
- Create: `packages/shared/src/brand.ts`
- Create: `packages/shared/src/domain.ts`
- Create: `packages/shared/src/seed-data.ts`
- Create: `packages/shared/src/pricing.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `packages/shared/src/pricing.test.ts`

**Interfaces:**
- Consumes: existing `@omsua/shared` exports
- Produces (`@omsua/shared`):
  - `OMSUA_COLORS` (14 hex constants matching Spec Section 2.1)
  - Domain interfaces: `DrinkCategoryId`, `ProductKind`, `ProductSizeCode`, `SugarLevel`, `IceLevel`, `SpiceLevel`, `PaymentMethod`, `OrderStatus`, `CategoryInfo`, `ProductSizeOption`, `ProductItem`, `ToppingItem`, `BranchInfo`, `CatalogPayload`, `OrderItemInput`, `OrderLineResolved`, `CreateOrderPayload`, `OrderRecord`
  - Seed constants & helper: `OMSUA_CATEGORIES` (4), `OMSUA_PRODUCTS` (24 drinks + 6 snacks), `OMSUA_TOPPINGS` (8), `OMSUA_BRANCHES` (4), `getDefaultCatalog(): CatalogPayload`
  - Pricing & validation functions:
    - `class OrderValidationError extends Error`
    - `formatVnd(amount: number): string` (`45000 -> '45.000đ'`)
    - `formatShortPrice(amount: number): string` (`45000 -> '45k'`)
    - `canonicalizeCartItemKey(item: OrderItemInput): string`
    - `resolveOrderLine(input: OrderItemInput, productsById: ReadonlyMap<string, ProductItem>, toppingsById: ReadonlyMap<string, ToppingItem>): OrderLineResolved`
    - `calculateOrderTotals(lines: readonly OrderLineResolved[]): { subtotal: number; shippingFee: 0; ecoFee: 0; grandTotal: number; totalItems: number }`
    - `formatCustomizerBreakdown(line: OrderLineResolved): string`

- [ ] **Step 1: Write the failing tests in `packages/shared/src/pricing.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import {
  OMSUA_BRANCHES,
  OMSUA_COLORS,
  OMSUA_PRODUCTS,
  OMSUA_TOPPINGS,
  OrderValidationError,
  calculateOrderTotals,
  canonicalizeCartItemKey,
  formatCustomizerBreakdown,
  formatVnd,
  getDefaultCatalog,
  resolveOrderLine,
} from './index';

describe('@omsua/shared domain catalog & pricing engine', () => {
  const catalog = getDefaultCatalog();
  const productsById = new Map(catalog.products.map((p) => [p.id, p]));
  const toppingsById = new Map(catalog.toppings.map((t) => [t.id, t]));

  it('contains exact Figma counts: 4 categories, 24 drinks, 6 snacks, 8 toppings, 4 branches, and 14 non-pure-BW colors', () => {
    expect(catalog.categories).toHaveLength(4);
    expect(OMSUA_PRODUCTS.filter((p) => p.kind === 'drink')).toHaveLength(24);
    expect(OMSUA_PRODUCTS.filter((p) => p.kind === 'snack')).toHaveLength(6);
    expect(OMSUA_TOPPINGS).toHaveLength(8);
    expect(OMSUA_BRANCHES).toHaveLength(4);
    const hexes = Object.values(OMSUA_COLORS).map((h) => h.toUpperCase());
    expect(hexes).toHaveLength(14);
    expect(hexes).not.toContain('#FFFFFF');
    expect(hexes).not.toContain('#000000');
  });

  it('resolves Figma Sheet 02 Trà Sữa Atiso example (Size M 45k + Trân châu đen 10k + Khúc bạch 10k = 65.000đ)', () => {
    const line = resolveOrderLine(
      {
        productId: 'tra-sua-atiso',
        quantity: 1,
        size: 'M',
        sugarLevel: '70',
        iceLevel: '70',
        toppingIds: ['khuc-bach', 'tran-chau-den'],
      },
      productsById,
      toppingsById,
    );
    expect(line.unitPrice).toBe(65000);
    expect(line.lineTotal).toBe(65000);
    expect(formatVnd(line.lineTotal)).toBe('65.000đ');
    expect(formatCustomizerBreakdown(line)).toBe(
      '45k (Size M) + 10k (Khúc bạch) + 10k (Trân châu đen) = 65.000đ',
    );
  });

  it('computes Figma Sheet 02 2-item cart total (Trà Sữa Atiso 55k + Bánh Tráng Trộn Tóp Mỡ 40k = 95.000đ)', () => {
    const drink = resolveOrderLine(
      {
        productId: 'tra-sua-atiso',
        quantity: 1,
        size: 'M',
        sugarLevel: '70',
        iceLevel: '70',
        toppingIds: ['tran-chau-den'],
      },
      productsById,
      toppingsById,
    );
    const snack = resolveOrderLine(
      {
        productId: 'banh-trang-tron-top-mo',
        quantity: 1,
        size: 'STD',
        spiceLevel: 'cay-vua',
      },
      productsById,
      toppingsById,
    );
    expect(calculateOrderTotals([drink, snack])).toEqual({
      subtotal: 95000,
      shippingFee: 0,
      ecoFee: 0,
      grandTotal: 95000,
      totalItems: 2,
    });
  });

  it('produces identical canonical keys regardless of topping selection order', () => {
    const keyA = canonicalizeCartItemKey({
      productId: 'tra-sua-atiso',
      quantity: 1,
      size: 'M',
      sugarLevel: '70',
      iceLevel: '70',
      toppingIds: ['khuc-bach', 'tran-chau-den'],
    });
    const keyB = canonicalizeCartItemKey({
      productId: 'tra-sua-atiso',
      quantity: 3,
      size: 'M',
      sugarLevel: '70',
      iceLevel: '70',
      toppingIds: ['tran-chau-den', 'khuc-bach'],
    });
    expect(keyA).toBe(keyB);
  });

  it('rejects unavailable items, invalid drink sizes, and toppings on snacks', () => {
    expect(() =>
      resolveOrderLine(
        {
          productId: 'quyt-nhai-cat-tuong',
          quantity: 1,
          size: 'M',
          sugarLevel: '70',
          iceLevel: '70',
        },
        productsById,
        toppingsById,
      ),
    ).toThrow(OrderValidationError);

    expect(() =>
      resolveOrderLine(
        {
          productId: 'banh-trang-tron-top-mo',
          quantity: 1,
          size: 'STD',
          spiceLevel: 'cay-vua',
          toppingIds: ['tran-chau-den'],
        },
        productsById,
        toppingsById,
      ),
    ).toThrow(OrderValidationError);

    const soldOutMap = new Map(productsById);
    soldOutMap.set('tra-sua-atiso', {
      ...productsById.get('tra-sua-atiso')!,
      isAvailable: false,
    });
    expect(() =>
      resolveOrderLine(
        {
          productId: 'tra-sua-atiso',
          quantity: 1,
          size: 'M',
          sugarLevel: '70',
          iceLevel: '70',
        },
        soldOutMap,
        toppingsById,
      ),
    ).toThrow(OrderValidationError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @omsua/shared test`
Expected: FAIL (`OMSUA_COLORS` / `getDefaultCatalog` / `resolveOrderLine` not exported from `./index`)

- [ ] **Step 3: Implement `brand.ts`, `domain.ts`, `seed-data.ts`, `pricing.ts`, and barrel exports in `index.ts`**

Populate all 24 drinks, 8 toppings (`shortName` e.g. `'Trân châu đen'`, `'Khúc bạch'`), 6 snacks, and 4 branches verbatim from Spec Section 3. Sort deduplicated `toppingIds` alphabetically inside `canonicalizeCartItemKey` and `resolveOrderLine` so breakdown order and merge keys are deterministic.

- [ ] **Step 4: Build, typecheck, lint, and run tests**

Run: `pnpm --filter @omsua/shared build && pnpm --filter @omsua/shared typecheck && pnpm --filter @omsua/shared lint && pnpm --filter @omsua/shared test`
Expected: PASS (all existing + new shared tests pass)

- [ ] **Step 5: Commit**

```bash
git add packages/shared docs/superpowers/specs/ docs/superpowers/plans/
git commit -m "feat(shared): add Ốm Sữa brand tokens, canonical seed catalog, and pricing engine"
```

---

### Task 2: `@omsua/backend` SQLite Persistence & Catalog/Branches API

**Files:**
- Modify: `.gitignore`
- Modify: `apps/backend/.env.example`
- Create: `apps/backend/src/database/database.service.ts`
- Create: `apps/backend/src/database/database.module.ts`
- Create: `apps/backend/src/catalog/dto/update-availability.dto.ts`
- Create: `apps/backend/src/catalog/catalog.service.ts`
- Create: `apps/backend/src/catalog/catalog.controller.ts`
- Create: `apps/backend/src/catalog/catalog.module.ts`
- Modify: `apps/backend/src/app.module.ts`
- Test: `apps/backend/src/catalog/catalog.service.spec.ts`

**Interfaces:**
- Consumes (`@omsua/shared`): `OMSUA_CATEGORIES`, `OMSUA_PRODUCTS`, `OMSUA_TOPPINGS`, `OMSUA_BRANCHES`, `CatalogPayload`, `ProductItem`, `BranchInfo`, `ApiResponse`, `createApiResponse`
- Produces:
  - `DatabaseService` (`get db(): DatabaseSync`) in `apps/backend/src/database/database.service.ts`
  - `CatalogService.getCatalog(): CatalogPayload`, `getBranches(): BranchInfo[]`, `getProductsMap(): Map<string, ProductItem>`, `getToppingsMap(): Map<string, ToppingItem>`, `setProductAvailability(id: string, isAvailable: boolean): ProductItem`
  - HTTP `GET /api/catalog` -> `200 ApiResponse<CatalogPayload>`
  - HTTP `GET /api/branches` -> `200 ApiResponse<BranchInfo[]>`
  - HTTP `PATCH /api/catalog/products/:id/availability` (`{ isAvailable: boolean }`) -> `200 ApiResponse<ProductItem>` (`404` when product not found)

- [ ] **Step 1: Write failing unit tests in `apps/backend/src/catalog/catalog.service.spec.ts`**

Test with `SQLITE_PATH=':memory:'`:
1. `getCatalog()` returns 4 categories, 30 seeded products (24 drinks + 6 snacks), and 8 toppings.
2. `getBranches()` returns 4 Đà Lạt / Đức Trọng branches starting with `cs1-hoang-dieu`.
3. `setProductAvailability('tra-sua-atiso', false)` persists `isAvailable: false` in SQLite and reflects immediately in subsequent `getCatalog()` calls.
4. `setProductAvailability('unknown-id', false)` throws `NotFoundException`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @omsua/backend test -- catalog.service.spec.ts`
Expected: FAIL (`Cannot find module './catalog.service'`)

- [ ] **Step 3: Implement `DatabaseModule`, `CatalogModule`, `.gitignore`, and `.env.example` updates**

- Add `apps/backend/data/` and `*.sqlite*` to `.gitignore`; add `SQLITE_PATH=data/omsua.sqlite` to `apps/backend/.env.example`.
- Implement `DatabaseService` using `import { DatabaseSync } from 'node:sqlite'`, creating tables `products` (storing `sizes_json`, boolean flags as `0/1` integers), `toppings`, `branches`, `orders`, and `order_items`, and seeding `products`, `toppings`, `branches` idempotently on `onModuleInit()`.
- Implement `CatalogService`, `CatalogController`, `UpdateAvailabilityDto`, and wire `DatabaseModule` (`@Global()`) + `CatalogModule` into `AppModule` (Ensure `test/app.e2e-spec.ts` sets `process.env.SQLITE_PATH = ':memory:'` so existing e2e tests never write disk files).

- [ ] **Step 4: Run backend build, typecheck, lint, and tests**

Run: `pnpm --filter @omsua/backend build && pnpm --filter @omsua/backend typecheck && pnpm --filter @omsua/backend lint && pnpm --filter @omsua/backend test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .gitignore apps/backend
git commit -m "feat(backend): add SQLite persistence and catalog/branches REST endpoints"
```

---

### Task 3: `@omsua/backend` Orders & Admin Order Operations API

**Files:**
- Create: `apps/backend/src/orders/dto/create-order.dto.ts`
- Create: `apps/backend/src/orders/dto/orders-query.dto.ts`
- Create: `apps/backend/src/orders/dto/update-order-status.dto.ts`
- Create: `apps/backend/src/orders/orders.service.ts`
- Create: `apps/backend/src/orders/orders.controller.ts`
- Create: `apps/backend/src/orders/orders.module.ts`
- Modify: `apps/backend/src/app.module.ts`
- Test: `apps/backend/src/orders/orders.service.spec.ts`
- Test: `apps/backend/test/orders-catalog.e2e-spec.ts`

**Interfaces:**
- Consumes: `DatabaseService`, `CatalogService`, and `@omsua/shared` (`resolveOrderLine`, `calculateOrderTotals`, `OrderValidationError`, `CreateOrderPayload`, `OrderRecord`, `OrderStatus`, `createApiResponse`)
- Produces:
  - `POST /api/orders` -> `201 ApiResponse<OrderRecord>` (with `orderCode` matching `/^OM-\d{8}-[A-Z0-9]{4}$/`)
  - `GET /api/orders?status=&branchId=` -> `200 ApiResponse<OrderRecord[]>`
  - `PATCH /api/orders/:id/status` -> `200 ApiResponse<OrderRecord>`

- [ ] **Step 1: Write failing unit & Supertest e2e tests**

Write `apps/backend/src/orders/orders.service.spec.ts` and `apps/backend/test/orders-catalog.e2e-spec.ts` (`SQLITE_PATH=':memory:'`) testing:
1. `POST /api/orders` with `tra-sua-atiso` (`M`, `70` sugar, `70` ice, `['tran-chau-den']`) + `banh-trang-tron-top-mo` (`STD`, `'cay-vua'`) at `cs1-hoang-dieu` returns `201` with `grandTotal: 95000`, `totalItems: 2`, `status: 'pending'`, and `orderCode` matching `/^OM-\d{8}-[A-Z0-9]{4}$/`.
2. Rejects invalid Vietnamese phone numbers (`'12345'`), unknown `branchId`, invalid size (`'M'` on `quyt-nhai-cat-tuong`), toppings on snacks, or client-supplied extra fields (`forbidNonWhitelisted` -> `400`).
3. After `PATCH /api/catalog/products/tra-sua-atiso/availability` sets `{ isAvailable: false }`, `POST /api/orders` containing `tra-sua-atiso` returns `400 Bad Request`.
4. `GET /api/orders?branchId=cs1-hoang-dieu&status=pending` returns the created order; `PATCH /api/orders/:id/status` with `{ status: 'preparing' }` updates and persists status (`404` on unknown order ID).

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/backend test`
Expected: FAIL (missing `orders.service` and `/api/orders` routes)

- [ ] **Step 3: Implement `OrdersModule`, DTOs, transactional `OrdersService`, and `OrdersController`**

Normalize `customerPhone` by stripping spaces/hyphens via `@Transform` before `@Matches(/^0\d{9,10}$/)`. Wrap `INSERT INTO orders` + `INSERT INTO order_items` in `BEGIN IMMEDIATE ... COMMIT` (with `ROLLBACK` on error). Register `OrdersModule` in `AppModule`.

- [ ] **Step 4: Run backend build, typecheck, lint, and all unit + e2e tests**

Run: `pnpm --filter @omsua/backend build && pnpm --filter @omsua/backend typecheck && pnpm --filter @omsua/backend lint && pnpm --filter @omsua/backend test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/backend
git commit -m "feat(backend): add transactional orders API and admin status management"
```

---

### Task 4: `@omsua/web` Brand Theme, Fonts, Vector Artwork & Storefront Landing Page

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/vitest.config.ts`
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/components/artwork/OmSuaArtwork.tsx`
- Create: `apps/web/src/components/storefront/StorefrontHeader.tsx`
- Create: `apps/web/src/components/storefront/HeroSpotlight.tsx`
- Create: `apps/web/src/components/storefront/DrinkMenuSection.tsx`
- Create: `apps/web/src/components/storefront/ToppingStripSection.tsx`
- Create: `apps/web/src/components/storefront/SnackMenuSection.tsx`
- Create: `apps/web/src/components/storefront/BrandFooter.tsx`
- Modify: `apps/web/src/lib/api.test.ts`

**Interfaces:**
- Consumes (`@omsua/shared`): `OMSUA_COLORS`, `OMSUA_BRANCHES`, `getDefaultCatalog`, `CatalogPayload`, `BranchInfo`, `CreateOrderPayload`, `OrderRecord`, `formatVnd`, `formatShortPrice`
- Produces (`apps/web/src/lib/api.ts`):
  - `fetchCatalog(baseUrl?: string, fetchImpl?: typeof fetch): Promise<{ catalog: CatalogPayload; isFallback: boolean }>`
  - `fetchBranches(baseUrl?: string, fetchImpl?: typeof fetch): Promise<{ branches: BranchInfo[]; isFallback: boolean }>`
  - `submitOrder(payload: CreateOrderPayload, baseUrl?: string, fetchImpl?: typeof fetch): Promise<{ ok: true; order: OrderRecord } | { ok: false; error: string }>`
- Produces (`apps/web/src/components/storefront/*`): modular Storefront visual sections matching Figma Sheet 01 & Sheet 03.

- [ ] **Step 1: Add testing dependencies (`@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) to `apps/web` and write failing tests in `apps/web/src/lib/api.test.ts`**

Add tests to `apps/web/src/lib/api.test.ts`:
1. `fetchCatalog` returns live backend catalog on `200 OK` (`isFallback: false`) and falls back to `getDefaultCatalog()` (24 drinks, 6 snacks, 8 toppings, `isFallback: true`) when `fetch` rejects with `ECONNREFUSED`.
2. `fetchBranches` returns `OMSUA_BRANCHES` (4 Đà Lạt/Đức Trọng branches, `isFallback: true`) when offline.
3. `submitOrder` posts JSON to `${normalizedBaseUrl}/orders`, returning `{ ok: true, order }` on `201` and extracting NestJS validation message array/string into `{ ok: false, error }` on `400`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm install && pnpm --filter @omsua/web test`
Expected: FAIL (`fetchCatalog`, `fetchBranches`, `submitOrder` undefined)

- [ ] **Step 3: Implement `api.ts`, Google Fonts & Figma tokens (`layout.tsx`, `globals.css`), `OmSuaArtwork.tsx`, and Storefront presentation sections**

- Configure `Fraunces`, `Lora`, `Be_Vietnam_Pro`, `Dancing_Script`, and `Shantell_Sans` in `apps/web/src/app/layout.tsx` and define Tailwind v4 `@theme` color & font variables in `apps/web/src/app/globals.css` (`#EEEADF` canvas, `#F7F4EC` surface, `#F4E3AD` butter, `#C7CBBD` sage, `#C8BA9B` taupe, `#29261D` espresso, `#594C00` olive, `#D96B1E` terracotta, `#7A8B3B` artichoke, `#E07D77` coral).
- Implement `OmSuaArtwork.tsx` (`OmSuaLogo`, `AtisoMascot`, `ProductIllustration`) and all 6 Storefront sections (`StorefrontHeader`, `HeroSpotlight`, `DrinkMenuSection`, `ToppingStripSection`, `SnackMenuSection`, `BrandFooter`) matching Figma Sheet 01 copy, category filtering (`Tất cả (24)`, `Trà Sữa (6)`, `Giữ Dáng (6)`, `Sữa Tươi & Đá Xay (6)`, `Cà Phê Phin (6)`), and `Tạm hết` disabled button state.

- [ ] **Step 4: Run web tests, typecheck, lint**

Run: `pnpm --filter @omsua/web test && pnpm --filter @omsua/web typecheck && pnpm --filter @omsua/web lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web pnpm-lock.yaml
git commit -m "feat(web): implement Ốm Sữa brand theme, artwork, API client, and storefront sections"
```

---

### Task 5: `@omsua/web` Interactive Customizer Modal, Cart Store & Checkout Flow

**Files:**
- Create: `apps/web/src/store/cart-store.tsx`
- Create: `apps/web/src/components/modals/ProductCustomizerModal.tsx`
- Create: `apps/web/src/components/modals/CartCheckoutDrawer.tsx`
- Create: `apps/web/src/components/storefront/StorefrontClientShell.tsx`
- Modify: `apps/web/src/app/page.tsx`
- Delete: `apps/web/src/components/health-status-card.tsx` (superseded by full Storefront shell)
- Modify: `apps/web/src/lib/web-review.test.ts`
- Test: `apps/web/src/store/cart-store.test.tsx`
- Test: `apps/web/src/components/modals/ordering-flow.test.tsx`

**Interfaces:**
- Consumes: `CatalogPayload`, `BranchInfo`, `OrderItemInput`, `OrderLineResolved`, `resolveOrderLine`, `calculateOrderTotals`, `canonicalizeCartItemKey`, `formatCustomizerBreakdown`, `formatVnd`, `submitOrder`, Storefront components
- Produces:
  - `CartProvider` & `useCart()` in `apps/web/src/store/cart-store.tsx` (`lines`, `totals`, `selectedBranch`, `setSelectedBranchId`, `addItem`, `updateQuantity`, `removeItem`, `clearCart`)
  - `ProductCustomizerModal` (`Tùy chỉnh ly của bạn`) & `CartCheckoutDrawer` (`Giỏ hàng của bạn`) wired into `StorefrontClientShell` and `apps/web/src/app/page.tsx`

- [ ] **Step 1: Write failing tests in `cart-store.test.tsx` and `ordering-flow.test.tsx`**

1. `cart-store.test.tsx` (`// @vitest-environment jsdom`):
   - Merging identical drink customizations regardless of topping click order (`['khuc-bach', 'tran-chau-den']` + `['tran-chau-den', 'khuc-bach']` -> single item with `quantity: 2`, `lineTotal: 130000`), while keeping `50%` sugar as a separate line.
   - Recovering cleanly from corrupted `localStorage.setItem('omsua.cart.v1', '{broken-json')` without throwing and defaulting to `cs1-hoang-dieu`.
2. `ordering-flow.test.tsx` (`// @vitest-environment jsdom`):
   - Opening `ProductCustomizerModal` on `Trà Sữa Atiso`, checking `Trân châu đen nấu mật` (+10k) and `Khúc bạch hạnh nhân` (+10k), verifying live CTA `Thêm vào giỏ • 65.000đ` and breakdown text, clicking add to cart.
   - Opening `CartCheckoutDrawer`, filling customer name (`Nguyễn Lan`), phone (`0945396117`), address (`12 Khu Hòa Bình, Đà Lạt`), selecting `Chuyển khoản QR`, clicking `Xác nhận đặt món`, asserting `submitOrder` receives exact `CreateOrderPayload` and confirmation code `OM-...` is displayed.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/web test`
Expected: FAIL (`Cannot find module './cart-store'` / `./ProductCustomizerModal`)

- [ ] **Step 3: Implement `cart-store.tsx`, `ProductCustomizerModal.tsx`, `CartCheckoutDrawer.tsx`, `StorefrontClientShell.tsx`, and update `page.tsx`**

Wire `page.tsx` to fetch initial catalog & branches (with fallback) and render `<StorefrontClientShell initialCatalog={catalog} initialBranches={branches} apiBaseUrl={apiBaseUrl} />`. Update `web-review.test.ts` if needed so SSR markup assertions remain green alongside the new Storefront page.

- [ ] **Step 4: Run web unit/UI tests, typecheck, lint, and offline `next build`**

Run: `pnpm --filter @omsua/web test && pnpm --filter @omsua/web typecheck && pnpm --filter @omsua/web lint && pnpm --filter @omsua/web build`
Expected: PASS (`next build` succeeds cleanly with backend offline)

- [ ] **Step 5: Commit**

```bash
git add apps/web
git commit -m "feat(web): add interactive drink/snack customizer modal, cart store, and checkout drawer"
```

---

### Task 6: `@omsua/admin` Order Operations & Menu Availability Portal + Full Verification

**Files:**
- Modify: `apps/admin/src/index.css`
- Modify: `apps/admin/src/lib/api.ts`
- Modify: `apps/admin/src/layouts/AdminLayout.tsx`
- Create: `apps/admin/src/pages/OrdersPage.tsx`
- Create: `apps/admin/src/pages/MenuPage.tsx`
- Create: `apps/admin/src/pages/BranchesPage.tsx`
- Delete: `apps/admin/src/pages/DashboardPage.tsx` (replaced by `OrdersPage.tsx` at `/`)
- Modify: `apps/admin/src/pages/SettingsPage.tsx`
- Modify: `apps/admin/src/App.tsx`
- Modify: `apps/admin/src/lib/api.test.ts`
- Modify: `apps/admin/src/App.test.tsx`

**Interfaces:**
- Consumes (`@omsua/shared`): `OrderRecord`, `OrderStatus`, `CatalogPayload`, `ProductItem`, `BranchInfo`, `formatVnd`, `OMSUA_COLORS`
- Consumes (`@omsua/backend` HTTP): `GET /api/orders`, `PATCH /api/orders/:id/status`, `GET /api/catalog`, `PATCH /api/catalog/products/:id/availability`, `GET /api/branches`, `GET /api/health`
- Produces (`apps/admin/src/lib/api.ts`):
  - `fetchOrders(filters?: { status?: OrderStatus; branchId?: string }, baseUrl?: string, fetchImpl?: typeof fetch): Promise<{ ok: true; data: OrderRecord[] } | { ok: false; error: string }>`
  - `updateOrderStatus(orderId: string, status: OrderStatus, baseUrl?: string, fetchImpl?: typeof fetch): Promise<{ ok: true; data: OrderRecord } | { ok: false; error: string }>`
  - `fetchAdminCatalog(baseUrl?: string, fetchImpl?: typeof fetch): Promise<{ ok: true; data: CatalogPayload } | { ok: false; error: string }>`
  - `toggleProductAvailability(productId: string, isAvailable: boolean, baseUrl?: string, fetchImpl?: typeof fetch): Promise<{ ok: true; data: ProductItem } | { ok: false; error: string }>`
  - `fetchAdminBranches(baseUrl?: string, fetchImpl?: typeof fetch): Promise<{ ok: true; data: BranchInfo[] } | { ok: false; error: string }>`

- [ ] **Step 1: Write failing Admin API & UI tests in `apps/admin/src/lib/api.test.ts` and `apps/admin/src/App.test.tsx`**

1. `api.test.ts`: tests `fetchOrders({ status: 'pending', branchId: 'cs1-hoang-dieu' })`, `updateOrderStatus('ord-1', 'preparing')`, and `toggleProductAvailability('tra-sua-atiso', false)`.
2. `App.test.tsx`:
   - Renders `/` (`OrdersPage`) with a mocked `pending` order `OM-20261118-A1B2` (`Trà Sữa Atiso`, `95.000đ`), clicks `Xác nhận pha chế`, and verifies `PATCH /api/orders/ord-1/status` (`{ status: 'preparing' }`) is called and status badge updates to `Đang pha chế`.
   - Renders `/menu` (`MenuPage`) with mocked catalog, clicks `Tạm hết` toggle on `Trà Sữa Atiso`, and verifies `PATCH /api/catalog/products/tra-sua-atiso/availability` (`{ isAvailable: false }`) is called.
   - Renders `/branches` (`BranchesPage`) showing all 4 Đà Lạt / Đức Trọng branches, and keeps unknown route `/unknown-route` 404 test passing.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/admin test`
Expected: FAIL (`fetchOrders` / `/menu` / `/branches` missing)

- [ ] **Step 3: Implement warm Ốm Sữa Admin theme, API helpers, `OrdersPage`, `MenuPage`, `BranchesPage`, and router updates**

Style `AdminLayout` with `#29261D` espresso sidebar, `#EEEADF` canvas, `#F7F4EC` cards, and `#D96B1E` terracotta primary actions. Wire routes `/` (`OrdersPage`), `/menu` (`MenuPage`), `/branches` (`BranchesPage`), `/settings` (`SettingsPage`), and `*` (`NotFoundView`).

- [ ] **Step 4: Run admin tests, typecheck, lint, and production Vite build**

Run: `pnpm --filter @omsua/admin test && pnpm --filter @omsua/admin typecheck && pnpm --filter @omsua/admin lint && pnpm --filter @omsua/admin build`
Expected: PASS

- [ ] **Step 5: Run full monorepo pipeline & live end-to-end order smoke check**

1. Run `pnpm build && pnpm typecheck && pnpm lint && pnpm test` across all 4 packages.
   Expected: PASS (0 errors across `@omsua/shared`, `@omsua/backend`, `@omsua/web`, `@omsua/admin`).
2. Start `pnpm dev` in a self-cleaning Node smoke script: verify `GET :4000/api/catalog` (30 products), `POST :4000/api/orders` (`201`, `grandTotal: 95000`), `GET :4000/api/orders` (returns created order), `GET :3000` (contains `Mộc mạc • Tinh tế` & `Trà Sữa Atiso`), and `GET :3001` (`200 OK`).

- [ ] **Step 6: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): implement Ốm Sữa order operations and menu availability portal"
```
