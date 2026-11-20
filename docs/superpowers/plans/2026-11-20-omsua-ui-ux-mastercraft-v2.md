# Ốm Sữa UI/UX Mastercraft v2 (“Bản Khắc Cao Nguyên”) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate `@omsua/web`, `@omsua/admin`, print collateral, and interactive studio artifacts to **Lighthouse Accessibility `100/100`** and artisanal editorial quality using the 8 requested UI/UX skills (`frontend-design`, `web-design-guidelines`, `a11y-debugging`, `theme-factory`, `generative_ui`, `web-artifacts-builder`, `canvas-design`, `algorithmic-art`), then auto-deploy to Vercel & Render.

**Architecture:** Introduce 3 WCAG AA-calibrated companion ink tokens (`#A84B0D`, `#4D5922`, `#805B1A`) via `@theme` CSS variables and replace the last `<div role="button">` anti-pattern in `BrandFooter.tsx`, reshape the 6 uniform Storefront boxes into a 4-surface Đà Lạt editorial rhythm with `/` keyboard search + `?mood=` flavor matching, add a live SVG layered cup visualizer in `CustomizerCompound.tsx` + 1-click reorder in `OrderLookupModal.tsx`, upgrade Admin with URL-synced filters + compact kitchen tickets + `@media print` prep slips, and ship a 2-page Botanical Lookbook PDF + p5.js Gallery Studio + bundled React Workbench.

**Tech Stack:** Next.js 15 App Router, React 19, Vite 6 + React Router 7, Tailwind CSS v4 (`@theme`), Vitest + Testing Library, Python 3 (`scripts/generate-brand-poster.py`), HTML5 `<canvas>` + p5.js Studio Viewer, Parcel (`web-artifacts-builder`).

**Spec:** `docs/superpowers/specs/2026-11-20-omsua-ui-ux-mastercraft-v2-design.md` (and `docs/superpowers/specs/themes/ban-khac-cao-nguyen-theme.md`)

## Global Constraints

- Node.js `>= 22.5.0` (`.node-version` = `22`) and `pnpm@12.18.0`; install zero new runtime npm packages inside `packages/shared`, `apps/backend`, `apps/web`, or `apps/admin`.
- Zero pure white or black tokens (`#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)`, `*-white`, `*-black`) anywhere in repository files, CSS (`@media print` included), SVG artwork, or generated PDF/PNG plates.
- Minimum `12px` (`text-xs`) font-size floor and `>= 44px` (`min-h-11`) touch targets on all interactive controls; zero `transition-all`, `forwardRef`, or `useContext`.
- Preserve all `182+` existing automated tests (`pnpm build && pnpm typecheck && pnpm lint && pnpm test`) and never kill running user dev servers on `:3000`, `:3001`, `:4000`.

## Review Focus

1. **Pressing `/` while typing inside an `<input>`, `<textarea>`, `<select>`, or while a modal dialog (`ProductCustomizerModal` / `CartCheckoutDrawer` / `OrderLookupModal` / `PhotoLightboxModal`) is open:** The `/` keyboard shortcut in `DrinkMenuSection` must be a strict no-op whenever focus is inside an editable control, `Ctrl`/`Meta`/`Alt` is held, or `aria-modal="true"` is mounted in the DOM (tested in Task 2).
2. **Malformed `?mood=` query parameter on Storefront (`/?mood=unknown`) or `?status=`/`?branch=`/`?cat=`/`?avail=` on Admin (`/?status=bogus&branch=nope`):** Both `parseUrlMenuState` (Web) and `OrdersPage` / `MenuPage` URL readers (Admin) must clamp unrecognized query values safely to `'all'` without crashing or writing invalid params back to the URL (tested in Tasks 2 & 4).
3. **1-click Quick Reorder (`Đặt lại giỏ món này`) when some or all items in a past `OrderRecord` have since been toggled `isAvailable: false` (or a topping was disabled):** `StorefrontClientShell` must filter out unavailable products and unavailable toppings before calling `addItem`; if `0` items remain available, keep `OrderLookupModal` open and render a clear Vietnamese warning banner instead of opening an empty `CartCheckoutDrawer` (tested in Task 3).
4. **Screen-reader heading hierarchy vs `<button aria-pressed>` contract on `BrandFooter` branch cards:** Refactoring `<div role="button">` must keep `<h3>{branch.name}</h3>` OUTSIDE `<button>` so the Accessibility Tree preserves all four `<h3>` landmarks while a native `<button type="button" aria-pressed={isSelected}>` inside each `<article>` still matches `getByRole('button', { name: /Cơ sở 1 — Hoàng Diệu/i })` (tested in Task 1).
5. **Printing a single kitchen ticket (`In phiếu bếp`) on `OrdersPage` when 10+ orders are displayed:** Clicking `In phiếu bếp` on order `A` must mark only order `A` with `data-print-active="true"`, invoke `window.print()`, and clean up `data-print-active` on `afterprint` (or next render) while `@media print` hides sidebar/header/non-active cards using warm `#F7F4EC`/`#29261D` tokens with zero `#fff`/`#000` (tested in Task 4).

