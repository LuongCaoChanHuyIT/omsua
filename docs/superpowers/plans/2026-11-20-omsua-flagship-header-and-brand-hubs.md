# Ốm Sữa Flagship Espresso Header & Brand Hubs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `@omsua/web` with the 2-tier `#29261D` Flagship Espresso Header Bar featuring the exact 7 navigation items (`GIỚI THIỆU ⌄`, `SẢN PHẨM ⌄`, `TIN TỨC ⌄`, `CỬA HÀNG`, `TUYỂN DỤNG`, `THÀNH VIÊN`, `NHƯỢNG QUYỀN`), WAI-ARIA disclosure dropdowns, and four authentic interactive Đà Lạt brand hubs (`#tin-tuc`, `#thanh-vien`, `#tuyen-dung`, `#nhuong-quyen`) while preserving **Lighthouse Accessibility `100/100`** and all existing ordering flows.

**Architecture:** Extract typed navigation items, seasonal articles, loyalty tier math, career openings, and franchise packages into `header-nav-config.ts`, refactor `StorefrontHeader.tsx` into a 2-tier `#29261D` (`bg-hero-espresso`) bar (Tier 1 commerce controls + Tier 2 7-item uppercase disclosure nav with responsive `< lg` accordion menu), build focused interactive sections (`NewsSeasonSection.tsx`, `MemberClubSection.tsx`, `CareersAndFranchiseSection.tsx`), and wire category/news state synchronization inside `StorefrontClientShell.tsx`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, Tailwind CSS v4 (`@theme`), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-20-omsua-flagship-header-and-brand-hubs-design.md`

## Global Constraints

- Node.js `>= 22.5.0` (`.node-version` = `22`) and `pnpm@12.18.0`; install **zero** new npm dependencies.
- Zero pure white or black tokens (`#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)`, `*-white`, `*-black`) anywhere in source files, CSS, or SVG icons.
- WCAG 2.1 AA contrast `>= 4.5:1` on all text (including `#9E450B` `terracotta-deep`, `#4D5922` `artichoke-deep`, `#805B1A` `ochre-deep`, and `#F7F4EC` / `#F4E3AD` / `#DDD6C5` on `#29261D`).
- Minimum `12px` (`text-xs`) font-size floor, `>= 44px` (`min-h-11`) touch targets on all interactive elements, explicit `bg-surface-light text-espresso` on every `<option>`, WCAG 2.5.3 Label-in-Name conformance (no mismatched `aria-label` overriding visible text), and zero `transition-all`, `forwardRef`, or `useContext`.

## Review Focus

1. **Pressing `Escape`, clicking outside `<header>`, or tabbing (`focusout`) past the last link of an open header dropdown (`GIỚI THIỆU ⌄`, `SẢN PHẨM ⌄`, `TIN TỨC ⌄`):** At most one dropdown may be open at once; `Escape` must close the open dropdown and restore keyboard focus to its trigger `<button>`; outside pointerdown and focus leaving the dropdown container must close the popover cleanly (pinned in Task 1).
2. **Selecting a drink category (e.g., `2. Giữ Dáng — Fruit Tea & Kombucha`) from `SẢN PHẨM ⌄` while a non-overlapping `?mood=dam-vi` or search query is active:** `StorefrontClientShell` must reset `activeMood` to `'all'` and `searchQuery` to `''` when `onSelectDrinkCategory` fires from `StorefrontHeader` so the user lands on a populated category menu instead of a 0-result empty state (pinned in Task 3).
3. **Mobile viewport (`< lg`) clipping of dropdown menus and duplicate landmark collision:** Desktop `<nav aria-label="Điều hướng cửa hàng">` (`hidden lg:flex`) must never use `overflow-x-auto` (which clips absolute dropdown popovers vertically), and the `< lg` mobile menu panel must remain unmounted (`null`) until its `Menu` toggle (`aria-expanded`) is opened so `getAllByRole('navigation', { name: /Điều hướng cửa hàng/i })` has length `1` by default and zero hidden duplicate links pollute screen-reader navigation (pinned in Task 1).
4. **Typing `/` or invalid Vietnam phone numbers inside `#thanh-vien`, `#tuyen-dung`, or `#nhuong-quyen` forms:** Native `<input>`, `<select>`, and `<textarea>` elements must carry explicit `<label htmlFor>` + `<option className="bg-surface-light text-espresso">`, prevent `/` from triggering `DrinkMenuSection` search focus hijack, validate Vietnam mobile numbers (`/^0\d{9}$/` after stripping spaces/dashes), and compute real loyalty points from `readRecentOrders()` matching the normalized phone (pinned in Task 2).
5. **Opening an article modal in `NewsSeasonSection` while `omsua-site-header` / `omsua-sticky-cart` view-transition names are active:** `NewsSeasonSection` must notify `onModalOpenChange?: (open: boolean) => void` so `StorefrontClientShell` includes `isNewsModalOpen` in `hasOpenOverlay`, suppressing fixed-chrome `viewTransitionName` bleed over the `aria-modal="true"` dialog and supporting `Escape` close with focus restoration (pinned in Tasks 2 & 3).

