# Ốm Sữa UI/UX Elevation ("Sương Sớm Cầu Đất") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate `@omsua/web` and `@omsua/admin` into a cohesive Đà Lạt artisanal botanical experience ("Sương Sớm Cầu Đất") synthesizing all 8 UI/UX/art/accessibility skills with zero bundle bloat, zero CLS, full `>=44px` tap targets, a seeded mist canvas hero, interactive customizer cup gauges, printable botanical menu collateral, and a clean Chrome DevTools accessibility audit.

**Architecture:** Formalize the "Sương Sớm Cầu Đất" paper-grain and warm-espresso elevation theme in CSS tokens over the 14 canonical `OMSUA_COLORS`, share pure Vietnamese text-normalization and order-age SLA helpers from `@omsua/shared`, layer a zero-dependency seeded flow-field `<DalatMorningMistCanvas />` into `HeroSpotlight`, add sticky instant drink filtering + URL state sync + a real-time Customizer Cup Gauge + Web Interface Guidelines form/image/a11y compliance across Web and Admin, and generate the printable Botanical Menu PDF/PNG plus standalone p5.js and Design System studio HTML artifacts.

**Tech Stack:** TypeScript 5.7, Next.js 15 (App Router), React 19, Vite 6, Tailwind CSS v4, Vitest + Testing Library, HTML5 Canvas, Python 3 (`reportlab` / `Pillow` + `canvas-design` fonts), Chrome DevTools MCP (`lighthouse_audit` / `take_snapshot`).

**Spec:** `docs/superpowers/specs/2026-11-19-omsua-ui-ux-elevation-design.md`

## Global Constraints

- Node.js `>= 22.0.0` & `pnpm >= 10.0.0`; install zero new runtime npm packages inside `packages/shared`, `apps/web`, `apps/admin`, or `apps/backend`.
- Zero pure white or black tokens anywhere in source, CSS, SVG, or generated print collateral: never emit `#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)`, or Tailwind `*-white` / `*-black`.
- Preserve 100% of existing 153 automated tests and accessible button/dialog contracts (`+ Đặt ngay`, `+ Thêm`, `+ Thêm món ăn vặt`, `+ Chọn`, `Thêm vào giỏ • ...`, `Giỏ hàng (...)`, `Đơn đã đặt`).
- Never stop or kill user dev servers running on `:3000`, `:3001`, or `:4000`.

## Review Focus

1. **Malformed or unknown URL query parameters (`?cat=unknown&q=%20%20&media=foo`) on initial Storefront load:** `StorefrontClientShell` must clamp invalid `cat` values to `'all'`, trim whitespace-only `q` to `''`, and treat any `media` value other than `'studio'` as `false` so the menu never boots into a blank state (tested in Task 3).
2. **SSR, JSDOM (`getContext() === null`), or `prefers-reduced-motion: reduce` when mounting `<DalatMorningMistCanvas />`:** The component must never throw or run an infinite `requestAnimationFrame` loop when reduced motion is active or 2D canvas context is unavailable, and its pause/play button must toggle `aria-pressed` cleanly (tested in Task 2).
3. **Search query yielding zero matching drinks inside a specific category (`activeCategory="coffee"` + `q="atiso"`):** `DrinkMenuSection` must announce `0` matches via `role="status"` and render a `"Xóa bộ lọc tìm kiếm"` button that resets both `searchQuery` (`''`) and `activeCategory` (`'all'`) in one click (tested in Task 3).
4. **Submitting `CartCheckoutDrawer` with multiple invalid fields:** Validation must keep all user-typed text intact, mark invalid inputs with `aria-invalid="true"`, and move `document.activeElement` to the **first** invalid field in DOM order (`customerName` -> `customerPhone` -> `deliveryAddress` -> `note`) (tested in Task 3).
5. **Clock skew, unparseable timestamps, or terminal order statuses in `resolveOrderAge(createdAt, status, nowMs)`:** Future timestamps (`createdAt > nowMs`) must clamp to `{ label: 'Vừa đặt', minutes: 0, isOverdue: false }`, `completed`/`cancelled` orders must always report `isOverdue: false` regardless of age, and invalid date strings must return `null` without `NaN` (tested in Task 1 & Task 4).

---

## Planned File Structure

- **Create:**
  - `packages/shared/src/text-and-time.ts` — Pure `normalizeVietnameseText` and `resolveOrderAge` helpers shared by Web and Admin.
  - `docs/superpowers/specs/art/suong-som-atiso-algorithmic-philosophy.md` — 5-paragraph algorithmic art philosophy (`algorithmic-art`).
  - `apps/web/src/components/artwork/DalatMorningMistCanvas.tsx` — Seeded flow-field HTML5 `<canvas>` with reduced-motion fallback, `IntersectionObserver` auto-pause, and pause/play toggle.
  - `apps/web/src/components/artwork/DalatMorningMistCanvas.test.tsx` — Unit/DOM tests for seeded canvas safety, reduced motion, and pause toggle.
  - `docs/superpowers/specs/art/dalat-botanical-press-philosophy.md` — 5-paragraph static visual philosophy (`canvas-design`).
  - `scripts/generate-brand-poster.py` — Deterministic generator outputting `apps/web/public/brand/omsua-botanical-menu-poster.pdf` and `.png` using `canvas-design/canvas-fonts` and `OMSUA_COLORS`.
  - `apps/web/public/brand/omsua-botanical-menu-poster.pdf` & `apps/web/public/brand/omsua-botanical-menu-poster.png` — Printable tabletop botanical menu & preview.