---

## Planned File Structure

- **Create:**
  - `docs/superpowers/specs/themes/ban-khac-cao-nguyen-theme.md` — Theme Factory v2 WCAG AA palette & typography specification.
  - `docs/superpowers/specs/2026-11-20-omsua-ui-ux-mastercraft-v2-design.md` — Full 8-skill architectural specification.
- **Modify (`@omsua/web`):**
  - `apps/web/src/app/globals.css` — Add `--color-terracotta-deep: #A84B0D`, `--color-artichoke-deep: #4D5922`, `--color-ochre-deep: #805B1A` in `@theme`.
  - `apps/web/src/components/storefront/StorefrontHeader.tsx` — Explicit `bg-surface-light text-espresso` on `<select>`/`<option>` for OS dark-mode legibility and WCAG AA CTA fill (`bg-terracotta-deep`).
  - `apps/web/src/components/storefront/HeroSpotlight.tsx` — Perforated highland altitude stamp strip + WCAG AA badge/CTA fills (`bg-terracotta-deep`, `bg-artichoke-deep`).
  - `apps/web/src/components/storefront/DrinkMenuSection.tsx` — Flavor Mood (`FlavorMoodId`) filter pills, `/` keyboard search shortcut + `<kbd>/</kbd>` hint, WCAG AA badges/prices/taupe-card subtitles.
  - `apps/web/src/components/storefront/ToppingStripSection.tsx` — Warm butter-parchment counter surface (`bg-card-butter/45 border-y`) + WCAG AA `bg-artichoke-deep` `+ Chọn` buttons & `text-ochre-deep` subtitle.
  - `apps/web/src/components/storefront/SnackMenuSection.tsx` — WCAG AA price/badge contrast (`bg-terracotta-deep`, `bg-artichoke-deep`).
  - `apps/web/src/components/storefront/BrandStorySection.tsx` — Open broadsheet editorial spread on paper-grain canvas (`border-y`, no nested SaaS card wrapper) + WCAG AA step badges (`bg-artichoke-deep`, `text-ochre-deep`).
  - `apps/web/src/components/storefront/FanpageGallerySection.tsx` — Editorial Bento Lookbook grid (`sm:col-span-2 sm:row-span-2` hero lead tile in `'all'` view) preserving 1-to-1 `gallery-photo-${id}` `<AppViewTransition>`.
  - `apps/web/src/components/storefront/BrandFooter.tsx` — Semantic `<article>` + native `<button type="button" aria-pressed>` branch selector + WCAG AA contrast on footer metadata & hotline.
  - `apps/web/src/components/storefront/StorefrontClientShell.tsx` — Sync `?mood=` URL state + wire `handleReorderFromLookup(order)` into `OrderLookupModal`.
  - `apps/web/src/components/modals/customizer/CustomizerCompound.tsx` — Upgrade `CustomizerCupGauge` with live layered cross-section `<svg data-testid="customizer-cup-svg">` (Size scale, drink base tint, sugar caramel meniscus, floating ice cubes, bottom/top topping layer) + WCAG AA fills.
  - `apps/web/src/components/modals/OrderLookupModal.tsx` & `apps/web/src/components/modals/checkout/CheckoutCompound.tsx` — Add 1-click `Đặt lại giỏ món này` button + unavailable-reorder notice + WCAG AA button/price fills.
  - `apps/web/src/components/artwork/DalatMorningMistCanvas.tsx` — Add gentle pointer-breeze vector nudge (`onPointerMove` normalized coordinates, disabled on `prefers-reduced-motion` / paused) + golden-angle (`137.5°`) botanical spore drift.