---

## Planned File Structure

- **Create:**
  - `apps/web/src/components/storefront/header-nav-config.ts` — Typed 7-item flagship header schema, 4 seasonal news articles, 3 loyalty tiers + `computeMemberStatus()`, 3 career openings, and 2 franchise models.
  - `apps/web/src/components/storefront/NewsSeasonSection.tsx` — `#tin-tuc` filterable Đà Lạt journal & promotions hub + accessible article reader modal (`role="dialog" aria-modal="true"`).
  - `apps/web/src/components/storefront/MemberClubSection.tsx` — `#thanh-vien` 3-tier loyalty showcase + interactive phone lookup/enrollment synced with `readRecentOrders()` and `localStorage` (`omsua_member_profile_v1`).
  - `apps/web/src/components/storefront/CareersAndFranchiseSection.tsx` — `#tuyen-dung` barista/leader openings + quick-apply form and `#nhuong-quyen` highland craft pillars + investment models + validated partnership inquiry form.
  - `apps/web/src/components/storefront/brand-hubs.test.tsx` — Component & interaction tests for `NewsSeasonSection`, `MemberClubSection`, and `CareersAndFranchiseSection`.
- **Modify:**
  - `apps/web/src/components/storefront/StorefrontHeader.tsx` — Refactor to 2-tier `#29261D` (`bg-hero-espresso`) Flagship Header with WAI-ARIA disclosure dropdowns (`GIỚI THIỆU ⌄`, `SẢN PHẨM ⌄`, `TIN TỨC ⌄`), 4 direct links (`CỬA HÀNG`, `TUYỂN DỤNG`, `THÀNH VIÊN`, `NHƯỢNG QUYỀN`), and `< lg` mobile menu toggle.
  - `apps/web/src/components/storefront/ToppingStripSection.tsx` — Add `id="topping"` and `scroll-mt-32` for direct `SẢN PHẨM ⌄ -> Topping Nhà Làm Mỗi Sáng` navigation, and update section `scroll-mt-*` across `HeroSpotlight.tsx`, `DrinkMenuSection.tsx`, `SnackMenuSection.tsx`, `BrandStorySection.tsx`, `FanpageGallerySection.tsx`, and `BrandFooter.tsx` to `scroll-mt-32`.
  - `apps/web/src/components/storefront/StorefrontClientShell.tsx` — Wire `onSelectDrinkCategory` (resetting `activeMood` & `searchQuery`), `activeNewsCategory` / `onSelectNewsCategory`, `isNewsModalOpen` overlay tracking, and mount `<NewsSeasonSection />`, `<MemberClubSection />`, and `<CareersAndFranchiseSection />`.
  - `apps/web/src/components/storefront/storefront-sections.test.tsx` — Update `StorefrontHeader` assertions for the 7-item flagship header, disclosure dropdown interactions, `Escape` focus return, outside-click dismissal, and `< lg` mobile menu toggle.
  - `README.md` — Document the 2-tier Flagship Espresso Header and 4 interactive Brand Hubs.