- **Modify:**
  - `packages/shared/src/index.ts` & `packages/shared/src/index.test.ts` — Export & test `normalizeVietnameseText` and `resolveOrderAge`.
  - `apps/web/src/app/globals.css` & `apps/web/src/app/layout.tsx` — "Sương Sớm Cầu Đất" paper-grain & warm shadow tokens, `tabular-nums`, `text-wrap: balance`, `viewport.themeColor = '#EEEADF'`.
  - `apps/admin/src/index.css` & `apps/admin/index.html` — Matching warm paper elevation tokens, `tabular-nums`, `<meta name="theme-color" content="#EEEADF" />`.
  - `apps/web/src/components/artwork/ProductMedia.tsx` & `ProductMedia.test.tsx` — Explicit `width`/`height` per variant + `loading="eager"` & `fetchPriority="high"` for `variant="spotlight"`.
  - `apps/web/src/components/storefront/StorefrontHeader.tsx`, `HeroSpotlight.tsx`, `DrinkMenuSection.tsx`, `ToppingStripSection.tsx`, `SnackMenuSection.tsx`, `BrandStorySection.tsx`, `BrandFooter.tsx`, `FanpageGallerySection.tsx`, `StorefrontClientShell.tsx` — Editorial hierarchy, mist canvas stage, sticky search + URL sync, printable PDF CTA, `>=44px` tap targets, `text-xs` floor, and `label-content-name-mismatch` `<article>` refactor.
  - `apps/web/src/components/modals/ProductCustomizerModal.tsx`, `CartCheckoutDrawer.tsx`, `OrderLookupModal.tsx`, `PhotoLightboxModal.tsx` — Live Cup Gauge, `overscroll-contain`, `autoComplete`/`inputMode`, `…` copy, inline field error + focus-first-invalid.
  - `apps/admin/src/lib/text.ts`, `apps/admin/src/layouts/AdminLayout.tsx`, `apps/admin/src/pages/OrdersPage.tsx`, `MenuPage.tsx`, `BranchesPage.tsx` — Shared `normalizeVietnameseText`, live `resolveOrderAge` SLA badges, `tabular-nums` KPIs, explicit `width`/`height` branch photos, `text-xs` floor.
  - `apps/web/src/components/storefront/storefront-sections.test.tsx`, `apps/web/src/components/storefront/fanpage-gallery.test.tsx`, `apps/web/src/components/modals/ordering-flow.test.tsx`, `apps/web/src/lib/fanpage-assets.test.ts`, `apps/web/src/lib/web-review.test.ts`, `apps/admin/src/App.test.tsx`, `README.md` — Full TDD coverage & updated documentation.

---

### Task 1: Shared Vietnamese Search/Order-Age Helpers & “Sương Sớm Cầu Đất” Theme Foundation

**Files:**
- Create: `packages/shared/src/text-and-time.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `packages/shared/src/index.test.ts`
- Modify: `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`
- Modify: `apps/admin/src/index.css`, `apps/admin/index.html`, `apps/admin/src/lib/text.ts`
- Test: `apps/web/src/lib/web-review.test.ts`

**Interfaces:**
- Consumes: `OrderStatus` from `packages/shared/src/types.ts`
- Produces:
  - `export interface OrderAgeBadge { label: string; minutes: number; isOverdue: boolean }`
  - `export function normalizeVietnameseText(input: string): string`
  - `export function resolveOrderAge(createdAt: string, status: OrderStatus, nowMs?: number): OrderAgeBadge | null`
  - `export const viewport: Viewport = { themeColor: '#EEEADF' }` in `apps/web/src/app/layout.tsx`
  - CSS utility classes `.bg-paper-grain`, `.shadow-paper-rest`, `.shadow-paper-lift` in `apps/web/src/app/globals.css` and `apps/admin/src/index.css`

- [ ] **Step 1: Write failing tests in `packages/shared/src/index.test.ts` and `apps/web/src/lib/web-review.test.ts`**

Add unit assertions in `packages/shared/src/index.test.ts`:
```ts
it('normalizes Vietnamese diacritics/Đ and resolves order age SLA badges safely across clock skew, invalid dates, and terminal statuses', () => {
  expect(normalizeVietnameseText('  Đức Trọng — Sữa Tươi Đường Đen  ')).toBe(
    'duc trong — sua tuoi duong den',
  );
  const baseNow = Date.parse('2026-11-19T08:30:00.000Z');
  expect(resolveOrderAge('2026-11-19T08:35:00.000Z', 'pending', baseNow)).toEqual({
    label: 'Vừa đặt',
    minutes: 0,
    isOverdue: false,
  });
  expect(resolveOrderAge('2026-11-19T08:09:00.000Z', 'pending', baseNow)).toEqual({
    label: '21 phút trước',
    minutes: 21,
    isOverdue: true,
  });
  expect(resolveOrderAge('2026-11-19T07:00:00.000Z', 'completed', baseNow)).toEqual({
    label: '1 giờ 30 phút trước',
    minutes: 90,
    isOverdue: false,
  });
  expect(resolveOrderAge('not-a-date', 'pending', baseNow)).toBeNull();
});
```
And in `apps/web/src/lib/web-review.test.ts`, import `viewport` from `../app/layout` and assert `expect(viewport.themeColor).toBe('#EEEADF')` plus `expect(globalsCss).toContain('--shadow-paper-rest')` and `expect(globalsCss).toContain('bg-paper-grain')`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/shared test && pnpm --filter @omsua/web test src/lib/web-review.test.ts`
Expected: FAIL (`normalizeVietnameseText` / `resolveOrderAge` / `viewport` not exported).

