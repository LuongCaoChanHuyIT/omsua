# Ốm Sữa Flagship Espresso Header & Brand Hubs — Design Specification

**Date:** 2026-11-20  
**Scope:** `@omsua/web` (`StorefrontHeader`, `ToppingStripSection`, `NewsSeasonSection`, `MemberClubSection`, `CareersAndFranchiseSection`, `StorefrontClientShell`)  
**Reference Visual:** User-provided navigation screenshot (`GIỚI THIỆU ⌄`, `SẢN PHẨM ⌄`, `TIN TỨC ⌄`, `CỬA HÀNG`, `TUYỂN DỤNG`, `THÀNH VIÊN`, `NHƯỢNG QUYỀN` on dark espresso bar)

---

## 1. Intent & Why

Customers visiting flagship Vietnamese artisanal tea & coffee brands expect both **frictionless online ordering** (branch selector, live cart, order tracking) and a **complete brand flagship navigation bar** covering brand heritage, full product taxonomy, seasonal news/promotions, store directory, barista careers, member loyalty perks, and franchise inquiries.

Upgrading `StorefrontHeader` to the 7-item dark Espresso (`#29261D`) bar requested by the user — backed by real, interactive Đà Lạt brand destinations rather than dead `#` links — turns `@omsua/web` into a complete commercial flagship website while preserving 100% of existing ordering flows and **Lighthouse Accessibility `100/100`**.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
1. **Exact 7-Item Primary Navigation Bar on `#29261D` (`bg-hero-espresso`):**
   - `GIỚI THIỆU ⌄` (Disclosure dropdown: *Câu chuyện từ 2017* `#cau-chuyen`, *Không gian tiệm Đà Lạt* `#khong-gian`, *Ấn phẩm Menu Đà Lạt (PDF)* `/brand/omsua-botanical-menu-poster.pdf`)
   - `SẢN PHẨM ⌄` (Disclosure dropdown: *Tất cả Thực đơn Đồ uống* `#thuc-don`, *1. Trà Sữa Đà Lạt*, *2. Giữ Dáng — Fruit Tea & Kombucha*, *3. Sữa Tươi & Đá Xay Cao Nguyên*, *4. Cà Phê Pha Phin & Cold Brew*, *Topping Nhà Làm Mỗi Sáng* `#topping`, *Bánh Tráng Snack Đà Lạt* `#banh-trang`)
   - `TIN TỨC ⌄` (Disclosure dropdown: *Tất cả bản tin Nhà Ốm* `#tin-tuc`, *Mùa vụ & Nông sản Đà Lạt*, *Ưu đãi & Sự kiện tại quán*)
   - `CỬA HÀNG` (Direct anchor `#chi-nhanh`)
   - `TUYỂN DỤNG` (Direct anchor `#tuyen-dung`)
   - `THÀNH VIÊN` (Direct anchor `#thanh-vien`)
   - `NHƯỢNG QUYỀN` (Direct anchor `#nhuong-quyen`)
2. **2-Tier Flagship Header Layout:**
   - **Tier 1 (Brand & Commerce Utility Row):** `<OmSuaLogo />` + `Ốm sữa` (`SINCE 2017 • ĐÀ LẠT`) on the left; `#storefront-branch-select`, `Đơn đã đặt`, `Giỏ hàng (N) • ...`, and mobile `< lg` `Menu` toggle button on the right.
   - **Tier 2 (Primary 7-Item Nav Row):** Single uncluttered horizontal row on desktop (`lg:flex`) so the 7 uppercase items never wrap onto 2 lines at `>= 1024px`, and an accessible vertical disclosure drawer/panel on `< lg` mobile screens so dropdowns are never clipped by `overflow-x: auto`.