---

### Task 1: Typed Navigation Schema & 2-Tier `#29261D` Flagship `StorefrontHeader` with Disclosure Dropdowns

**Files:**
- Create: `apps/web/src/components/storefront/header-nav-config.ts`
- Modify: `apps/web/src/components/storefront/StorefrontHeader.tsx`, `apps/web/src/components/storefront/ToppingStripSection.tsx`, `apps/web/src/components/storefront/HeroSpotlight.tsx`, `apps/web/src/components/storefront/DrinkMenuSection.tsx`, `apps/web/src/components/storefront/SnackMenuSection.tsx`, `apps/web/src/components/storefront/BrandStorySection.tsx`, `apps/web/src/components/storefront/FanpageGallerySection.tsx`, `apps/web/src/components/storefront/BrandFooter.tsx`
- Test: `apps/web/src/components/storefront/storefront-sections.test.tsx`, `apps/web/src/lib/web-review.test.ts`

**Interfaces:**
- Produces in `apps/web/src/components/storefront/header-nav-config.ts`:
  - `export type NewsCategoryFilter = 'all' | 'mua-vu' | 'uu-dai'`
  - `export type HeaderDropdownKey = 'gioi-thieu' | 'san-pham' | 'tin-tuc'`
  - `export interface HeaderSubItem { id: string; label: string; description: string; href: string; external?: boolean; drinkCategory?: DrinkCategoryId | 'all'; newsCategory?: NewsCategoryFilter }`
  - `export type HeaderNavEntry = { id: HeaderDropdownKey; kind: 'dropdown'; label: string; items: readonly HeaderSubItem[] } | { id: string; kind: 'link'; label: string; href: string }`
  - `export const FLAGSHIP_HEADER_NAV: readonly HeaderNavEntry[]` (exact 7 items: `GIỚI THIỆU`, `SẢN PHẨM`, `TIN TỨC`, `CỬA HÀNG`, `TUYỂN DỤNG`, `THÀNH VIÊN`, `NHƯỢNG QUYỀN`)
  - Seed constants & helper for Task 2: `OMSUA_NEWS_ARTICLES`, `OMSUA_MEMBER_TIERS`, `OMSUA_CAREER_OPENINGS`, `OMSUA_FRANCHISE_MODELS`, `export interface SavedMemberProfile { name: string; phone: string; favoriteDrink: string; joinedAt: string }`, `export function normalizeVietnamPhone(raw: string): string`, `export function isValidVietnamPhone(raw: string): boolean`, `export function computeMemberStatus(phone: string, recentOrders: readonly OrderRecord[], savedProfile: SavedMemberProfile | null): { normalizedPhone: string; orderCount: number; totalSpent: number; points: number; currentTier: (typeof OMSUA_MEMBER_TIERS)[number]; nextTier: (typeof OMSUA_MEMBER_TIERS)[number] | null; pointsToNext: number }`
- Produces in `apps/web/src/components/storefront/StorefrontHeader.tsx`:
  - Extended `StorefrontHeaderProps`: optional `onSelectDrinkCategory?: (category: DrinkCategoryId | 'all') => void;` and `onSelectNewsCategory?: (category: NewsCategoryFilter) => void;`

- [ ] **Step 1: Update and add failing tests in `apps/web/src/components/storefront/storefront-sections.test.tsx`**

