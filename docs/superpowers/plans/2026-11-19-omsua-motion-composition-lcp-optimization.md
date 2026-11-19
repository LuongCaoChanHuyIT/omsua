# Ốm Sữa Motion, Composition & LCP Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `@omsua/shared`, `@omsua/web`, and `@omsua/admin` with native React `<ViewTransition>` animations, React 19 Compound Components & Explicit Variants, mobile-grade list memoization & hoisted `Intl` formatters, 4-subpart LCP optimizations, and an automated Python Playwright visual/CWV verification suite.

**Architecture:** Extract a pure headless customizer state machine and hoisted `Intl.NumberFormat` into `@omsua/shared`, bridge `React.ViewTransition` / `React.unstable_ViewTransition` across Next.js 15.5 (`experimental.viewTransition`) and Vite 6 with GPU-only CSS recipes, optimize all 4 LCP subparts (`AbortSignal.timeout` SSR fetches, single `fetchPriority="high"` hero image, selective font preloads, post-paint mist canvas), refactor `CartContext` / `ProductCustomizerModal` / `CartCheckoutDrawer` into React 19 `use()` Compound Components with explicit Drink/Snack variants, and verify live LCP & transitions via Python Playwright (`webapp-testing`) + Chrome DevTools traces.

**Tech Stack:** TypeScript 5.7, Next.js 15.5 (App Router, `experimental.viewTransition`), React 19.3 (`use`, `ViewTransition`, `addTransitionType`, `useDeferredValue`, `memo`), Vite 6 + React Router 7, Tailwind CSS v4, Vitest + Testing Library, Python 3 Playwright (`sync_playwright` + `/usr/bin/google-chrome`), Chrome DevTools MCP (`performance_start_trace` / `performance_analyze_insight`).

**Spec:** `docs/superpowers/specs/2026-11-19-omsua-motion-composition-lcp-design.md`

## Global Constraints

- Node.js `>= 22.0.0` & `pnpm >= 10.0.0`; install zero new runtime npm packages inside `packages/shared`, `apps/web`, `apps/admin`, or `apps/backend`.
- Zero pure white or black tokens anywhere in source, CSS, or `::view-transition-*` rules: never emit `#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)`, or Tailwind `*-white` / `*-black`.
- Preserve 100% of existing 163 automated workspace tests and accessible button/dialog contracts (`+ Đặt ngay`, `+ Thêm`, `+ Thêm món ăn vặt`, `+ Chọn`, `Thêm vào giỏ • ...`, `Giỏ hàng (...)`, `Đơn đã đặt`).
- Never stop or kill user dev servers running on `:3000`, `:3001`, or `:4000`.

## Review Focus

1. **Duplicate `view-transition-name` mounted simultaneously in the DOM:** `HeroSpotlight` and `DrinkMenuSection` render the same spotlight drinks (`tra-sua-atiso`, `quyt-nhai-cat-tuong`) on screen together and must never share a `view-transition-name`; in `FanpageGallerySection`, when `lightboxIndex === index`, the grid card must omit `name="gallery-photo-${item.id}"` so `PhotoLightboxModal` is the sole mounted owner of that name during open/close morphs (tested in Task 4).
2. **Cross-channel React `<ViewTransition>` resolution between Next.js 15.5 (`react-experimental`) and React 19.3 (`react`):** `AppViewTransition` and `addAppTransitionType` must resolve stable `ViewTransition` / `addTransitionType` first, fall back to `unstable_ViewTransition` / `unstable_addTransitionType` under Next.js's experimental webpack alias, and degrade cleanly to `<Fragment>` / no-op without throwing (tested in Task 1).
3. **Hanging or slow backend socket during SSR `HomePage` (`fetchCatalog` / `fetchBranches`):** When `fetchImpl` hangs past `timeoutMs` or rejects with an abort/timeout error, both helpers must abort via `AbortSignal` within `timeoutMs` and return `{ catalog: getDefaultCatalog(), isFallback: true }` / `{ branches: OMSUA_BRANCHES, isFallback: true }` without unhandled promise rejections (tested in Task 2).
4. **Switching `<ProductCustomizerModal />` directly from a Drink (`Size L` + toppings) to a Snack (`Size STD` + spiceLevel):** `createCustomizerDraftState` and the explicit `<DrinkCustomizerModal key={product.id} />` / `<SnackCustomizerModal key={product.id} />` variants must isolate drink vs snack draft fields so `draftStateToOrderItemInput` never leaks `sugarLevel`/`iceLevel`/`toppingIds` onto a snack or throws `OrderValidationError` (tested in Task 1 & Task 3).
5. **Modified clicks (`Ctrl+Click`, `Meta+Click`, `Shift+Click`, `Alt+Click`, middle-click `button !== 0`) on Admin `<DirectionalNavLink />`:** The custom directional `startTransition` click handler must bail out without `event.preventDefault()` on modified or non-primary clicks so browser "open in new tab" behavior stays intact (tested in Task 4).

---

## Planned File Structure