- [ ] **Step 3: Implement `packages/shared/src/text-and-time.ts`, re-export from `@omsua/shared`, and add "Sương Sớm Cầu Đất" theme tokens**

1. In `packages/shared/src/text-and-time.ts`, implement:
   - `normalizeVietnameseText(input: string): string` (`NFD` strip `[\u0300-\u036f]`, map `đ`/`Đ` -> `d`, lowercase, collapse whitespace, trim).
   - `resolveOrderAge(createdAt: string, status: OrderStatus, nowMs = Date.now()): OrderAgeBadge | null`: return `null` if `!Number.isFinite(Date.parse(createdAt))`; compute `minutes = Math.max(0, Math.floor((nowMs - parsedMs) / 60_000))`; format `label` as `'Vừa đặt'` (`minutes < 1`), `` `${minutes} phút trước` `` (`minutes < 60`), `` `${hours} giờ trước` `` (`rem === 0` and `< 24h`), `` `${hours} giờ ${rem} phút trước` `` (`< 24h`), or `` `${days} ngày trước` `` (`>= 24h`); set `isOverdue = (status === 'pending' || status === 'preparing') && minutes > 15`.
2. Export both from `packages/shared/src/index.ts`, build `@omsua/shared` (`pnpm build:shared`), and update `apps/admin/src/lib/text.ts` so `normalizeSearchText` delegates directly to `normalizeVietnameseText`.
3. In `apps/web/src/app/globals.css` and `apps/admin/src/index.css`, define `--shadow-paper-rest` and `--shadow-paper-lift` using warm espresso/olive RGBA (`rgba(41, 38, 29, ...)` / `rgba(89, 76, 0, ...)` — zero `rgb(0,0,0)`), `.shadow-paper-rest`, `.shadow-paper-lift`, `.bg-paper-grain` (inline data-URI SVG `feTurbulence` tinted `#594C00` at `opacity="0.024"`), and `h1, h2, h3 { text-wrap: balance; }`.
4. Export `export const viewport: Viewport = { themeColor: '#EEEADF' }` in `apps/web/src/app/layout.tsx`, and add `<meta name="theme-color" content="#EEEADF" />` to `apps/admin/index.html`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm build:shared && pnpm --filter @omsua/shared test && pnpm --filter @omsua/web test src/lib/web-review.test.ts && pnpm --filter @omsua/admin test`
Expected: PASS across all suites.

- [ ] **Step 5: Commit**

```bash
git add packages/shared apps/web/src/app/globals.css apps/web/src/app/layout.tsx apps/web/src/lib/web-review.test.ts apps/admin/src/index.css apps/admin/index.html apps/admin/src/lib/text.ts
git commit -m "feat(shared,web,admin): add Sương Sớm Cầu Đất theme tokens, viewport themeColor, and shared search/SLA helpers"
```

---

### Task 2: Seeded “Sương Sớm Atiso” Mist Canvas, Editorial Hero & CLS-Zero `ProductMedia`

**Files:**
- Create: `docs/superpowers/specs/art/suong-som-atiso-algorithmic-philosophy.md`
- Create: `apps/web/src/components/artwork/DalatMorningMistCanvas.tsx`
- Create: `apps/web/src/components/artwork/DalatMorningMistCanvas.test.tsx`
- Modify: `apps/web/src/components/artwork/ProductMedia.tsx`, `apps/web/src/components/artwork/ProductMedia.test.tsx`
- Modify: `apps/web/src/components/storefront/StorefrontHeader.tsx`, `apps/web/src/components/storefront/HeroSpotlight.tsx`
- Modify: `apps/web/src/components/storefront/storefront-sections.test.tsx`

**Interfaces:**
- Consumes: `OMSUA_COLORS`, `getProductPhoto` from `@omsua/shared`; `.shadow-paper-rest` / `.shadow-paper-lift` from Task 1
- Produces:
  - `export interface DalatMorningMistCanvasProps { seed?: number; className?: string; defaultPaused?: boolean }`
  - `export function DalatMorningMistCanvas(props: DalatMorningMistCanvasProps): JSX.Element`
  - `ProductMedia` renders explicit `width` & `height` (`spotlight`: `640x480`, `card`: `320x380`, `snack`: `480x480`, `topping`: `256x256`) and sets `loading="eager"` + `fetchPriority="high"` when `variant === 'spotlight'`

- [ ] **Step 1: Write failing tests in `DalatMorningMistCanvas.test.tsx`, `ProductMedia.test.tsx`, and `storefront-sections.test.tsx`**

1. Create `apps/web/src/components/artwork/DalatMorningMistCanvas.test.tsx` testing:
   - Renders without throwing in JSDOM (`getContext` returning `null`), marks the `<canvas>` `aria-hidden="true"`, and exposes a `min-h-11` button `aria-label="Tạm dừng hiệu ứng sương sớm"` (`aria-pressed="false"`) that toggles to `"Bật hiệu ứng sương sớm"` (`aria-pressed="true"`) on click.
   - When `window.matchMedia('(prefers-reduced-motion: reduce)')` matches `true`, renders the static botanical mist SVG (`data-reduced-motion="true"`) and never calls `requestAnimationFrame`.
2. In `apps/web/src/components/artwork/ProductMedia.test.tsx`, assert:
   - Default `variant="card"` sets `width="320"`, `height="380"`, `loading="lazy"`.
   - `variant="spotlight"` sets `width="640"`, `height="480"`, `loading="eager"`, and `fetchpriority="high"`.
3. In `apps/web/src/components/storefront/storefront-sections.test.tsx`, assert:
   - `StorefrontHeader` wraps `"Ốm sữa"` with `translate="no"`, sets `data-cart-pulse="true"` briefly when `cartItemCount` increases on rerender (`1 -> 2`), and has zero `text-[10px]` classes.
   - `HeroSpotlight` renders `DalatMorningMistCanvas` toggle button, displays highland stamp `/ĐÀ LẠT • 1\.500M/i`, and its `+ Đặt ngay` buttons retain `min-h-11` without `sm:min-h-9`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/artwork/DalatMorningMistCanvas.test.tsx src/components/artwork/ProductMedia.test.tsx src/components/storefront/storefront-sections.test.tsx`