- **Modify (`@omsua/admin` & Collateral):**
  - `apps/admin/src/index.css` — Add `--color-terracotta-deep`, `--color-artichoke-deep`, `--color-ochre-deep` + `@media print` single-ticket barista prep slip styles (warm `#F7F4EC` / `#29261D`, zero pure B/W).
  - `apps/admin/src/layouts/AdminLayout.tsx`, `apps/admin/src/pages/OrdersPage.tsx`, `apps/admin/src/pages/MenuPage.tsx`, `apps/admin/src/pages/BranchesPage.tsx`, `apps/admin/src/pages/SettingsPage.tsx` — URL-synced filters (`useSearchParams`), Compact Kitchen Ticket mode (`Chế độ Thẻ Bếp gọn`), `In phiếu bếp` print trigger, explicit `<option>` colors, and WCAG AA `100/100` contrast tokens.
  - `scripts/generate-brand-poster.py` & `apps/web/public/brand/omsua-botanical-menu-poster.{pdf,png}` — Upgrade to a 2-page Museum Botanical Lookbook & 4-Branch Altitude Menu PDF.

---

### Task 1: WCAG AA `100/100` Botanical Theme Calibration, Semantic Footer Branch Buttons & OS `<select>` Contrast (`theme-factory` + `a11y-debugging` + `web-design-guidelines`)

**Files:**
- Modify: `apps/web/src/app/globals.css`, `apps/web/src/components/storefront/StorefrontHeader.tsx`, `apps/web/src/components/storefront/HeroSpotlight.tsx`, `apps/web/src/components/storefront/DrinkMenuSection.tsx`, `apps/web/src/components/storefront/ToppingStripSection.tsx`, `apps/web/src/components/storefront/SnackMenuSection.tsx`, `apps/web/src/components/storefront/BrandStorySection.tsx`, `apps/web/src/components/storefront/BrandFooter.tsx`, `apps/web/src/components/modals/customizer/CustomizerCompound.tsx`, `apps/web/src/components/modals/checkout/CheckoutCompound.tsx`, `apps/web/src/components/modals/OrderLookupModal.tsx`
- Test: `apps/web/src/lib/web-review.test.ts`, `apps/web/src/components/storefront/storefront-sections.test.tsx`

**Interfaces:**
- Consumes: `OMSUA_COLORS` from `@omsua/shared`
- Produces:
  - `@theme` CSS tokens in `apps/web/src/app/globals.css`: `--color-terracotta-deep: #A84B0D`, `--color-artichoke-deep: #4D5922`, `--color-ochre-deep: #805B1A`
  - Semantic `<article>` + native `<button type="button" aria-pressed={isSelected}>` inside `BrandFooter.tsx` keeping `<h3>{branch.name}</h3>` outside `<button>`

- [ ] **Step 1: Write failing WCAG contrast & semantic DOM tests in `web-review.test.ts` and `storefront-sections.test.tsx`**