- **Create:**
  - `packages/shared/src/customizer-state.ts` — Pure, DOM-free customizer draft state & reducer (`createCustomizerDraftState`, `reduceCustomizerDraftState`, `draftStateToOrderItemInput`) shared across Web and future React Native / Expo screens.
  - `apps/web/src/components/transitions/AppViewTransition.tsx` — Isomorphic `<AppViewTransition>`, `addAppTransitionType`, and `resolveViewTransitionRuntime` helper for Next.js 15.5 / React 19.3.
  - `apps/web/src/components/transitions/AppViewTransition.test.tsx` — Unit tests for stable, `unstable_*`, and fallback runtime resolution.
  - `apps/admin/src/components/transitions/AppViewTransition.tsx` — Admin `<AppViewTransition>`, `addAppTransitionType`, `<DirectionalPageTransition>`, and `<DirectionalNavLink>` for React Router 7 + React 19.3.
  - `apps/web/src/components/modals/customizer/CustomizerCompound.tsx` — `Customizer` compound component family (`Provider`, `Dialog`, `Header`, `SizeSelector`, `SugarSelector`, `IceSelector`, `ToppingPicker`, `SpiceSelector`, `CupGauge`, `Footer`) using React 19 `use()`.
  - `apps/web/src/components/modals/checkout/CheckoutCompound.tsx` — `Checkout` compound component family (`Provider`, `UnavailableBanner`, `ItemList`, `BranchCard`, `DeliveryFields`, `TotalsCard`, `PaymentPicker`, `ReceiptView`) using React 19 `use()`.
  - `scripts/webapp-playwright-verify.py` — Native Python Playwright verification script (`webapp-testing`) measuring Chromium LCP, View Transitions, Compound Modals, Admin navigation, and saving visual proof screenshots.
- **Modify:**
  - `packages/shared/src/pricing.ts`, `packages/shared/src/index.ts`, `packages/shared/src/index.test.ts` — Hoist `Intl.NumberFormat('vi-VN')` (`js-hoist-intl`) and export/test `customizer-state`.
  - `apps/web/next.config.ts` — Enable `experimental: { viewTransition: true }` and static immutable `Cache-Control` headers for `/images/fanpage/:path*` and `/brand/:path*`.
  - `apps/web/src/app/globals.css` & `apps/admin/src/index.css` — Add View Transition CSS recipes (Live Root, `pointer-events: none`, Persistent Chrome + Backdrop-Blur isolation, `.morph`, `.tab-pill`, `.nav-forward` / `.nav-back`, `.lightbox-next` / `.lightbox-prev`, `@media (prefers-reduced-motion: reduce)`).
  - `apps/web/src/lib/api.ts` & `apps/web/src/lib/api.test.ts` — Add bounded `timeoutMs = 1500` abort signal to `fetchCatalog` and `fetchBranches`.
  - `apps/web/src/app/layout.tsx`, `apps/web/src/components/artwork/ProductMedia.tsx`, `apps/web/src/components/artwork/ProductMedia.test.tsx`, `apps/web/src/components/storefront/HeroSpotlight.tsx`, `apps/web/src/components/artwork/DalatMorningMistCanvas.tsx`, `apps/web/src/components/artwork/DalatMorningMistCanvas.test.tsx` — Selective font preloads, single `priority` LCP spotlight image, and post-paint deferred mist animation.
  - `apps/web/src/store/cart-store.tsx`, `apps/web/src/components/modals/ProductCustomizerModal.tsx`, `apps/web/src/components/modals/CartCheckoutDrawer.tsx`, `apps/web/src/components/modals/OrderLookupModal.tsx` — React 19 `<Context value>` + `use()`, explicit `<DrinkCustomizerModal />` / `<SnackCustomizerModal />` variants, modular `<Checkout.* />` composition, and `tabular-nums` polish.
  - `apps/web/src/components/storefront/StorefrontHeader.tsx`, `StorefrontClientShell.tsx`, `DrinkMenuSection.tsx`, `SnackMenuSection.tsx`, `ToppingStripSection.tsx`, `FanpageGallerySection.tsx`, `apps/web/src/components/modals/PhotoLightboxModal.tsx` — Persistent chrome `viewTransitionName`, `React.memo` item cards + stable callbacks, `useDeferredValue`, sliding pills, and shared-element gallery-to-lightbox morph.
  - `apps/admin/src/layouts/AdminLayout.tsx`, `apps/admin/src/pages/OrdersPage.tsx`, `MenuPage.tsx`, `BranchesPage.tsx`, `SettingsPage.tsx` — Persistent chrome isolation, `<DirectionalPageTransition>`, `React.memo(AdminOrderCard)`, sliding status pills, `tabular-nums`, and typographic `…`.
  - `apps/web/src/components/storefront/storefront-sections.test.tsx`, `apps/web/src/components/storefront/fanpage-gallery.test.tsx`, `apps/web/src/components/modals/ordering-flow.test.tsx`, `apps/web/src/lib/web-review.test.ts`, `apps/admin/src/App.test.tsx`, `apps/admin/src/vite-config.test.ts`, `.gitignore`, `README.md` — Full TDD coverage and updated documentation.

---

### Task 1: Mobile-Grade Shared Core (`vercel-react-native-skills`) & Isomorphic `<AppViewTransition>` Foundation (`vercel-react-view-transitions`)

**Files:**
- Create: `packages/shared/src/customizer-state.ts`
- Modify: `packages/shared/src/pricing.ts`, `packages/shared/src/index.ts`, `packages/shared/src/index.test.ts`
- Modify: `apps/web/next.config.ts`
- Create: `apps/web/src/components/transitions/AppViewTransition.tsx`
- Create: `apps/web/src/components/transitions/AppViewTransition.test.tsx`
- Create: `apps/admin/src/components/transitions/AppViewTransition.tsx`
- Modify: `apps/web/src/app/globals.css`, `apps/admin/src/index.css`