Expected: FAIL (`DalatMorningMistCanvas` missing; `ProductMedia` missing `width`/`height`/`fetchPriority`).

- [ ] **Step 3: Author the algorithmic philosophy and implement `DalatMorningMistCanvas`, `ProductMedia`, `StorefrontHeader`, and `HeroSpotlight`**

1. Write `docs/superpowers/specs/art/suong-som-atiso-algorithmic-philosophy.md` (5 concise paragraphs articulating *"Sương Sớm Atiso"*: seeded `mulberry32` determinism, multi-octave trigonometric flow vectors, `137.5°` golden-angle phyllotaxis drift, `#F4E3AD` / `#7A8B3B` / `#D96B1E` luminous traces over `#29261D` highland dusk, and master-level computational restraint).
2. Implement `apps/web/src/components/artwork/DalatMorningMistCanvas.tsx`:
   - Deterministic `mulberry32(seed = 2017)` initializing 36 mist ribbons & botanical motes in `#F4E3AD`, `#7A8B3B`, `#D96B1E` (zero `#FFFFFF`/`#000000`).
   - Checks `matchMedia('(prefers-reduced-motion: reduce)')` and `IntersectionObserver` so offscreen or reduced-motion states run zero `requestAnimationFrame` ticks; renders a quiet static SVG contour fallback when reduced motion is active, plus a compact `min-h-11` pill button (`aria-pressed={isPaused}`, `aria-label={isPaused ? 'Bật hiệu ứng sương sớm' : 'Tạm dừng hiệu ứng sương sớm'}`).