3. **Four Authentic In-Web Brand Hubs:**
   - **`#tin-tuc` (`NewsSeasonSection`):** Filterable Đà Lạt seasonal journal & promotions using existing local `/images/fanpage/seasonal/*.webp` & `/images/fanpage/space/*.webp` photography plus an accessible article detail modal (`role="dialog" aria-modal="true"`).
   - **`#thanh-vien` (`MemberClubSection`):** 3 loyalty tiers (*Búp Xanh*, *Sương Sớm*, *Cầu Đất Vàng*) + interactive phone lookup/registration (`09xxxxxxxx` / `03xxxxxxxx` Vietnam mobile validation) computing live points from `readRecentOrders()` and persisting member enrollment locally (`omsua_member_profile_v1`).
   - **`#tuyen-dung` & `#nhuong-quyen` (`CareersAndFranchiseSection`):** Open positions across Đà Lạt & Đức Trọng with quick-apply form (`#tuyen-dung`), alongside Ốm Sữa franchise advantages, transparent investment models, and validated partner inquiry form (`#nhuong-quyen`).

### Non-Goals
- No backend SQLite schema changes or new NestJS endpoints are required in this phase (forms validate client-side and confirm submission with hotline/email reference; member points integrate directly with existing `omsua_recent_orders_v1` + `omsua_member_profile_v1`).
- No changes to `@omsua/admin`.

### Anti-Goals (Failure Conditions Even If Technically Functional)
- Dead `#` links or placeholder "Coming soon / Đang cập nhật" empty boxes.
- Pure `#FFFFFF` / `#000000` or `*-white` / `*-black` utilities anywhere in the dark header, dropdown popovers, or new sections.
- Dropdown menus using `role="menu"` / `role="menuitem"` (which WAI-ARIA reserves for desktop application menus and Lighthouse flags if mixed with links) instead of the standard **WAI-ARIA Disclosure Navigation Pattern** (`<button aria-expanded aria-controls>` + `<ul><li><a>`).
- Any regression below **Lighthouse Accessibility `100/100`**, `< 44px` (`min-h-11`) touch targets, or `< 12px` (`text-xs`) text.

---

## 3. Global Constraints

- Node.js `>= 22.5.0` (`.node-version` = `22`) and `pnpm@12.18.0`; install **zero** new npm dependencies.
- Zero pure white or black tokens (`#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)`, `*-white`, `*-black`).
- WCAG 2.1 AA contrast `>= 4.5:1` on all normal text (`#F7F4EC` on `#29261D` = `13.68:1`; `#F4E3AD` on `#29261D` = `11.87:1`; `#DDD6C5` on `#29261D` = `10.12:1`; `#9E450B` on `#F7F4EC` = `5.76:1` and on `#F4E3AD` = `5.05:1`).
- Minimum `12px` (`text-xs`) font-size floor, `>= 44px` (`min-h-11`) touch targets on every interactive control, explicit `bg-surface-light text-espresso` on all `<option>` elements, and WCAG 2.5.3 Label-in-Name conformance (no mismatched `aria-label` overriding visible button text).
- Zero `transition-all`, `forwardRef`, or `useContext`.

---

## 4. Architectural Approaches Considered

1. **Chosen — Single-Page Flagship Hubs + WAI-ARIA Disclosure Dropdowns (`StorefrontClientShell`):**
   - Renders `#tin-tuc`, `#thanh-vien`, `#tuyen-dung`, and `#nhuong-quyen` directly inside the main Storefront experience with state-synced category/news jumps from `SẢN PHẨM ⌄` and `TIN TỨC ⌄`.
   - *Pros:* Instant zero-latency anchor transitions, cart & branch state stay mounted without route layout refactoring, zero risk to SSR fallback or existing E2E ordering flows, and customers can browse news/membership while building their drink order.
   - *Trade-off:* Slightly longer vertical page, solved cleanly via crisp editorial section rhythm and `scroll-mt-32` sticky-header scroll offsets.
2. **Multi-Route Next.js App Router (`/tin-tuc`, `/tuyen-dung`, `/thanh-vien`, `/nhuong-quyen`):**
   - *Rejected per user's choice (`A1`):* Requires lifting `CartProvider` and modal state into root `app/layout.tsx` across routes and splits discovery away from the ordering menu.
3. **Header-Only Summary Modals:**
   - *Rejected per user's choice (`A1`):* Feels lightweight rather than a full flagship F&B brand website.

---

## 5. Detailed Component & Interaction Design