**Interfaces:**
- Consumes: `ProductItem`, `ProductSizeCode`, `SugarLevel`, `IceLevel`, `SpiceLevel`, `OrderItemInput`, `ToppingItem` from `packages/shared/src/domain.ts`
- Produces:
  - `packages/shared/src/customizer-state.ts`:
    - `export interface CustomizerDraftState { productId: string; kind: 'drink' | 'snack'; size: ProductSizeCode; sugarLevel: SugarLevel; iceLevel: IceLevel; toppingIds: string[]; spiceLevel: SpiceLevel; quantity: number }`
    - `export type CustomizerDraftAction = { type: 'SET_SIZE'; size: ProductSizeCode } | { type: 'SET_SUGAR'; sugarLevel: SugarLevel } | { type: 'SET_ICE'; iceLevel: IceLevel } | { type: 'TOGGLE_TOPPING'; toppingId: string } | { type: 'SET_SPICE'; spiceLevel: SpiceLevel } | { type: 'SET_QUANTITY'; quantity: number } | { type: 'STEP_QUANTITY'; delta: number }`
    - `export function createCustomizerDraftState(product: ProductItem, options?: { initialSpiceLevel?: SpiceLevel; initialToppingIds?: readonly string[]; availableToppings?: readonly ToppingItem[] }): CustomizerDraftState`
    - `export function reduceCustomizerDraftState(state: CustomizerDraftState, action: CustomizerDraftAction): CustomizerDraftState`
    - `export function draftStateToOrderItemInput(state: CustomizerDraftState): OrderItemInput`
  - `apps/web/src/components/transitions/AppViewTransition.tsx` & `apps/admin/src/components/transitions/AppViewTransition.tsx`:
    - `export interface AppViewTransitionProps { children: ReactNode; name?: string; default?: ViewTransitionClass; enter?: ViewTransitionClass; exit?: ViewTransitionClass; share?: ViewTransitionClass; update?: ViewTransitionClass }`
    - `export function AppViewTransition(props: AppViewTransitionProps): JSX.Element`
    - `export function addAppTransitionType(type: string): void`
    - `export function resolveViewTransitionRuntime(reactModule: Record<string, unknown>): { Component: ComponentType<AppViewTransitionProps>; addType: (type: string) => void }`
  - `apps/admin/src/components/transitions/AppViewTransition.tsx` additionally exports:
    - `export function DirectionalPageTransition({ children }: { children: ReactNode }): JSX.Element`

- [ ] **Step 1: Write failing tests in `packages/shared/src/index.test.ts` and `apps/web/src/components/transitions/AppViewTransition.test.tsx`**

1. In `packages/shared/src/index.test.ts`, add tests asserting:
   - `createCustomizerDraftState` filters unavailable or unknown `initialToppingIds`, defaults drinks to `sugarLevel: '70'` / `iceLevel: '70'`, and defaults snacks to `initialSpiceLevel ?? product.defaultSpiceLevel ?? 'cay-vua'`.
   - `reduceCustomizerDraftState` toggles toppings deterministically in sorted order, clamps `STEP_QUANTITY` / `SET_QUANTITY` to `[1, 99]`, and `draftStateToOrderItemInput` emits clean drink vs snack `OrderItemInput` objects without leaking `sugarLevel`/`iceLevel`/`toppingIds` onto snacks (`Review Focus #4`).
   - `formatVnd` formats negative, zero, and multi-million VND amounts identically via the hoisted `Intl.NumberFormat('vi-VN')` formatter (`-1.250.000đ`, `0đ`, `45.000đ`).
2. Create `apps/web/src/components/transitions/AppViewTransition.test.tsx` testing `resolveViewTransitionRuntime` across all 3 runtime shapes (`Review Focus #2`):
   - Shape A (`{ ViewTransition, addTransitionType }` — React 19.3 stable).
   - Shape B (`{ unstable_ViewTransition, unstable_addTransitionType }` — Next.js 15.5 `react-experimental`).
   - Shape C (`{}` — fallback `<Fragment>` + no-op `addType` that renders children without throwing).

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/shared test && pnpm --filter @omsua/web test src/components/transitions/AppViewTransition.test.tsx`
Expected: FAIL (`createCustomizerDraftState` not exported from `@omsua/shared`, `AppViewTransition` module missing).

- [ ] **Step 3: Implement shared customizer reducer, hoisted `Intl` formatter, `next.config.ts` ViewTransition + Cache headers, `<AppViewTransition>`, and CSS recipes**

1. Create `packages/shared/src/customizer-state.ts` implementing `createCustomizerDraftState`, `reduceCustomizerDraftState`, and `draftStateToOrderItemInput`, re-export from `packages/shared/src/index.ts`, and hoist `const VI_NUMBER_FORMATTER = new Intl.NumberFormat('vi-VN')` in `packages/shared/src/pricing.ts` (`formatVnd` uses `VI_NUMBER_FORMATTER.format(Math.abs(rounded))`).
2. Update `apps/web/next.config.ts` to add `experimental: { viewTransition: true }` and `async headers()` returning `Cache-Control: public, max-age=31536000, immutable` for `/images/fanpage/:path*` and `/brand/:path*`.
3. Create `apps/web/src/components/transitions/AppViewTransition.tsx` and `apps/admin/src/components/transitions/AppViewTransition.tsx` (including `<DirectionalPageTransition>` in Admin using `enter`/`exit` mapped to `{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }` and `default="none"`).
4. Append the View Transition CSS recipes to `apps/web/src/app/globals.css` and `apps/admin/src/index.css` (using zero `#fff`/`#000` tokens):
   - Timing tokens (`--duration-exit: 150ms`, `--duration-enter: 210ms`, `--duration-move: 340ms`), Live Root (`::view-transition-old(root) { display: none }`, `::view-transition-new(root) { animation: none }`), `::view-transition { pointer-events: none }`.
   - Persistent element & backdrop-blur isolation for `omsua-site-header`, `omsua-sticky-cart`, `omsua-admin-sidebar`, `omsua-admin-topbar`.
   - `.morph`, `.tab-pill`, `.fade-in` / `.fade-out`, `.nav-forward` / `.nav-back`, `.lightbox-next` / `.lightbox-prev` (animating strictly GPU `transform`/`translate` and `opacity`), plus `@media (prefers-reduced-motion: reduce)` forcing `0s !important`.