3. Update `apps/web/src/components/artwork/ProductMedia.tsx` with `DIMENSIONS_BY_VARIANT` (`spotlight: { width: 640, height: 480 }`, `card: { width: 320, height: 380 }`, `snack: { width: 480, height: 480 }`, `topping: { width: 256, height: 256 }`) and `loading={variant === 'spotlight' ? 'eager' : 'lazy'}` + `fetchPriority={variant === 'spotlight' ? 'high' : undefined}`.
4. Update `StorefrontHeader.tsx` (`<span translate="no" ...>Ốm sữa</span>`, `tabular-nums` + subtle scale pulse `data-cart-pulse` when `cartItemCount` increments, replace `text-[10px]` with `text-xs`) and `HeroSpotlight.tsx` (embed `<DalatMorningMistCanvas />` inside the `relative overflow-hidden rounded-3xl bg-hero-espresso` stage, add `"ĐÀ LẠT • 1.500M"` stamp pill, replace `text-[10px]` badge class with `text-xs`, remove `sm:min-h-9` on `+ Đặt ngay` / `Tạm hết`, add `tabular-nums` on spotlight prices).

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @omsua/web test src/components/artwork/DalatMorningMistCanvas.test.tsx src/components/artwork/ProductMedia.test.tsx src/components/storefront/storefront-sections.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/art/suong-som-atiso-algorithmic-philosophy.md apps/web/src/components/artwork/DalatMorningMistCanvas.tsx apps/web/src/components/artwork/DalatMorningMistCanvas.test.tsx apps/web/src/components/artwork/ProductMedia.tsx apps/web/src/components/artwork/ProductMedia.test.tsx apps/web/src/components/storefront/StorefrontHeader.tsx apps/web/src/components/storefront/HeroSpotlight.tsx apps/web/src/components/storefront/storefront-sections.test.tsx
git commit -m "feat(web): add seeded Sương Sớm Atiso mist canvas, CLS-zero ProductMedia priority, and editorial Hero polish"
```

---

### Task 3: Sticky Menu Search, URL Deep-Link Sync, Customizer Cup Gauge & Tactile Checkout Forms

**Files:**
- Modify: `apps/web/src/components/storefront/DrinkMenuSection.tsx`
- Modify: `apps/web/src/components/storefront/SnackMenuSection.tsx`
- Modify: `apps/web/src/components/storefront/ToppingStripSection.tsx`
- Modify: `apps/web/src/components/storefront/StorefrontClientShell.tsx`
- Modify: `apps/web/src/components/modals/ProductCustomizerModal.tsx`
- Modify: `apps/web/src/components/modals/CartCheckoutDrawer.tsx`
- Modify: `apps/web/src/components/modals/OrderLookupModal.tsx`
- Modify: `apps/web/src/components/modals/PhotoLightboxModal.tsx`
- Modify: `apps/web/src/components/storefront/storefront-sections.test.tsx`
- Modify: `apps/web/src/components/modals/ordering-flow.test.tsx`

**Interfaces:**
- Consumes: `normalizeVietnameseText` from `@omsua/shared` (Task 1)
- Produces:
  - `DrinkMenuSectionProps` adds optional `searchQuery?: string` and `onChangeSearchQuery?: (query: string) => void`
  - `ProductCustomizerModal` renders `data-testid="customizer-cup-gauge"` reflecting live `sugarLevel`, `iceLevel`, and selected topping count
  - `StorefrontClientShell` reads/writes `?cat=<DrinkCategoryId>&q=<string>&media=studio` cleanly via `window.history.replaceState`

- [ ] **Step 1: Write failing tests in `storefront-sections.test.tsx` and `ordering-flow.test.tsx`**

1. In `apps/web/src/components/storefront/storefront-sections.test.tsx`, add tests asserting:
   - Typing `"khuc bach"` (diacritic-free) in `getByRole('searchbox', { name: /Tìm nhanh thức uống/i })` filters `DrinkMenuSection` to `Trà Sữa Gạo Rang Khúc Bạch` and announces count via `role="status"`.
   - Searching `"atiso"` while `activeCategory="coffee"` renders empty state with `getByRole('button', { name: 'Xóa bộ lọc tìm kiếm' })`, which calls `onChangeSearchQuery('')` and `onChangeCategory('all')` (`Review Focus #3`).
   - Mounting `StorefrontClientShell` when `window.location.search === '?cat=invalid-cat&q=%20%20&media=foo'` clamps to `Tất cả (24)` active (`aria-pressed="true"`), empty search input, and `Ảnh thực tế` (`aria-pressed="true"`), while `?cat=coffee&media=studio` selects `Cà Phê Phin (6)` and `Minh họa Studio` (`Review Focus #1`).
   - Zero `sm:min-h-9` or `sm:min-h-10` classes remain on `DrinkMenuSection` and `SnackMenuSection` buttons.