1. In `apps/web/src/lib/web-review.test.ts`, add assertions verifying `globals.css` defines `--color-terracotta-deep: #A84B0D`, `--color-artichoke-deep: #4D5922`, and `--color-ochre-deep: #805B1A` whose computed WCAG luminance contrast ratios against `#F7F4EC` and `#EEEADF` are all `>= 4.5`, and scan `apps/web/src` to forbid `<div` with `role="button"` (`/\<div[^>]*\brole=["']button["']/`) and forbid low-contrast `bg-terracotta text-surface-light`, `bg-artichoke text-surface-light`, and `text-subhead-ochre` on small text.
2. In `apps/web/src/components/storefront/storefront-sections.test.tsx`, assert that in `BrandFooter` (with `onSelectBranch`), all 4 `<h3>` branch headings remain outside `<button>` elements while `getByRole('button', { name: /Cơ sở 1 — Hoàng Diệu/i })` is a native `HTMLButtonElement` (`tagName === 'BUTTON'`) with `aria-pressed="true"` (`Review Focus #4`), and `<select id="storefront-branch-select">` renders `<option>` elements with explicit `bg-surface-light text-espresso`.

- [ ] **Step 2: Run Web tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/lib/web-review.test.ts src/components/storefront/storefront-sections.test.tsx`
Expected: FAIL (`--color-terracotta-deep` missing, `BrandFooter` uses `<div role="button">`, low-contrast utility pairs detected).

- [ ] **Step 3: Implement WCAG AA companion tokens, semantic `BrandFooter` `<button>`, and `<option>` styling**

1. Add `--color-terracotta-deep: #A84B0D`, `--color-artichoke-deep: #4D5922`, and `--color-ochre-deep: #805B1A` to `@theme` in `apps/web/src/app/globals.css`.
2. Replace `bg-terracotta` (where paired with `text-surface-light`) and small-text `text-terracotta` (on cream/light surfaces) with `bg-terracotta-deep` / `text-terracotta-deep`; replace `bg-artichoke` (where paired with `text-surface-light`) with `bg-artichoke-deep`; replace `text-subhead-ochre` with `text-ochre-deep`; ensure `DrinkMenuSection` category subtitle on `'coffee'` (`bg-card-taupe`) uses `text-espresso/85` instead of `text-warm-muted`; raise footer copyright `text-surface-light/65` to `text-surface-light/80` and footer hotline to `text-card-butter`.
3. Refactor `BrandFooter.tsx` branch cards into `<article>` containing `<h3>{branch.name}</h3>`, address, hotline, and (when `onSelectBranch` is provided) a native `<button type="button" aria-pressed={isSelected} aria-label={\`Chọn giao từ ${branch.name}\`} className="mt-3 inline-flex min-h-11 ...">`. Add `className="bg-surface-light text-espresso"` on `<option>` inside `StorefrontHeader.tsx`.

- [ ] **Step 4: Run Web tests to verify they pass**

Run: `pnpm --filter @omsua/web test src/lib/web-review.test.ts src/components/storefront/storefront-sections.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src docs/superpowers/specs/themes/ban-khac-cao-nguyen-theme.md docs/superpowers/specs/2026-11-20-omsua-ui-ux-mastercraft-v2-design.md docs/superpowers/plans/2026-11-20-omsua-ui-ux-mastercraft-v2.md
git commit -m "feat(web,a11y): calibrate WCAG AA botanical ink tokens and semantic branch buttons"
```

---

### Task 2: Editorial Spatial Rhythm, `/` Search Shortcut, `?mood=` Flavor Matcher & Bento Lookbook Gallery (`frontend-design` + `web-design-guidelines`)

**Files:**
- Modify: `apps/web/src/components/storefront/HeroSpotlight.tsx`, `apps/web/src/components/storefront/DrinkMenuSection.tsx`, `apps/web/src/components/storefront/ToppingStripSection.tsx`, `apps/web/src/components/storefront/BrandStorySection.tsx`, `apps/web/src/components/storefront/FanpageGallerySection.tsx`, `apps/web/src/components/storefront/StorefrontClientShell.tsx`
- Test: `apps/web/src/components/storefront/storefront-sections.test.tsx`, `apps/web/src/components/storefront/fanpage-gallery.test.tsx`

**Interfaces:**
- Produces:
  - `export type FlavorMoodId = 'all' | 'thanh-mat' | 'dam-vi' | 'tinh-tao'` and `export const FLAVOR_MOOD_OPTIONS` in `DrinkMenuSection.tsx`
  - Extended `DrinkMenuSectionProps`: `activeMood?: FlavorMoodId`, `onChangeMood?: (mood: FlavorMoodId) => void`
  - Extended URL state in `StorefrontClientShell.tsx`: `?cat=&mood=&q=&media=studio`