- [ ] **Step 4: Run build and tests to verify they pass**

Run: `pnpm --filter @omsua/shared build && pnpm --filter @omsua/shared test && pnpm --filter @omsua/web test src/components/transitions/AppViewTransition.test.tsx src/lib/web-review.test.ts`
Expected: PASS (all shared & transition runtime tests green, zero pure B/W violations in CSS).

- [ ] **Step 5: Commit**

```bash
git add packages/shared apps/web/next.config.ts apps/web/src/components/transitions apps/web/src/app/globals.css apps/admin/src/components/transitions apps/admin/src/index.css
git commit -m "feat(shared,web,admin): add headless customizer reducer, hoisted Intl, and isomorphic ViewTransition foundation"
```

---

### Task 2: Core Web Vitals & 4-Subpart LCP Optimization (`debug-optimize-lcp`)

**Files:**
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/web/src/lib/api.test.ts`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/components/artwork/ProductMedia.tsx`
- Modify: `apps/web/src/components/artwork/ProductMedia.test.tsx`
- Modify: `apps/web/src/components/storefront/HeroSpotlight.tsx`
- Modify: `apps/web/src/components/artwork/DalatMorningMistCanvas.tsx`
- Modify: `apps/web/src/components/artwork/DalatMorningMistCanvas.test.tsx`
- Modify: `apps/web/src/lib/web-review.test.ts`

**Interfaces:**
- Consumes: `@omsua/shared` catalog/branch defaults
- Produces:
  - `fetchCatalog(baseUrl?, fetchImpl?, timeoutMs = 1500)` & `fetchBranches(baseUrl?, fetchImpl?, timeoutMs = 1500)` in `apps/web/src/lib/api.ts` passing an `AbortSignal` that aborts after `timeoutMs`
  - `ProductMediaProps` in `apps/web/src/components/artwork/ProductMedia.tsx` extended with `priority?: boolean` (default `false`): only when `priority === true` does `<img>` render `fetchPriority="high"` and `decoding="sync"`; `variant="spotlight"` with `priority={false}` renders `loading="eager"` + `decoding="async"` without `fetchPriority="high"`

- [ ] **Step 1: Write failing tests in `api.test.ts`, `ProductMedia.test.tsx`, `DalatMorningMistCanvas.test.tsx`, and `web-review.test.ts`**

1. In `apps/web/src/lib/api.test.ts`, add a test (`Review Focus #3`) passing a `fetchImpl` that listens to `init?.signal` and never resolves until aborted, with `timeoutMs = 25`: assert `fetchCatalog('http://localhost:4000/api', hangingFetch, 25)` and `fetchBranches('http://localhost:4000/api', hangingFetch, 25)` both resolve within `200ms` to `{ isFallback: true, ... }`.
2. In `apps/web/src/components/artwork/ProductMedia.test.tsx`, assert:
   - `<ProductMedia productId="tra-sua-atiso" variant="spotlight" priority={true} />` renders `loading="eager"`, `fetchpriority="high"`, and `decoding="sync"`.
   - `<ProductMedia productId="quyt-nhai-cat-tuong" variant="spotlight" />` (`priority` omitted/`false`) renders `loading="eager"` and `decoding="async"` and does **not** set `fetchpriority="high"`.
   - `<HeroSpotlight spotlightProducts={...} onSelectProduct={vi.fn()} />` renders **exactly 1** `img[fetchpriority="high"]` (`Trà Sữa Atiso`).