2. In `apps/web/src/components/modals/ordering-flow.test.tsx`, add tests asserting:
   - `ProductCustomizerModal` renders `getByTestId('customizer-cup-gauge')` displaying `70% đường` & `70% đá`, updating live to `30% đường` & `0% đá` when `30% Ít` and `0% Đá riêng` are clicked.
   - `CartCheckoutDrawer` inputs expose `autoComplete="name"`, `autoComplete="tel"` + `inputMode="tel"`, `autoComplete="street-address"`, and `autoComplete="off"` (on `note`), use `'Đang xử lý đơn hàng…'` with typographic `…`, and when submitted blank move `document.activeElement` to the first invalid input (`customerName`, `aria-invalid="true"`) (`Review Focus #4`).

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/storefront/storefront-sections.test.tsx src/components/modals/ordering-flow.test.tsx`
Expected: FAIL (missing `searchbox`, `customizer-cup-gauge`, URL clamping, and focus-first-invalid behavior).

- [ ] **Step 3: Implement sticky search + URL sync, Customizer Cup Gauge, and checkout form UX**

1. **`DrinkMenuSection.tsx` & `SnackMenuSection.tsx` & `ToppingStripSection.tsx`:**
   - Add controlled/optional `searchQuery` (`default ''`) + `<input type="search" aria-label="Tìm nhanh thức uống" autoComplete="off" placeholder="Tìm món: atiso, me, kem trứng, khúc bạch…" />` inside a sticky discovery bar (`sticky top-[68px] z-30 rounded-2xl border border-olive-primary/15 bg-canvas-cream/95 p-3 backdrop-blur-md`).
   - Filter drinks using `normalizeVietnameseText(`${drink.name} ${drink.englishName} ${drink.description}`)`; skip empty category blocks when `searchQuery.trim()` is non-empty; render `role="status"` match announcement and `"Xóa bộ lọc tìm kiếm"` recovery button when `totalVisibleDrinks === 0`.
   - Remove all `sm:min-h-9` / `sm:min-h-10` classes, lift `text-[9px]`/`text-[10px]`/`text-[11px]` badges to `text-xs`, and add `tabular-nums` on prices.
2. **`StorefrontClientShell.tsx`:**
   - Read `window.location.search` inside `useEffect` on mount (avoiding SSR hydration mismatch), clamping `cat` against valid `DrinkCategoryId`s (`'milk-tea' | 'fruit-tea' | 'fresh-milk-blended' | 'coffee'`), trimming `q`, and checking `media === 'studio'`; sync subsequent changes back to URL via `window.history.replaceState(null, '', nextUrl)`.
   - Add safe-area bottom padding `pb-[max(0.75rem,env(safe-area-inset-bottom))]` on the mobile sticky cart bar and `bg-paper-grain` on the shell wrapper.
3. **`ProductCustomizerModal.tsx`, `CartCheckoutDrawer.tsx`, `OrderLookupModal.tsx`, `PhotoLightboxModal.tsx`:**
   - Add `overscroll-contain` to scrollable modal/drawer bodies.
   - Add `data-testid="customizer-cup-gauge"` inside `ProductCustomizerModal.tsx` (for `product.kind === 'drink'`) showing dual horizontal meter bars (`transform: scaleX(...)`, `origin-left`, `transition-transform`) for `Đường` (`70`/`50`/`30`/`0`) and `Đá` (`70`/`50`/`30`/`0`) plus selected topping pills.
   - Add `refs` (`nameRef`, `phoneRef`, `addressRef`, `noteRef`), `fieldErrors` state, `aria-invalid`, `autoComplete`, `inputMode="tel"`, `spellCheck={false}`, `…` placeholders/loading copy (`'Đang xử lý đơn hàng…'`), and `.focus()` on the first invalid field in `CartCheckoutDrawer.tsx`; remove `sm:min-h-9` on `Gỡ món tạm hết`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @omsua/web test`
Expected: PASS across all `@omsua/web` test files.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/storefront apps/web/src/components/modals
git commit -m "feat(web): add sticky menu search, URL state sync, customizer cup gauge, and checkout form ergonomics"
```

---

### Task 4: Botanical Press Printable Menu Artifact (`canvas-design`) & Admin Barista Cockpit SLA Upgrade

**Files:**
- Create: `docs/superpowers/specs/art/dalat-botanical-press-philosophy.md`
- Create: `scripts/generate-brand-poster.py`
- Create: `apps/web/public/brand/omsua-botanical-menu-poster.pdf`
- Create: `apps/web/public/brand/omsua-botanical-menu-poster.png`
- Modify: `apps/web/src/components/storefront/BrandStorySection.tsx`, `apps/web/src/components/storefront/BrandFooter.tsx`
- Modify: `apps/admin/src/layouts/AdminLayout.tsx`, `apps/admin/src/pages/OrdersPage.tsx`, `apps/admin/src/pages/MenuPage.tsx`, `apps/admin/src/pages/BranchesPage.tsx`
- Modify: `apps/web/src/lib/fanpage-assets.test.ts`, `apps/web/src/components/storefront/storefront-sections.test.tsx`, `apps/admin/src/App.test.tsx`

**Interfaces:**
- Consumes: `resolveOrderAge`, `OMSUA_COLORS`, `OMSUA_PRODUCTS`, `OMSUA_BRANCHES` from `@omsua/shared` (Task 1)
- Produces:
  - Static downloadable assets `/brand/omsua-botanical-menu-poster.pdf` & `/brand/omsua-botanical-menu-poster.png`
  - `BrandStorySection` download link `role="link"` matching `/Tải Menu Ấn Phẩm Đà Lạt \(PDF\)/i`
  - `OrdersPage` renders `resolveOrderAge` badge (`data-testid="order-age-badge"`) on each order card

- [ ] **Step 1: Write failing tests in `fanpage-assets.test.ts`, `storefront-sections.test.tsx`, and `apps/admin/src/App.test.tsx`**

1. In `apps/web/src/lib/fanpage-assets.test.ts`, assert `apps/web/public/brand/omsua-botanical-menu-poster.pdf` exists (`> 10 KB`, header `%PDF-`) and `omsua-botanical-menu-poster.png` exists (`> 15 KB`, PNG header `\x89PNG`, dimensions `>= 1200x1600`).
2. In `apps/web/src/components/storefront/storefront-sections.test.tsx`, assert `BrandStorySection` renders `<a href="/brand/omsua-botanical-menu-poster.pdf" download>` (`Tải Menu Ấn Phẩm Đà Lạt (PDF)`) and `BrandFooter` branch `<img>` elements have `width="960"` and `height="540"`.
3. In `apps/admin/src/App.test.tsx`, assert `OrdersPage` renders `within(orderCard).getByTestId('order-age-badge')` displaying overdue highlight (`Quá hạn •` / `phút trước`) for old `pending` orders while `completed` orders never show `Quá hạn` (`Review Focus #5`), and `BranchesPage` branch `<img>` elements have `width="960"` and `height="540"`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/lib/fanpage-assets.test.ts src/components/storefront/storefront-sections.test.tsx && pnpm --filter @omsua/admin test`
Expected: FAIL (missing PDF/PNG poster, missing download link, missing `order-age-badge`).