- [ ] **Step 1: Write failing tests in `storefront-sections.test.tsx` and `fanpage-gallery.test.tsx`**

1. In `storefront-sections.test.tsx`, add tests asserting:
   - `DrinkMenuSection` filters drinks by `FlavorMoodId` (`'thanh-mat'`, `'dam-vi'`, `'tinh-tao'`), syncs `?mood=dam-vi` in `StorefrontClientShell` while clamping `?mood=unknown` safely to `'all'` (`Review Focus #2`).
   - Pressing `/` on `window` focuses the `Tìm nhanh thức uống` searchbox, whereas pressing `/` inside an `<input>` or when a `[role="dialog"][aria-modal="true"]` is mounted does NOT steal focus (`Review Focus #1`).
   - `ToppingStripSection` uses a warm parchment band (`bg-card-butter/45`) and `BrandStorySection` renders as an open broadsheet editorial spread (`border-y`, not `rounded-3xl bg-surface-light`), breaking the 6-identical-boxes SaaS layout.
2. In `fanpage-gallery.test.tsx`, assert that in `'all'` filter mode, the lead `<article>` in `FanpageGallerySection` carries the editorial Bento span (`sm:col-span-2 sm:row-span-2`) while keeping all 16 `gallery-photo-*` shared-element transitions intact.

- [ ] **Step 2: Run Storefront & Gallery tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/storefront/storefront-sections.test.tsx src/components/storefront/fanpage-gallery.test.tsx`
Expected: FAIL (`activeMood` / Flavor Mood buttons missing, `/` shortcut missing, Bento lead class missing).

- [ ] **Step 3: Implement Flavor Mood matcher, `/` shortcut, 4-surface spatial rhythm, and Bento Lookbook grid**

1. In `DrinkMenuSection.tsx`:
   - Export `FlavorMoodId` (`'all' | 'thanh-mat' | 'dam-vi' | 'tinh-tao'`) and `matchesFlavorMood(drink, mood)`, render the **Gợi ý hợp vị** pill bar with `aria-pressed`, and attach a `window` `keydown` listener for `event.key === '/'` (ignoring `event.metaKey || event.ctrlKey || event.altKey`, editable targets `INPUT`/`TEXTAREA`/`SELECT`/`isContentEditable`, and open `[aria-modal="true"]` dialogs) that calls `event.preventDefault()` + `searchInputRef.current?.focus()`, with a `<kbd aria-hidden="true">/</kbd>` keycap badge inside the search field.
2. In `StorefrontClientShell.tsx`: parse & `replaceState`-sync `?mood=` alongside `?cat=&q=&media=studio` (clamping invalid values to `'all'`), and reset `activeMood` to `'all'` when clicking `Xóa bộ lọc tìm kiếm`.
3. Update `HeroSpotlight.tsx` (perforated highland altitude stamp header), `ToppingStripSection.tsx` (`rounded-2xl border-y border-olive-primary/18 bg-card-butter/45 px-5 py-6`), `BrandStorySection.tsx` (open broadsheet `border-y border-olive-primary/16 py-8 sm:py-10`), and `FanpageGallerySection.tsx` (lead `<article>` gets `sm:col-span-2 sm:row-span-2` when `activeFilter === 'all' && index === 0`).

- [ ] **Step 4: Run Storefront & Gallery tests to verify they pass**

Run: `pnpm --filter @omsua/web test src/components/storefront/storefront-sections.test.tsx src/components/storefront/fanpage-gallery.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/storefront
git commit -m "feat(web,ux): add flavor mood matcher, / search shortcut, and editorial surface rhythm"
```

---

### Task 3: Live Layered Cup Cross-Section SVG Visualizer & 1-Click Quick Reorder (`frontend-design` + `CustomizerCompound` + `OrderLookupModal`)

**Files:**
- Modify: `apps/web/src/components/modals/customizer/CustomizerCompound.tsx`, `apps/web/src/components/modals/OrderLookupModal.tsx`, `apps/web/src/components/storefront/StorefrontClientShell.tsx`
- Test: `apps/web/src/components/modals/ordering-flow.test.tsx`

**Interfaces:**
- Consumes: `CustomizerContextValue` (`state`, `meta`) in `CustomizerCompound.tsx`; `CartProvider` `addItem` in `StorefrontClientShell.tsx`
- Produces:
  - Live `<svg data-testid="customizer-cup-svg">` inside `CustomizerCupGauge` reflecting `size` (`S`/`M`/`L`), `sugarLevel` (`0`/`30`/`50`/`70`), `iceLevel` (`0`/`30`/`50`/`70`), and selected `toppings.length`
  - Optional `onReorder?: (order: OrderRecord) => { addedCount: number; skippedCount: number }` prop on `OrderLookupModalProps`

- [ ] **Step 1: Write failing tests in `ordering-flow.test.tsx`**

1. Assert that opening `DrinkCustomizerModal` renders `data-testid="customizer-cup-svg"` whose `data-cup-size`, `data-ice-cubes`, `data-sugar-level`, and `data-topping-count` attributes update dynamically as the user switches Size `M -> L`, Sugar `70% -> 30%`, Ice `70% -> 0%`, and checks 2 toppings.
2. Assert that in `StorefrontClientShell` + `OrderLookupModal`, clicking `Đặt lại giỏ món này` on a tracked order restores available items (filtering out unavailable products/toppings) into the cart and opens `CartCheckoutDrawer`; and when `0` items in the tracked order are currently `isAvailable`, keeps `OrderLookupModal` open and displays an `aria-live="polite"` unavailable warning (`Review Focus #3`).