Update the two existing `StorefrontHeader` link checks (lines 39–45 and 343–345) and add a dedicated test verifying:
1. `<header>` uses `bg-hero-espresso` (`#29261D`) and renders all 7 top-level items: `button`s `GIỚI THIỆU`, `SẢN PHẨM`, `TIN TỨC` (`aria-expanded="false"`, `aria-label === null` for WCAG 2.5.3) and `link`s `CỬA HÀNG` (`#chi-nhanh`), `TUYỂN DỤNG` (`#tuyen-dung`), `THÀNH VIÊN` (`#thanh-vien`), `NHƯỢNG QUYỀN` (`#nhuong-quyen`).
2. `getAllByRole('navigation', { name: /Điều hướng cửa hàng/i })` has length `1` by default (`Review Focus #3`).
3. Clicking `SẢN PHẨM` sets `aria-expanded="true"`, reveals `Tất cả Thực đơn Đồ uống` (`#thuc-don`), `2. Giữ Dáng — Fruit Tea & Kombucha` (invoking `onSelectDrinkCategory('fruit-tea')` and closing the dropdown on click), `Topping Nhà Làm Mỗi Sáng` (`#topping`), and `Bánh Tráng Snack Đà Lạt` (`#banh-trang`, `min-h-11`).
4. Opening `GIỚI THIỆU` while `SẢN PHẨM` is open closes `SẢN PHẨM`; pressing `Escape` closes `GIỚI THIỆU` and restores `document.activeElement` to the `GIỚI THIỆU` trigger `<button>`; dispatching `pointerDown` on `document.body` closes an open dropdown (`Review Focus #1`).
5. Clicking the mobile `Menu` toggle button (`aria-label` omitted, visible text `Menu`) expands `#mobile-flagship-nav` (`aria-expanded="true"`), and `ToppingStripSection` carries `id="topping"`.

- [ ] **Step 2: Run Web tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/storefront/storefront-sections.test.tsx`
Expected: FAIL (`GIỚI THIỆU` / `SẢN PHẨM` / `TIN TỨC` dropdown buttons and `#tuyen-dung` / `#thanh-vien` / `#nhuong-quyen` links do not exist yet).

- [ ] **Step 3: Create `header-nav-config.ts` and implement the 2-tier `#29261D` `StorefrontHeader.tsx` + `#topping` anchor**

1. Create `apps/web/src/components/storefront/header-nav-config.ts` with `FLAGSHIP_HEADER_NAV`, `OMSUA_NEWS_ARTICLES` (4 articles referencing existing `/images/fanpage/seasonal/gallery-nong-san-da-lat.webp`, `/images/fanpage/seasonal/gallery-hong-trung-lang.webp`, `/images/fanpage/seasonal/gallery-kombucha-series.webp`, `/images/fanpage/space/space-tui-tote-atiso.webp`), `OMSUA_MEMBER_TIERS`, `OMSUA_CAREER_OPENINGS`, `OMSUA_FRANCHISE_MODELS`, `normalizeVietnamPhone`, `isValidVietnamPhone`, and `computeMemberStatus`.
2. Refactor `StorefrontHeader.tsx` into the 2-tier `#29261D` (`bg-hero-espresso text-surface-light`) layout:
   - Tier 1: Brand crest (`Ốm sữa` in `text-card-butter`, `SINCE 2017 • ĐÀ LẠT` in `text-[#DDD6C5]`), `#storefront-branch-select` (`bg-[#363125] border-[#4D4636] text-surface-light`, `<option className="bg-surface-light text-espresso">`), `Đơn đã đặt` button (`bg-card-butter text-olive-primary`), `Giỏ hàng` button (`bg-terracotta-deep text-surface-light border border-card-butter/35`), and `< lg` `Menu` toggle button (`min-h-11`, `lg:hidden`).
   - Tier 2 (`hidden lg:flex`): `<nav aria-label="Điều hướng cửa hàng">` containing the 7 uppercase items on a single horizontal row (`gap-6 xl:gap-8`, `overflow-visible`), WAI-ARIA disclosure popovers (`bg-surface-light text-espresso border border-olive-primary/20 shadow-paper-lift rounded-2xl p-2 z-50 min-w-72`), `Escape` key handler restoring trigger focus, `pointerdown` outside listener, and `onBlur` container focus-leave handler.
   - Mobile `< lg` panel (`id="mobile-flagship-nav"`): conditionally rendered only when `isMobileMenuOpen === true` with collapsible sub-lists for the 3 dropdown groups and direct links for the 4 single items.