- [ ] **Step 3: Generate Botanical Press PDF/PNG poster and upgrade `BrandStorySection`, `BrandFooter`, and `@omsua/admin`**

1. Write `docs/superpowers/specs/art/dalat-botanical-press-philosophy.md` (5 paragraphs articulating *"Đà Lạt Botanical Press"* per `canvas-design/SKILL.md`: herbarium specimen framing, concentric artichoke phyllotaxis rings, warm cream paper `#EEEADF` + olive ink `#594C00` + terracotta seal `#D96B1E`, zero pure white/black, museum-grade typographic restraint).
2. Create `scripts/generate-brand-poster.py` using Python (`PIL` / `reportlab` or Cairo/Pillow PDF+PNG export with TrueType fonts from `/home/fedora/.gemini/config/plugins/anthropic-dev-skills/skills/canvas-design/canvas-fonts/` — specifically `Lora-Bold.ttf`, `Lora-Italic.ttf`, `Lora-Regular.ttf`, `DMMono-Regular.ttf` which support Vietnamese glyphs cleanly — verify visually via `read_file` on the generated `.png` so zero overlapping text or tofu boxes occur!) to generate `apps/web/public/brand/omsua-botanical-menu-poster.pdf` & `.png`.
3. Update `BrandStorySection.tsx` (connected botanical timeline connector across the 3 story pillars, `text-xs` badge floor, and `<a href="/brand/omsua-botanical-menu-poster.pdf" download>` CTA) and `BrandFooter.tsx` (`width={960} height={540}` on branch `<img>`).
4. Update `apps/admin/src/pages/OrdersPage.tsx` (render `data-testid="order-age-badge"` via `resolveOrderAge(order.createdAt, order.status)` with `Quá hạn • ${age.label}` in `bg-coral-sketch/30 text-espresso border-terracotta/40` when `age.isOverdue` is true, plus `tabular-nums` on all KPI cards & order totals), `BranchesPage.tsx` (`width={960} height={540}` on branch `<img>` + `tabular-nums` stats), `MenuPage.tsx` & `AdminLayout.tsx` (`bg-paper-grain`, lift `text-[11px]` to `text-xs`).

- [ ] **Step 4: Run tests and visually inspect `omsua-botanical-menu-poster.png` via `read_file`**

Run: `python3 scripts/generate-brand-poster.py && pnpm --filter @omsua/web test src/lib/fanpage-assets.test.ts src/components/storefront/storefront-sections.test.tsx && pnpm --filter @omsua/admin test`
Expected: PASS, and `read_file` on `apps/web/public/brand/omsua-botanical-menu-poster.png` shows crisp Vietnamese diacritics, zero overlaps, and warm `#EEEADF` paper aesthetic.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/art/dalat-botanical-press-philosophy.md scripts/generate-brand-poster.py apps/web/public/brand apps/web/src/components/storefront/BrandStorySection.tsx apps/web/src/components/storefront/BrandFooter.tsx apps/web/src/lib/fanpage-assets.test.ts apps/web/src/components/storefront/storefront-sections.test.tsx apps/admin/src
git commit -m "feat(web,admin,brand): add Botanical Press printable menu PDF/PNG and Admin order-age SLA badges"
```

---

### Task 5: Accessibility Zero-Defect Gate (`a11y-debugging`), Automated Guidelines Scanner & Companion Studio Artifacts

**Files:**
- Modify: `apps/web/src/components/storefront/FanpageGallerySection.tsx`
- Modify: `apps/web/src/components/storefront/fanpage-gallery.test.tsx`
- Modify: `apps/web/src/lib/web-review.test.ts`
- Modify: `README.md`
- Create (Artifacts dir `/home/fedora/.gemini/antigravity/brain/a20b42eb-19ae-49c8-87e4-fb942ba78bbf/`):
  - `suong-som-atiso-p5-studio.html` (`algorithmic-art` standalone viewer from `templates/viewer.html`)
  - `omsua-design-system-playground.html` (`web-artifacts-builder` standalone React + Tailwind + shadcn/ui `bundle.html`)

**Interfaces:**
- Consumes: All components & tokens from Tasks 1–4
- Produces:
  - `FanpageGallerySection` `<article>` cards where each `<button>`'s visible text (`item.title`) matches the exact prefix of its accessible name (`"{item.title} — Xem ảnh lớn"`), resolving Axe/Lighthouse `label-content-name-mismatch` (`score === 1`)
  - Static `web-design-guidelines` scanner in `apps/web/src/lib/web-review.test.ts`

- [ ] **Step 1: Write failing tests in `fanpage-gallery.test.tsx` and `web-review.test.ts`**

1. In `apps/web/src/components/storefront/fanpage-gallery.test.tsx`, assert:
   - Each gallery trigger `<button>` (`getAllByRole('button', { name: /— Xem ảnh lớn$/i })`) does **not** contain `item.caption` inside the `<button>` element itself (instead `item.caption` renders in the sibling `<p>` inside the parent `<article>`), and its `<img>` carries explicit `width="800"` and `height="1000"`.
2. In `apps/web/src/lib/web-review.test.ts`, add static source checks across all `.tsx` files in `apps/web/src` asserting:
   - Zero occurrences of `/\bsm:min-h-(9|10)\b/` (no `<44px` breakpoint regressions).
   - Zero occurrences of `/\btext-\[(9|10)px\]/` (no illegible sub-11px micro-badges).
   - Zero occurrences of `/\btransition-all\b/` (compositor/explicit transitions only).
   - Zero occurrences of `Đang xử lý đơn hàng...` (must use typographic `…`).

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/storefront/fanpage-gallery.test.tsx src/lib/web-review.test.ts`
Expected: FAIL (`FanpageGallerySection` still nests `caption` inside `<button>` and lacks `width`/`height` on gallery `<img>`).