- [ ] **Step 2: Run `ordering-flow.test.tsx` to verify it fails**

Run: `pnpm --filter @omsua/web test src/components/modals/ordering-flow.test.tsx`
Expected: FAIL (`customizer-cup-svg` and `Đặt lại giỏ món này` not found).

- [ ] **Step 3: Implement Live Layered Cup SVG Visualizer and 1-Click Quick Reorder**

1. In `CustomizerCompound.tsx`, enhance `CustomizerCupGauge` with a bespoke warm-palette `<svg data-testid="customizer-cup-svg">` (`aria-hidden="true"`, zero `#fff`/`#000`, `<g>` wrapper with `transformBox: 'fill-box'` & `transformOrigin: 'bottom center'` scaled per `S`/`M`/`L`) drawing the drink base tint by `product.categoryId`, amber sugar meniscus (`data-sugar-level={state.sugarLevel}`), `0/2/3/5` floating ice cubes (`data-ice-cubes`), and topping pearls/foam (`data-topping-count={meta.previewLine.toppings.length}`).
2. In `OrderLookupModal.tsx` and `StorefrontClientShell.tsx`, add `onReorder` handling: map `activeOrder.items` against `catalog.products` (`isAvailable`) and `catalog.toppings` (`isAvailable`), call `addItem` for each valid item, close `OrderLookupModal` and open `CartCheckoutDrawer` when `addedCount > 0`, or display `'Các món trong đơn cũ hiện đang tạm hết nên chưa thể đặt lại.'` inside `OrderLookupModal` when `addedCount === 0`.

- [ ] **Step 4: Run `ordering-flow.test.tsx` to verify it passes**

Run: `pnpm --filter @omsua/web test src/components/modals/ordering-flow.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/modals apps/web/src/components/storefront/StorefrontClientShell.tsx
git commit -m "feat(web): add live layered cup SVG visualizer and 1-click order reorder"
```

---

### Task 4: Admin Barista Command Center — WCAG AA Tokens, URL-Synced Filters, Compact Kitchen Tickets & `@media print` Prep Slip (`@omsua/admin`)