3. In `apps/web/src/components/artwork/DalatMorningMistCanvas.test.tsx`, assert `<DalatMorningMistCanvas />` defers scheduling `requestAnimationFrame` until after the initial idle/post-paint callback (`requestIdleCallback` or `setTimeout`) fires, so zero `requestAnimationFrame` calls occur synchronously during mount/LCP paint.
4. In `apps/web/src/lib/web-review.test.ts`, assert `apps/web/src/app/layout.tsx` sets `preload: false` on `Lora`, `Dancing_Script`, and `Shantell_Sans` so only above-the-fold LCP fonts preload in `<head>`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/lib/api.test.ts src/components/artwork/ProductMedia.test.tsx src/components/artwork/DalatMorningMistCanvas.test.tsx src/lib/web-review.test.ts`
Expected: FAIL (`fetchCatalog` hangs past timeout, both spotlight images carry `fetchpriority="high"`, `DalatMorningMistCanvas` calls `requestAnimationFrame` immediately on mount, `layout.tsx` preloads all 5 fonts).

- [ ] **Step 3: Implement 4-subpart LCP optimizations across `api.ts`, `layout.tsx`, `ProductMedia.tsx`, `HeroSpotlight.tsx`, and `DalatMorningMistCanvas.tsx`**

1. **TTFB (`apps/web/src/lib/api.ts`):** Add `timeoutMs = 1500` parameter to `fetchCatalog` and `fetchBranches`, creating an `AbortController` + `setTimeout(() => controller.abort(), timeoutMs)` (cleared in `finally`) and passing `signal: controller.signal` into `fetchImpl`.
2. **Resource Load Duration (`apps/web/src/app/layout.tsx`):** Set `preload: false` on `lora`, `dancingScript`, and `shantellSans`, and trim `beVietnamPro` weights to `['400', '500', '600', '700']` while keeping `preload: true` on `fraunces` and `beVietnamPro`.
3. **Resource Load Delay (`ProductMedia.tsx` & `HeroSpotlight.tsx`):** Add `priority = false` prop to `ProductMedia` (`loading={variant === 'spotlight' || priority ? 'eager' : 'lazy'}`, `fetchPriority={priority ? 'high' : undefined}`, `decoding={priority ? 'sync' : 'async'}`), and pass `priority={index === 0}` in `HeroSpotlight.tsx`.
4. **Element Render Delay (`DalatMorningMistCanvas.tsx`):** Wrap the initial `requestAnimationFrame(renderFrame)` kickoff inside `window.requestIdleCallback` (with `window.setTimeout(..., 120)` fallback when `requestIdleCallback` is absent), cancelling both the idle/timeout handle and any in-flight `rafId` in the effect cleanup.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @omsua/web test src/lib/api.test.ts src/components/artwork/ProductMedia.test.tsx src/components/artwork/DalatMorningMistCanvas.test.tsx src/lib/web-review.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/api.ts apps/web/src/lib/api.test.ts apps/web/src/app/layout.tsx apps/web/src/components/artwork/ProductMedia.tsx apps/web/src/components/artwork/ProductMedia.test.tsx apps/web/src/components/storefront/HeroSpotlight.tsx apps/web/src/components/artwork/DalatMorningMistCanvas.tsx apps/web/src/components/artwork/DalatMorningMistCanvas.test.tsx apps/web/src/lib/web-review.test.ts
git commit -m "perf(web): optimize all 4 LCP subparts across SSR timeout, font preloads, hero priority, and post-paint mist"
```

---

### Task 3: React 19 Compound Components, Context DI & Explicit Variants (`vercel-composition-patterns`)

**Files:**
- Modify: `apps/web/src/store/cart-store.tsx`
- Create: `apps/web/src/components/modals/customizer/CustomizerCompound.tsx`
- Modify: `apps/web/src/components/modals/ProductCustomizerModal.tsx`
- Create: `apps/web/src/components/modals/checkout/CheckoutCompound.tsx`
- Modify: `apps/web/src/components/modals/CartCheckoutDrawer.tsx`
- Modify: `apps/web/src/components/modals/ordering-flow.test.tsx`
- Modify: `apps/web/src/lib/web-review.test.ts`

**Interfaces:**
- Consumes: `createCustomizerDraftState`, `reduceCustomizerDraftState`, `draftStateToOrderItemInput` from `@omsua/shared` (Task 1)
- Produces:
  - `CartContextValue` in `apps/web/src/store/cart-store.tsx` using React 19 `<CartContext value={value}>` + `use(CartContext)` and exposing structured `state`, `actions`, and `meta` objects alongside existing flat properties
  - `Customizer` compound object in `apps/web/src/components/modals/customizer/CustomizerCompound.tsx` (`Provider`, `Dialog`, `Header`, `SizeSelector`, `SugarSelector`, `IceSelector`, `ToppingPicker`, `SpiceSelector`, `CupGauge`, `Footer`, `useCustomizerContext`) + explicit exported variants `DrinkCustomizerModal` and `SnackCustomizerModal` in `ProductCustomizerModal.tsx`
  - `Checkout` compound object in `apps/web/src/components/modals/checkout/CheckoutCompound.tsx` (`Provider`, `UnavailableBanner`, `ItemList`, `BranchCard`, `DeliveryFields`, `TotalsCard`, `PaymentPicker`, `ReceiptView`, `useCheckoutContext`) composed inside `CartCheckoutDrawer.tsx`

- [ ] **Step 1: Write failing tests in `ordering-flow.test.tsx` and `web-review.test.ts`**

1. In `apps/web/src/components/modals/ordering-flow.test.tsx`, add tests asserting:
   - `DrinkCustomizerModal` and `SnackCustomizerModal` can be rendered directly as explicit variants, and switching `<ProductCustomizerModal product={...} />` live from `Trà Sữa Atiso` (`Size L` + `tran-chau-den`) to `Bánh Tráng Trộn Tóp Mỡ` (`Review Focus #4`) resets state cleanly and submits a valid snack `OrderItemInput` (`size: 'STD'`, `spiceLevel: 'cay-vua'`, no `toppingIds`/`sugarLevel`/`iceLevel`).
   - `useCart()` exposes `{ state, actions, meta }` matching the top-level cart state (`state.totals`, `actions.addItem`, `meta.isHydrated`).
   - Custom sibling components placed inside `<Customizer.Provider>` or `<Checkout.Provider>` read live state and trigger actions via `Customizer.useCustomizerContext()` / `Checkout.useCheckoutContext()` without prop drilling.