3. Add `id="topping"` and `scroll-mt-32` to `ToppingStripSection.tsx`, and update `scroll-mt-24` to `scroll-mt-32` across `HeroSpotlight.tsx`, `DrinkMenuSection.tsx`, `SnackMenuSection.tsx`, `BrandStorySection.tsx`, `FanpageGallerySection.tsx`, and `BrandFooter.tsx`.

- [ ] **Step 4: Run Web tests to verify they pass**

Run: `pnpm --filter @omsua/web test src/components/storefront/storefront-sections.test.tsx src/lib/web-review.test.ts`
Expected: PASS (`0` pure B/W or low-contrast violations, all header disclosure & mobile tests green).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/storefront docs/superpowers/specs/2026-11-20-omsua-flagship-header-and-brand-hubs-design.md docs/superpowers/plans/2026-11-20-omsua-flagship-header-and-brand-hubs.md
git commit -m "feat(web): build 2-tier espresso flagship header with 7 nav items and disclosure menus"
```

---

### Task 2: Interactive Brand Hubs — `#tin-tuc` News Journal, `#thanh-vien` Loyalty Club, `#tuyen-dung` Careers & `#nhuong-quyen` Franchise

**Files:**
- Create: `apps/web/src/components/storefront/NewsSeasonSection.tsx`, `apps/web/src/components/storefront/MemberClubSection.tsx`, `apps/web/src/components/storefront/CareersAndFranchiseSection.tsx`, `apps/web/src/components/storefront/brand-hubs.test.tsx`
- Test: `apps/web/src/components/storefront/brand-hubs.test.tsx`, `apps/web/src/lib/web-review.test.ts`

**Interfaces:**
- Consumes from `header-nav-config.ts`: `NewsCategoryFilter`, `OMSUA_NEWS_ARTICLES`, `OMSUA_MEMBER_TIERS`, `OMSUA_CAREER_OPENINGS`, `OMSUA_FRANCHISE_MODELS`, `SavedMemberProfile`, `isValidVietnamPhone`, `computeMemberStatus`
- Produces:
  - `export interface NewsSeasonSectionProps { activeCategory?: NewsCategoryFilter; onChangeCategory?: (category: NewsCategoryFilter) => void; onModalOpenChange?: (isOpen: boolean) => void }` in `NewsSeasonSection.tsx` (`id="tin-tuc"`)
  - `export interface MemberClubSectionProps { recentOrdersVersion?: number }` in `MemberClubSection.tsx` (`id="thanh-vien"`)
  - `export interface CareersAndFranchiseSectionProps { branches: readonly BranchInfo[] }` in `CareersAndFranchiseSection.tsx` (`id="tuyen-dung"` and `id="nhuong-quyen"`)

- [ ] **Step 1: Write failing tests in `apps/web/src/components/storefront/brand-hubs.test.tsx`**

Write tests verifying:
1. **`NewsSeasonSection` (`#tin-tuc`):** Filters articles by `'all'`, `'mua-vu'`, and `'uu-dai'` (`aria-pressed`), opens an accessible article detail modal (`role="dialog" aria-modal="true"`) calling `onModalOpenChange(true)` when clicking `Đọc chi tiết`, and closes on `Escape` calling `onModalOpenChange(false)` while restoring focus to the opener button (`Review Focus #5`).
2. **`MemberClubSection` (`#thanh-vien`):** Rejects malformed phone numbers (`"12345"`) with an accessible Vietnamese error alert (`Review Focus #4`); when `omsua_recent_orders_v1` in `localStorage` contains orders for `0905123456` totaling `550.000đ`, looking up/enrolling `0905 123 456` computes `600` points (`550` order points + `50` welcome points), promotes the member to **`Hạng Sương Sớm`**, and persists `omsua_member_profile_v1` across remounts.
3. **`CareersAndFranchiseSection` (`#tuyen-dung` & `#nhuong-quyen`):** Clicking `Ứng tuyển vị trí này` on a career card pre-selects that role in the recruitment form; submitting either form with empty name/invalid phone shows accessible validation errors, while valid submission renders a clear Vietnamese confirmation card with reference hotline and explicit `bg-surface-light text-espresso` on `<option>` elements (`Review Focus #4`).