**Files:**
- Modify: `apps/admin/src/index.css`, `apps/admin/src/layouts/AdminLayout.tsx`, `apps/admin/src/pages/OrdersPage.tsx`, `apps/admin/src/pages/MenuPage.tsx`, `apps/admin/src/pages/BranchesPage.tsx`, `apps/admin/src/pages/SettingsPage.tsx`
- Test: `apps/admin/src/App.test.tsx`, `apps/admin/src/vite-config.test.ts`

**Interfaces:**
- Consumes: `useSearchParams` from `react-router-dom`
- Produces:
  - URL query synchronization on `/` (`?status=&branch=&q=&view=compact`) and `/menu` (`?cat=&avail=&q=`)
  - Compact Kitchen Ticket toggle (`Chế độ Thẻ Bếp gọn`) and single-order print action (`In phiếu bếp` setting `data-print-active="true"` + `window.print()`)

- [ ] **Step 1: Write failing tests in `apps/admin/src/App.test.tsx` and `apps/admin/src/vite-config.test.ts`**

1. In `apps/admin/src/vite-config.test.ts`, assert `apps/admin/src/index.css` defines `--color-terracotta-deep`, `--color-artichoke-deep`, `--color-ochre-deep`, and `@media print` rules with zero `#fff`/`#000` tokens.
2. In `apps/admin/src/App.test.tsx`, add tests asserting:
   - Navigating directly to `/?status=preparing&branch=cs1-hoang-dieu&q=minh` initializes `OrdersPage` filters from URL, and malformed `/?status=bogus&branch=invalid` clamps safely to `'all'` (`Review Focus #2`).
   - Navigating directly to `/menu?cat=coffee&avail=soldout` initializes `MenuPage` filters from URL and clamps invalid params safely.
   - Toggling `Chế độ Thẻ Bếp gọn` switches `OrdersPage` to the 2-column compact ticket grid (`data-view-mode="compact"`), and clicking `In phiếu bếp` on a specific order marks ONLY that card with `data-print-active="true"` when `window.print` fires (`Review Focus #5`).

- [ ] **Step 2: Run Admin tests to verify they fail**

Run: `pnpm --filter @omsua/admin test`
Expected: FAIL (`--color-terracotta-deep` / `@media print` missing, URL params ignored on mount, `Chế độ Thẻ Bếp gọn` and `In phiếu bếp` missing).

- [ ] **Step 3: Implement Admin WCAG AA tokens, URL-synced filters, Compact Kitchen Tickets, and `@media print` slip**

1. Add `--color-terracotta-deep: #A84B0D`, `--color-artichoke-deep: #4D5922`, `--color-ochre-deep: #805B1A`, and `@media print` single-ticket rules (hiding `aside`, `header`, `[data-admin-toolbar]`, and `article[data-testid^="order-card-"]:not([data-print-active="true"])`) to `apps/admin/src/index.css`, and upgrade button/badge/price contrasts across `AdminLayout.tsx`, `OrdersPage.tsx`, `MenuPage.tsx`, `BranchesPage.tsx`, and `SettingsPage.tsx` (plus explicit `bg-surface-light text-espresso` on `<option>`).
2. Wire `useSearchParams` (`replace: true`) with strict allowlist clamping on `OrdersPage.tsx` (`status`, `branch`, `q`, `view=compact`) and `MenuPage.tsx` (`cat`, `avail`, `q`).
3. Add the `Chế độ Thẻ Bếp gọn` toggle button (`min-h-11`, `aria-pressed`) and per-card `In phiếu bếp` button (`flushSync` -> `setPrintingOrderId(order.id)` -> `window.print()` -> clear on `afterprint` / fallback timer) in `OrdersPage.tsx`.

- [ ] **Step 4: Run Admin tests to verify they pass**

Run: `pnpm --filter @omsua/admin test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src
git commit -m "feat(admin): add URL-synced filters, compact kitchen tickets, and print prep slips"
```

---

### Task 5: Interactive Breeze Mist Canvas, 2-Page Botanical Print Lookbook PDF, Studio Artifacts & Live Cloud Lighthouse `100/100` Verification (`algorithmic-art` + `canvas-design` + `web-artifacts-builder` + `a11y-debugging`)