### 5.1 `header-nav-config.ts`
Defines strongly typed navigation structures and authentic Đà Lạt brand data:
- `HeaderDropdownAction`: either `{ kind: 'anchor'; label: string; description: string; href: string; drinkCategory?: DrinkCategoryId | 'all'; newsCategory?: NewsCategoryFilter }` or `{ kind: 'external'; label: string; description: string; href: string }`.
- `OMSUA_NEWS_ARTICLES` (4 curated articles using local `/images/fanpage/seasonal/*.webp` & `/images/fanpage/space/*.webp` assets across `'mua-vu'` and `'uu-dai'`).
- `OMSUA_CAREER_OPENINGS` (3 roles across Đà Lạt & Đức Trọng branches).
- `OMSUA_MEMBER_TIERS` (*Búp Xanh* `0–499 điểm`, *Sương Sớm* `500–1.499 điểm`, *Cầu Đất Vàng* `>= 1.500 điểm`, `1.000đ = 1 điểm`, plus +50 welcome points on enrollment) and pure helper `computeMemberStatus(phone, recentOrders, savedProfile)`.
- `OMSUA_FRANCHISE_HIGHLIGHTS` & `OMSUA_FRANCHISE_MODELS` (*Mô hình Quầy Tinh Gọn Takeaway 35–50m²* & *Mô hình Không Gian Sương Sớm Flagship 80–140m²*).

### 5.2 `StorefrontHeader.tsx` (2-Tier `#29261D` Flagship Bar)
- Outer `<header>` uses `sticky top-0 z-40 border-b border-[#3F3A2D] bg-hero-espresso/98 text-surface-light shadow-paper-rest backdrop-blur-md`.
- **Tier 1:** Logo (`Ốm sữa` in `text-card-butter`, subtitle `SINCE 2017 • ĐÀ LẠT` in `text-[#DDD6C5]`), branch pill (`bg-[#363125] border-[#4D4636] text-surface-light`, `<select>` in `text-surface-light`, `<option>` in `bg-surface-light text-espresso`), `Đơn đã đặt` pill (`bg-card-butter text-olive-primary`), `Giỏ hàng` CTA (`bg-terracotta-deep text-surface-light` with `border border-card-butter/35`), and `< lg` mobile menu toggle button (`aria-expanded`, `aria-controls="mobile-flagship-nav"`, `min-h-11`).
- **Tier 2 (Desktop `hidden lg:flex`):** `<nav aria-label="Điều hướng cửa hàng">` with the exact 7 uppercase items (`text-xs font-bold tracking-[0.08em] uppercase text-surface-light hover:text-card-butter min-h-11`).
  - The 3 dropdown items (`GIỚI THIỆU`, `SẢN PHẨM`, `TIN TỨC`) render native `<button type="button" aria-expanded={isOpen} aria-controls={panelId}>` with an inline `<svg aria-hidden="true">` chevron (`⌄` rotating `180deg` via `transition-transform` when open).
  - Dropdown panel (`id={panelId}`, `bg-surface-light text-espresso border border-olive-primary/20 rounded-2xl shadow-paper-lift p-2 z-50 min-w-72`) closes on:
    1. Clicking a submenu link/action,
    2. Pressing `Escape` (returning focus to the trigger `<button>`),
    3. Clicking outside `<header>`, or
    4. Keyboard focus leaving the dropdown wrapper (`!wrapper.contains(event.relatedTarget)`).
- **Selecting a Drink Category from `SẢN PHẨM ⌄`:** Calls `onSelectDrinkCategory(category)` which resets `activeMood` to `'all'` and `searchQuery` to `''`, sets `activeCategory`, closes the dropdown/mobile drawer, and scrolls smoothly to `#thuc-don`.

### 5.3 Scroll Offset Calibration
Because the 2-tier sticky header is taller (~`108px` on desktop), update `scroll-mt-24` to `scroll-mt-32` on `#hero`, `#thuc-don`, `#topping`, `#banh-trang`, `#cau-chuyen`, `#khong-gian`, `#tin-tuc`, `#thanh-vien`, `#tuyen-dung`, `#nhuong-quyen`, and `#chi-nhanh` so anchor jumps never hide section headings behind the sticky header.