- [ ] **Step 2: Run Brand Hubs tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/storefront/brand-hubs.test.tsx`
Expected: FAIL (`Cannot find module './NewsSeasonSection'`).

- [ ] **Step 3: Implement `NewsSeasonSection.tsx`, `MemberClubSection.tsx`, and `CareersAndFranchiseSection.tsx`**

1. Build `NewsSeasonSection.tsx` (`id="tin-tuc"`, `scroll-mt-32`): editorial header, 3 filter pills (`Tất cả bản tin`, `Mùa vụ & Nông sản`, `Ưu đãi & Sự kiện`), 2×2 card grid using local `.webp` assets (`loading="lazy" decoding="async"` with `onError` warm fallback), and an accessible modal dialog (`role="dialog" aria-modal="true"`) with `Escape` + backdrop close and trigger focus restoration.
2. Build `MemberClubSection.tsx` (`id="thanh-vien"`, `scroll-mt-32`): warm dark/butter editorial split showcasing the 3 tiers (*Búp Xanh*, *Sương Sớm*, *Cầu Đất Vàng*) on one side and an interactive **Tra cứu & Mở Thẻ Thành Viên SĐT** card on the other, reading `readRecentOrders()` + `localStorage` (`omsua_member_profile_v1`) safely inside `try/catch`.
3. Build `CareersAndFranchiseSection.tsx` rendering two distinct anchored sections:
   - `<section id="tuyen-dung" className="scroll-mt-32 ...">`: 3 Đà Lạt / Đức Trọng role cards + interactive application form (`Họ và tên`, `Số điện thoại`, `Vị trí ứng tuyển`, `Cơ sở mong muốn`, `Kinh nghiệm / Ca làm`).
   - `<section id="nhuong-quyen" className="scroll-mt-32 ...">`: 3 franchise pillars, 2 transparent store-format cards (*Quầy Tinh Gọn 35–50m²* & *Không Gian Flagship 80–140m²*), and a validated partner consultation form (`Họ và tên`, `Số điện thoại`, `Khu vực dự kiến mở quán`, `Mô hình quan tâm`).
   Ensure all `<input>`/`<select>`/`<textarea>` use `min-h-11`, `text-base sm:text-sm`, explicit `<label htmlFor>`, and `className="bg-surface-light text-espresso"` on `<option>`.

- [ ] **Step 4: Run Brand Hubs & static review tests to verify they pass**

Run: `pnpm --filter @omsua/web test src/components/storefront/brand-hubs.test.tsx src/lib/web-review.test.ts`
Expected: PASS (`0` contrast, pure B/W, touch-target, or sub-12px violations).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/storefront
git commit -m "feat(web): add interactive Tin tức, Thành viên, Tuyển dụng, and Nhượng quyền hubs"
```

---

### Task 3: `StorefrontClientShell` Integration, End-to-End Navigation Verification, Docs & Live Cloud Deploy

**Files:**
- Modify: `apps/web/src/components/storefront/StorefrontClientShell.tsx`, `README.md`
- Test: `apps/web/src/components/storefront/storefront-sections.test.tsx`, `apps/web/src/lib/web-review.test.ts`

**Interfaces:**
- Consumes: `StorefrontHeader` (`onSelectDrinkCategory`, `onSelectNewsCategory`), `NewsSeasonSection`, `MemberClubSection`, `CareersAndFranchiseSection`
- Produces: Complete flagship Storefront experience deployed to `https://omsua-web.vercel.app` with verified **Lighthouse Accessibility `100/100`**