2. In `apps/web/src/lib/web-review.test.ts`, add static checks across `apps/web/src` asserting zero occurrences of `forwardRef(` and zero occurrences of `useContext(` (`React 19` `use()` + ref-as-prop rule from `vercel-composition-patterns`).

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/modals/ordering-flow.test.tsx src/lib/web-review.test.ts`
Expected: FAIL (`DrinkCustomizerModal` / `Customizer` / `Checkout` compound exports missing, `cart-store.tsx` still calls `useContext`).

- [ ] **Step 3: Refactor `cart-store.tsx`, `ProductCustomizerModal.tsx`, and `CartCheckoutDrawer.tsx` into React 19 Compound Components**

1. Update `apps/web/src/store/cart-store.tsx` to replace `useContext` with `use` from `'react'`, render `<CartContext value={value}>{children}</CartContext>`, and attach memoized `state: { branches, selectedBranch, items, lines, totals, unavailableItems }`, `actions: { setSelectedBranchId, addItem, updateQuantity, removeItem, removeUnavailableItems, clearCart }`, and `meta: { isHydrated }` on `CartContextValue`.
2. Create `apps/web/src/components/modals/customizer/CustomizerCompound.tsx` backed by `useReducer(reduceCustomizerDraftState, ...)` and React 19 `use(CustomizerContext)`, then update `apps/web/src/components/modals/ProductCustomizerModal.tsx` to export explicit `<DrinkCustomizerModal />` and `<SnackCustomizerModal />` variants (composed with `<Customizer.Dialog>`, `<Customizer.Header>`, etc.) and route `<ProductCustomizerModal />` cleanly by `product.kind` with `key={product.id}`.
3. Create `apps/web/src/components/modals/checkout/CheckoutCompound.tsx` encapsulating checkout state/validation/submission in `Checkout.Provider` (`{ state, actions, meta }`) and focused subcomponents (`UnavailableBanner`, `ItemList`, `BranchCard`, `DeliveryFields`, `TotalsCard`, `PaymentPicker`, `ReceiptView`), reducing `CartCheckoutDrawer.tsx` to a clean declarative composition shell.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @omsua/web test src/components/modals/ordering-flow.test.tsx src/lib/web-review.test.ts`
Expected: PASS (all existing + new compound/variant/React-19 tests green).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/store/cart-store.tsx apps/web/src/components/modals/customizer apps/web/src/components/modals/ProductCustomizerModal.tsx apps/web/src/components/modals/checkout apps/web/src/components/modals/CartCheckoutDrawer.tsx apps/web/src/components/modals/ordering-flow.test.tsx apps/web/src/lib/web-review.test.ts
git commit -m "refactor(web): adopt React 19 use() compound components and explicit Drink/Snack customizer variants"
```

---

### Task 4: View Transitions, Shared-Element Morphs, Memoized Lists & Typography Polish (`vercel-react-view-transitions` + `vercel-react-native-skills`)

**Files:**
- Modify: `apps/web/src/components/storefront/StorefrontHeader.tsx`, `StorefrontClientShell.tsx`, `DrinkMenuSection.tsx`, `SnackMenuSection.tsx`, `ToppingStripSection.tsx`, `FanpageGallerySection.tsx`
- Modify: `apps/web/src/components/modals/PhotoLightboxModal.tsx`, `OrderLookupModal.tsx`
- Modify: `apps/admin/src/components/transitions/AppViewTransition.tsx`, `apps/admin/src/layouts/AdminLayout.tsx`, `apps/admin/src/pages/OrdersPage.tsx`, `MenuPage.tsx`, `BranchesPage.tsx`, `SettingsPage.tsx`
- Modify: `apps/web/src/components/storefront/storefront-sections.test.tsx`, `apps/web/src/components/storefront/fanpage-gallery.test.tsx`, `apps/web/src/lib/web-review.test.ts`
- Modify: `apps/admin/src/App.test.tsx`, `apps/admin/src/vite-config.test.ts`

**Interfaces:**
- Consumes: `<AppViewTransition>`, `addAppTransitionType`, `<DirectionalPageTransition>` from Task 1
- Produces:
  - Persistent `viewTransitionName` isolation on `StorefrontHeader` (`omsua-site-header`), mobile sticky cart bar (`omsua-sticky-cart`), and `AdminLayout` (`omsua-admin-sidebar`, `omsua-admin-topbar`)
  - Exclusive 1-to-1 shared element `gallery-photo-${id}` morph between `FanpageGallerySection` and `PhotoLightboxModal` (`data-vt-name` attribute hook for deterministic testing of `Review Focus #1`) + directional `lightbox-next` / `lightbox-prev` transitions
  - Memoized list item components (`DrinkMenuItemCard`, `SnackMenuItemCard`, `AdminOrderCard`) with stable callbacks + `<DirectionalNavLink>` in `AdminLayout` respecting modified clicks (`Review Focus #5`)
  - Full `…` and `tabular-nums` parity + zero falsy `&&` numeric/string renders across both Web and Admin

- [ ] **Step 1: Write failing tests in `fanpage-gallery.test.tsx`, `storefront-sections.test.tsx`, `App.test.tsx`, and `vite-config.test.ts`**