- [ ] **Step 3: Refactor `FanpageGallerySection.tsx`, update `README.md`, and generate Companion Studio Artifacts**

1. In `apps/web/src/components/storefront/FanpageGallerySection.tsx`, wrap each gallery card in `<article className="group flex flex-col overflow-hidden rounded-2xl border border-olive-primary/12 bg-canvas-cream shadow-paper-rest transition-colors hover:border-olive-primary/35">`:
   - `<button type="button" onClick={() => setLightboxIndex(index)} className="flex cursor-pointer flex-col text-left focus-visible:outline-offset-[-2px]">` containing the `aspect-[4/5]` image (`width={800} height={1000}`) + `<span className="px-3 pt-3 font-editorial text-xs font-semibold text-espresso sm:text-sm">{item.title}<span className="sr-only"> — Xem ảnh lớn</span></span>`.
   - Below `</button>` inside `<article>`, render `<p className="px-3 pt-1 pb-3 line-clamp-2 text-xs leading-snug text-warm-muted">{item.caption}</p>`.
2. Audit any remaining `.tsx` files in `apps/web/src` so the new static `web-review.test.ts` rules pass 100%, and document the "Sương Sớm Cầu Đất" UI/UX upgrades, URL query parameters, Admin SLA badges, and `/brand/omsua-botanical-menu-poster.pdf` in `README.md`.
3. Generate the two standalone studio HTML artifacts in `/home/fedora/.gemini/antigravity/brain/a20b42eb-19ae-49c8-87e4-fb942ba78bbf/`:
   - Copy `/home/fedora/.gemini/config/plugins/anthropic-dev-skills/skills/algorithmic-art/templates/viewer.html` as the literal foundation for `suong-som-atiso-p5-studio.html`, keeping fixed header/sidebar/seed/actions intact and implementing the seeded p5.js *"Sương Sớm Atiso"* flow-field + phyllotaxis sketch and parameter sliders.
   - Run `web-artifacts-builder`'s `init-artifact.sh` + `bundle-artifact.sh` in `/tmp/omsua-ds-playground` (outside the git repo), building a multi-tab **Ốm Sữa Design System & Cup Customizer Playground** styled in the 14 `OMSUA_COLORS` (zero purple gradients, zero Inter), copy `bundle.html` to `/home/fedora/.gemini/antigravity/brain/a20b42eb-19ae-49c8-87e4-fb942ba78bbf/omsua-design-system-playground.html`, and delete `/tmp/omsua-ds-playground`.

- [ ] **Step 4: Run full monorepo gate + Live Chrome `a11y-debugging` audit**

1. Run: `pnpm --reporter=append-only build && pnpm --reporter=append-only typecheck && pnpm --reporter=append-only lint && pnpm --reporter=append-only test`
   Expected: Exit `0`, all tests PASS across `@omsua/shared`, `@omsua/backend`, `@omsua/web`, and `@omsua/admin`.
2. Run live Chrome QA (`browser` subagent using `lighthouse_audit`, `take_snapshot`, `press_key` `Tab`/`Shift+Tab`, `list_console_messages` `types: ["issue"]` — never `evaluate_script`) on `http://localhost:3000/` & `http://localhost:3001/`:
   Expected: `0` console/network errors, `label-content-name-mismatch` score `1`, `image-aspect-ratio` score `1`, `Best Practices: 100`, `SEO: 100`, `Accessibility >= 96`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/storefront/FanpageGallerySection.tsx apps/web/src/components/storefront/fanpage-gallery.test.tsx apps/web/src/lib/web-review.test.ts README.md
git commit -m "fix(web,docs): resolve gallery WCAG label-content-name-mismatch and enforce Web Interface Guidelines scanner"
```