- [ ] **Step 1: Write failing integration test in `apps/web/src/components/storefront/storefront-sections.test.tsx`**

Add an integration test on `<StorefrontClientShell />` verifying:
1. All new flagship section landmarks exist in the rendered DOM (`#topping`, `#tin-tuc`, `#thanh-vien`, `#tuyen-dung`, `#nhuong-quyen`, `#chi-nhanh`).
2. When mood `Đậm trà béo mịn` (`dam-vi`) and search query `"flan"` are active, opening `SẢN PHẨM` in `StorefrontHeader` and clicking `2. Giữ Dáng — Fruit Tea & Kombucha` resets `activeMood` to `'all'` and `searchQuery` to `''`, activates `Giữ Dáng (6)`, and displays `Trà Quýt Nhài Cát Tường` instead of an empty state (`Review Focus #2`).
3. Opening `TIN TỨC` in `StorefrontHeader` and clicking `Ưu đãi & Sự kiện tại quán` switches `NewsSeasonSection`'s active filter pill (`aria-pressed="true"`), and pressing `/` inside `#thanh-vien`'s phone `<input>` does NOT steal focus to the drink searchbox (`Review Focus #4`).

- [ ] **Step 2: Run Storefront integration test to verify it fails**

Run: `pnpm --filter @omsua/web test src/components/storefront/storefront-sections.test.tsx`
Expected: FAIL (`#tin-tuc`, `#thanh-vien`, `#tuyen-dung`, `#nhuong-quyen` not yet mounted in `StorefrontClientShell` and `onSelectDrinkCategory` not wired).

- [ ] **Step 3: Wire `StorefrontClientShell.tsx`, update `README.md`, and run full monorepo verification**

1. In `StorefrontClientShell.tsx`:
   - Add `activeNewsCategory` (`NewsCategoryFilter`, default `'all'`) and `isNewsModalOpen` (`boolean`, included in `hasOpenOverlay`).
   - Pass `onSelectDrinkCategory={(category) => { startTransition(() => { setActiveCategory(category); setActiveMood('all'); setSearchQuery(''); }); }}` and `onSelectNewsCategory={(newsCat) => { startTransition(() => { setActiveNewsCategory(newsCat); }); }}` to `<StorefrontHeader />`.
   - Mount `<NewsSeasonSection activeCategory={activeNewsCategory} onChangeCategory={setActiveNewsCategory} onModalOpenChange={setIsNewsModalOpen} />`, `<MemberClubSection recentOrdersVersion={recentOrderCount} />`, and `<CareersAndFranchiseSection branches={branches} />` inside `<main>` after `<FanpageGallerySection />`.
2. Update `README.md` to document the 2-tier `#29261D` Flagship Header (`GIỚI THIỆU ⌄`, `SẢN PHẨM ⌄`, `TIN TỨC ⌄`, `CỬA HÀNG`, `TUYỂN DỤNG`, `THÀNH VIÊN`, `NHƯỢNG QUYỀN`) and the 4 interactive Brand Hubs.

- [ ] **Step 4: Run full 4-package verification (`build`, `typecheck`, `lint`, `test`)**

Run: `pnpm --reporter=append-only build && pnpm --reporter=append-only typecheck && pnpm --reporter=append-only lint && pnpm --reporter=append-only test`
Expected: PASS across `@omsua/shared`, `@omsua/backend`, `@omsua/web`, and `@omsua/admin` (`190+` automated tests green).

- [ ] **Step 5: Commit, sync `main` for Cloud Deploy & verify live Lighthouse `100/100`**

```bash
git add apps/web/src/components/storefront README.md
git commit -m "feat(web): wire flagship header category/news jumps and brand hubs into storefront"
```
After Final Whole-Branch Review passes cleanly, fast-forward `main`, push to `origin` so Vercel deploys `https://omsua-web.vercel.app`, and run a live Chrome DevTools Lighthouse audit (`browser` subagent, zero `evaluate_script`) confirming **Accessibility `100/100`** and `0` console errors.