1. In `apps/web/src/components/storefront/fanpage-gallery.test.tsx`, assert (`Review Focus #1`):
   - Before opening the lightbox, each gallery card marks its image transition wrapper with `data-vt-name="gallery-photo-${item.id}"`, and zero duplicate `data-vt-name` values exist across the whole document.
   - When a gallery card is clicked to open `PhotoLightboxModal`, the clicked grid card drops its `data-vt-name` while `PhotoLightboxModal` mounts the single `data-vt-name="gallery-photo-${item.id}"` element in the DOM (and restores it to the grid card upon closing).
2. In `apps/web/src/components/storefront/storefront-sections.test.tsx`, assert `StorefrontHeader` sets `style.viewTransitionName === 'omsua-site-header'` and zero duplicate `data-vt-name` attributes exist when `HeroSpotlight` and `DrinkMenuSection` render together (`Review Focus #1`).
3. In `apps/admin/src/App.test.tsx` & `apps/admin/src/vite-config.test.ts`, assert:
   - `<DirectionalNavLink>` in `AdminLayout` navigates normally on left click (`button: 0`) and does **not** call `preventDefault()` on `Ctrl+Click` / `Meta+Click` (`Review Focus #5`).
   - All `.tsx` files in `apps/admin/src` pass the static Web Interface Guidelines checks: zero `sm:min-h-(9|10)`, zero `text-[(9|10|11)px]`, zero `transition-all`, and zero straight ASCII `'...'` loading/placeholder ellipses.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/storefront/fanpage-gallery.test.tsx src/components/storefront/storefront-sections.test.tsx && pnpm --filter @omsua/admin test`
Expected: FAIL (`data-vt-name` shared-element handoff missing, `viewTransitionName` missing on persistent chrome, Admin `.tsx` files still contain ASCII `...`).

- [ ] **Step 3: Implement View Transitions, memoized list cards, directional Admin nav, and Admin typography polish**

1. **Web Persistent Chrome & Storefront Transitions:**
   - Add `style={{ viewTransitionName: 'omsua-site-header' }}` on `<header>` in `StorefrontHeader.tsx` and `style={{ viewTransitionName: 'omsua-sticky-cart' }}` on the mobile sticky cart wrapper in `StorefrontClientShell.tsx`.
   - Extract `memo(DrinkMenuItemCard)` in `DrinkMenuSection.tsx` and `memo(SnackMenuItemCard)` in `SnackMenuSection.tsx` with stable `useCallback` handlers by product ID, use `useDeferredValue(effectiveQuery)` for smooth drink filtering, wrap drink cards in `<AppViewTransition key={drink.id}>`, wrap active filter pills (`drink-category-pill`, `snack-spice-pill`) in `<AppViewTransition name="..." share="tab-pill">` inside `startTransition`, and wrap `ToppingStripSection` + `SnackMenuSection` in `<AppViewTransition>` for smooth layout displacement.
2. **Gallery -> Lightbox Shared-Element Morph (`FanpageGallerySection.tsx` & `PhotoLightboxModal.tsx`):**
   - Wrap each gallery card thumbnail in `<AppViewTransition name={lightboxIndex === index ? undefined : \`gallery-photo-\${item.id}\`} share="morph" default="none">` (rendering a thin `<div data-vt-name={lightboxIndex === index ? undefined : \`gallery-photo-\${item.id}\`}>` inside) and wrap open/close/filter state updates in `startTransition`.
   - In `PhotoLightboxModal.tsx`, wrap the active image in `<AppViewTransition key={currentItem.id} name={\`gallery-photo-\${currentItem.id}\`} share="morph" enter={{ 'lightbox-next': 'lightbox-next', 'lightbox-prev': 'lightbox-prev', default: 'fade-in' }} exit={{ 'lightbox-next': 'lightbox-next', 'lightbox-prev': 'lightbox-prev', default: 'fade-out' }} default="none">` (with matching `data-vt-name={\`gallery-photo-\${currentItem.id}\`}`), and dispatch `startTransition` + `addAppTransitionType('lightbox-next' | 'lightbox-prev')` on Prev/Next buttons and `ArrowLeft`/`ArrowRight`.
   - Add `tabular-nums` to remaining order amounts in `OrderLookupModal.tsx` and audit conditional renders so zero `{count && ...}` falsy leaks exist.
3. **Admin Directional Transitions, Memoized Order Cards & Typography Parity:**
   - Implement `<DirectionalNavLink>` in `apps/admin/src/components/transitions/AppViewTransition.tsx` comparing route order (`['/', '/menu', '/branches', '/settings']`), bailing out immediately when `event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey`, and otherwise running `startTransition(() => { addAppTransitionType(nextIdx >= prevIdx ? 'nav-forward' : 'nav-back'); navigate(to); })`.
   - Isolate `AdminLayout` `<aside>` (`omsua-admin-sidebar`) and `<header>` (`omsua-admin-topbar`), wrap each Admin page (`OrdersPage`, `MenuPage`, `BranchesPage`, `SettingsPage`) in `<DirectionalPageTransition>`, extract `memo(AdminOrderCard)` + sliding `admin-status-pill` in `OrdersPage.tsx`, add `tabular-nums` to all KPIs/counts/prices, and replace remaining `'...'` strings with `'…'`.

- [ ] **Step 4: Run full Web & Admin tests to verify they pass**

Run: `pnpm --filter @omsua/web test && pnpm --filter @omsua/admin test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src apps/admin/src
git commit -m "feat(web,admin): wire ViewTransitions, shared-element lightbox morph, memoized cards, and directional admin nav"
```

---

### Task 5: Automated Python Playwright E2E/LCP Suite (`webapp-testing`) & Live Chrome CWV Trace (`debug-optimize-lcp`)

**Files:**
- Create: `scripts/webapp-playwright-verify.py`
- Modify: `apps/web/src/lib/web-review.test.ts`
- Modify: `.gitignore`
- Modify: `README.md`

**Interfaces:**
- Consumes: Live or `with_server.py`-managed `:3000` (`@omsua/web`), `:3001` (`@omsua/admin`), and `:4000` (`@omsua/backend`) endpoints
- Produces:
  - Deterministic headless Python Playwright verification runner `scripts/webapp-playwright-verify.py` outputting structured JSON metrics + screenshots into `output/playwright/` (`storefront-desktop.png`, `storefront-customizer.png`, `storefront-lightbox.png`, `admin-orders.png`)

- [ ] **Step 1: Update `.gitignore` and write `scripts/webapp-playwright-verify.py` with strict CWV & UI assertions**

1. Add `.venv-playwright/` and `output/playwright/` to `.gitignore`, and add a Vitest assertion in `apps/web/src/lib/web-review.test.ts` running `execFileSync('python3', ['-m', 'py_compile', posterAndPlaywrightPath])` on `scripts/webapp-playwright-verify.py` (watching it fail before creating the script) so `pnpm test` permanently guards Python syntax.
2. Create `scripts/webapp-playwright-verify.py` following `webapp-testing/SKILL.md` (`sync_playwright`, `headless=True`, `executable_path=os.environ.get("CHROME_PATH", "/usr/bin/google-chrome")`, `page.wait_for_load_state("networkidle")`):
   - **Storefront (`http://localhost:3000/`):**
     - Captures `console` `error` and `pageerror` events (asserts `0` errors).
     - Reads buffered `PerformanceObserver` / `performance.getEntriesByType('largest-contentful-paint')` in headless Chromium and asserts `lcp_ms < 2500`.
     - Asserts `page.locator('img[fetchpriority="high"]').count() == 1`.
     - Tests category pill click (`Cà Phê Phin`), diacritic-free search (`atiso`), explicit `<DrinkCustomizerModal />` (`Trà Sữa Atiso` -> Cup Gauge + add to cart), `<SnackCustomizerModal />` (`Bánh Tráng Trộn Tóp Mỡ`), `<FanpageGallerySection />` -> `<PhotoLightboxModal />` open/next/Escape close (asserting unique `data-vt-name`), and `<CartCheckoutDrawer />` inline `aria-describedby` validation.
     - Saves `storefront-desktop.png`, `storefront-customizer.png`, and `storefront-lightbox.png` under `output/playwright/`.
   - **Admin (`http://localhost:3001/`):**
     - Verifies directional navigation across `Đơn hàng` -> `Thực đơn` -> `Chi nhánh` -> `Cài đặt` -> `Đơn hàng`, status pill filter, `order-age-badge`, `0` console/page errors, and saves `admin-orders.png`.

- [ ] **Step 2: Provision isolated Python Playwright venv (using host `/usr/bin/google-chrome`, zero browser download) and run `webapp-playwright-verify.py`**

Run:
```bash
python3 -m venv /tmp/omsua-pw-venv
/tmp/omsua-pw-venv/bin/pip install --quiet playwright
/tmp/omsua-pw-venv/bin/python scripts/webapp-playwright-verify.py
```
Expected: Exit `0` with `LCP < 2500ms`, `fetchpriority_high_count == 1`, `console_errors == 0`, and all 4 screenshots written to `output/playwright/` (inspect screenshots visually via `read_file`!). Also verify `--help` compatibility with `/home/fedora/.gemini/config/plugins/anthropic-dev-skills/skills/webapp-testing/scripts/with_server.py`.

- [ ] **Step 3: Run Live Chrome DevTools `debug-optimize-lcp` Performance Trace & Full Monorepo Gate**

1. Document the View Transitions architecture, Compound Components (`Customizer.*`, `Checkout.*`), LCP optimizations, and Playwright verification command in `README.md`.
2. Run full monorepo verification:
   `pnpm --reporter=append-only build && pnpm --reporter=append-only typecheck && pnpm --reporter=append-only lint && pnpm --reporter=append-only test`
   Expected: Exit `0` across `@omsua/shared`, `@omsua/backend`, `@omsua/web`, and `@omsua/admin`.
3. Run live Chrome DevTools `performance_start_trace` (`reload: true, autoStop: true`), `performance_analyze_insight` (`LCPBreakdown`, `RenderBlocking`, `LCPDiscovery`), and `emulate` (`Fast 3G`, `cpuThrottlingRate: 4`) on `http://localhost:3000/` via the `browser` subagent (strictly without `evaluate_script`):
   Expected: LCP in **Good (`<= 2.5s`)** range with minimal Resource Load Delay and Element Render Delay.

- [ ] **Step 4: Clean temporary venv and commit**

```bash
rm -rf /tmp/omsua-pw-venv
git add .gitignore apps/web/src/lib/web-review.test.ts scripts/webapp-playwright-verify.py README.md
git commit -m "test(e2e,perf): add Playwright webapp-testing & LCP verification suite and update docs"
```