**Files:**
- Modify: `apps/web/src/components/artwork/DalatMorningMistCanvas.tsx`, `scripts/generate-brand-poster.py`, `apps/web/public/brand/omsua-botanical-menu-poster.pdf`, `apps/web/public/brand/omsua-botanical-menu-poster.png`, `README.md`
- Test: `apps/web/src/components/artwork/DalatMorningMistCanvas.test.tsx`, `apps/web/src/lib/web-review.test.ts`

**Interfaces:**
- Produces:
  - Pointer-breeze responsive `<DalatMorningMistCanvas />` (passive coordinate tracking, zero layout reads in `draw`, strict no-op when paused or `prefers-reduced-motion: reduce`)
  - 2-page PDF `apps/web/public/brand/omsua-botanical-menu-poster.pdf` (`%PDF-`, 2 pages) + updated preview `.png`
  - Standalone studio artifacts in `<appDataDir>/brain/<conversation-id>/`: `suong-som-atiso-gallery-v2.html` (`algorithmic-art`) and `omsua-ui-ux-v2-workbench.html` (`web-artifacts-builder`)

- [ ] **Step 1: Write failing tests in `DalatMorningMistCanvas.test.tsx` and `web-review.test.ts`**

1. In `DalatMorningMistCanvas.test.tsx`, assert `DalatMorningMistCanvas` tracks pointer breeze (`onPointerMove` / `onPointerLeave`) without throwing when `getBoundingClientRect` returns zero/mock dimensions and remains static when `prefers-reduced-motion: reduce` matches.
2. In `web-review.test.ts`, assert `apps/web/public/brand/omsua-botanical-menu-poster.pdf` exists and contains at least **2 PDF pages** (`/Type /Page\b` count `>= 2`).

- [ ] **Step 2: Run Canvas & Web Review tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/artwork/DalatMorningMistCanvas.test.tsx src/lib/web-review.test.ts`
Expected: FAIL (PDF currently has only 1 page; pointer-breeze handler assertions fail).

- [ ] **Step 3: Upgrade `DalatMorningMistCanvas`, regenerate 2-Page Botanical PDF, build Studio Artifacts, and deploy**

1. Add subtle normalized pointer-breeze deflection + golden-angle (`137.5°`) botanical spore drift to `DalatMorningMistCanvas.tsx` (using cached canvas `width`/`height` + `offsetX`/`offsetY` on native pointer events so `0` `getBoundingClientRect` layout reads occur!).
2. Upgrade `scripts/generate-brand-poster.py` (`canvas-design` Multi-Page Option, zero `#fff`/`#000`) to generate a 2-page museum-grade Botanical Lookbook & 4-Branch Altitude Menu PDF + preview PNG and run `python3 scripts/generate-brand-poster.py`.
3. Create `suong-som-atiso-gallery-v2.html` (from `algorithmic-art/templates/viewer.html` with 4 Đà Lạt time-of-day presets & 4-seed gallery mode) and bundle `omsua-ui-ux-v2-workbench.html` (via `web-artifacts-builder` scripts in `/tmp` scratch space) into the conversation artifact directory.
4. Update `README.md` with the v2 UI/UX Mastercraft capabilities, run the full monorepo gate, push `main` to trigger Vercel & Render auto-deploy, and run live Chrome DevTools Lighthouse audits (`browser` subagent) confirming **Accessibility `100/100`** (`0` console/page errors) on `https://omsua-web.vercel.app` and `https://omsua-admin.vercel.app`.

- [ ] **Step 4: Run full monorepo verification (`build`, `typecheck`, `lint`, `test`)**

Run: `pnpm --reporter=append-only build && pnpm --reporter=append-only typecheck && pnpm --reporter=append-only lint && pnpm --reporter=append-only test`
Expected: PASS across all 4 packages (`190+` tests green).

- [ ] **Step 5: Commit & Push**

```bash
git add apps/web/src/components/artwork apps/web/src/lib/web-review.test.ts scripts/generate-brand-poster.py apps/web/public/brand README.md
git commit -m "feat(art,brand): add interactive mist breeze, 2-page botanical menu PDF, and v2 docs"
```
