# Ốm Sữa Full Fanpage Photo Harvest & 1:1 Visual Perfection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Ốm Sữa's local `.webp` photography from `@trasuadalatomsua` to maximum verified 1:1 catalog coverage (all 4 branches, all 6 snacks, 21/24 drinks, verified macro toppings, and 16 high-resolution gallery moments) with proportional `sharp.extract` cropping, canonical asset naming, and zero technical debt.

**Architecture:** `scripts/sync-fanpage-photos.mjs` upgrades all sources to Photo Theater full-resolution `scontent` URLs, adds proportional `extract` (`0..1` normalized crop box) inside `validateAndOptimizePhotoBuffer()`, prunes stale unreferenced `.webp` files, and writes crisp `.webp` assets to `apps/web/public/images/fanpage/` and `apps/admin/public/images/fanpage/branches/`. `@omsua/shared` updates `BRANCH_PHOTO_BY_ID` (adding optional `objectPosition`), `PRODUCT_PHOTO_BY_ID` (mapping every SKU verified via `read_file`), and `FANPAGE_GALLERY_ITEMS` (16 items). `@omsua/web` and `@omsua/admin` apply `branchPhoto.objectPosition` on branch banners, add `key={currentItem.src}` on `PhotoLightboxModal`, and verify visual fidelity live on `http://localhost:3000/` and `http://localhost:3001/`.

**Tech Stack:** TypeScript 5, Node.js 22 (`fetch` + `AbortSignal.timeout`, `node:fs`), `sharp` 0.35, React 19, Next.js 15, Vite 6, Tailwind CSS v4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-19-omsua-full-fanpage-photo-harvest-design.md`

## Global Constraints

- **Node.js `>= 22.0.0` & `pnpm >= 10.0.0`:** Zero new external npm dependencies; resolve `sharp` from the existing workspace.
- **Zero Pure `#FFFFFF` or `#000000`:** Never introduce `#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)`, or Tailwind `*-white` / `*-black` utilities.
- **Zero Runtime `fbcdn.net` Hotlinking:** Runtime UI and `@omsua/shared` reference only local `/images/fanpage/...webp` paths and permanent `https://www.facebook.com/photo/?fbid=...` post links.
- **Preserve Live User Dev Servers:** Never kill or restart processes listening on `:3000`, `:3001`, or `:4000`.
- **100% `read_file` Visual Gate & Honest Fallback:** Every generated `.webp` must be inspected with `read_file`; SKUs with zero still photos on `@trasuadalatomsua` (`tra-sua-flan-chay-canh`, `sua-tuoi-duong-den`, `ca-phe-den`, `banh-flan`) remain unmapped so `<ProductMedia />` renders their bespoke Studio SVG.

## Review Focus

1. **Out-of-bounds or tiny `extract` crop boxes in `validateAndOptimizePhotoBuffer()`:** Passing normalized `extract` coordinates outside `[0, 1]` or producing a cropped region `< 200x200` pixels must throw an explicit validation error before encoding WebP rather than crashing inside `sharp` or emitting a blurry thumbnail.
2. **Orphaned legacy `.webp` files left in `public/images/fanpage/`:** Renaming legacy slugs (`topping-khoai-tam.webp`, `drink-atiso-chuoi.webp`, `branch-duc-trong-vuon-hoa.webp`) without pruning unreferenced files bloats production bundles and causes `README.md` / disk drift; `fanpage-assets.test.ts` must verify zero unreferenced `.webp` files remain on disk.
3. **Corrupt or missing Admin branch `.webp` copies:** `fanpage-assets.test.ts` must verify non-empty file size (`> 2048` bytes) AND `RIFF....WEBP` magic bytes on all 4 `apps/admin/public/images/fanpage/branches/*.webp` files, not just `existsSync`.
4. **Duplicate `.webp` sharing across distinct menu SKUs:** Two different catalog items in `PRODUCT_PHOTO_BY_ID` accidentally pointing to the exact same `.webp` file reintroduces visual duplication; `fanpage-media.test.ts` must assert every entry in `PRODUCT_PHOTO_BY_ID` has a unique `src` path.
5. **Stale bitmap flash in `PhotoLightboxModal` & clipped branch header text:** `PhotoLightboxModal` must key its `<img>` by `currentItem.src`, and both `BrandFooter` (`@omsua/web`) and `BranchesPage` (`@omsua/admin`) must apply `branchPhoto.objectPosition ?? 'center'` to branch `<img>` elements.

---

## File Structure

- **Asset Pipeline & Verification (`scripts/` & `apps/web/src/lib/`):**
  - Modify `scripts/sync-fanpage-photos.mjs` — add normalized `extract?: { left: number; top: number; width: number; height: number }` support in `validateAndOptimizePhotoBuffer()`, `AbortSignal.timeout(15_000)` in `syncAllFanpagePhotos()`, stale `.webp` pruning, and full-resolution Theater photo sources.
  - Modify `apps/web/src/lib/fanpage-assets.test.ts` — test valid/invalid `extract` crops, verify `RIFF....WEBP` headers in both `apps/web/public` and `apps/admin/public`, and assert zero orphaned `.webp` files on disk.
- **Shared Manifest (`packages/shared/`):**
  - Modify `packages/shared/src/fanpage-media.ts` — add `objectPosition?: string` to `BranchPhotoMeta`, update `BRANCH_PHOTO_BY_ID` (4 unique branch photos), expand `PRODUCT_PHOTO_BY_ID` (all visually verified 1:1 drinks, 6/6 snacks, and macro toppings with unique `.webp` paths), and expand `FANPAGE_GALLERY_ITEMS` to 16 items.
  - Modify `packages/shared/src/fanpage-media.test.ts` — assert 16 gallery items, unique `src` across all `PRODUCT_PHOTO_BY_ID` entries, `100%` snack coverage (`6/6`), `>= 21` drink coverage, `>= 5` topping coverage, unique branch `src` across all 4 branches, and `postUrl` parity.
- **Storefront, Admin & Docs (`apps/web/`, `apps/admin/`, `README.md`):**
  - Modify `apps/web/src/components/modals/PhotoLightboxModal.tsx` — add `key={currentItem.src}` to the slide `<img>`.
  - Modify `apps/web/src/components/storefront/BrandFooter.tsx` & `apps/admin/src/pages/BranchesPage.tsx` — apply `style={{ objectPosition: branchPhoto.objectPosition ?? 'center' }}` to branch `<img>` elements.
  - Modify `apps/web/src/components/storefront/fanpage-gallery.test.tsx` & `apps/admin/src/App.test.tsx` — update assertions for 16 gallery items, canonical `.webp` paths, `objectPosition` styling, and topping real-photo rendering.
  - Modify `README.md` — document exact photo counts, `sharp.extract` pipeline, and 1:1 coverage metrics.

---

### Task 1: Upgrade `sharp` Ingestion Pipeline with Normalized `extract`, Full-Res Sources & Visual Verification

**Files:**
- Modify: `scripts/sync-fanpage-photos.mjs`
- Test: `apps/web/src/lib/fanpage-assets.test.ts`

**Interfaces:**
- Produces:
  - `validateAndOptimizePhotoBuffer(buffer: Buffer, contentType: string | null, options?: number | { maxDimension?: number; extract?: { left: number; top: number; width: number; height: number } }) => Promise<{ data: Buffer; width: number; height: number }>`
  - Canonical `.webp` files written to `apps/web/public/images/fanpage/{branches,space,products,seasonal}/` and `apps/admin/public/images/fanpage/branches/`, with unreferenced legacy `.webp` files pruned.

- [ ] **Step 1: Write failing tests for normalized `extract` validation in `apps/web/src/lib/fanpage-assets.test.ts`**

Add assertions testing:
1. Valid normalized crop (`{ maxDimension: 640, extract: { left: 0, top: 0, width: 0.5, height: 1 } }` on a `600x400` synthetic PNG) resolves with `{ width: 300, height: 400 }` and valid `RIFF....WEBP` bytes.
2. Out-of-range crop (`{ left: 0.8, top: 0, width: 0.5, height: 1 }`) rejects with `/extract/i`.
3. Crop resulting in `< 200x200` pixels (`{ left: 0, top: 0, width: 0.25, height: 0.25 }` on a `600x600` PNG -> `150x150`) rejects with `/dimensions too small/i`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @omsua/web test src/lib/fanpage-assets.test.ts`
Expected: FAIL (`extract` options not yet supported by `validateAndOptimizePhotoBuffer`).

- [ ] **Step 3: Implement `extract` cropping, `AbortSignal.timeout(15_000)`, stale `.webp` pruning, and full-res `FANPAGE_PHOTO_SOURCES` in `scripts/sync-fanpage-photos.mjs`, then run `pnpm sync:photos` and inspect every `.webp` with `read_file`**

- Accept either a numeric `maxDimension` (backward-compatible) or `{ maxDimension = 640, extract }` as the 3rd parameter of `validateAndOptimizePhotoBuffer`.
- When `extract` is provided, validate `0 <= left < 1`, `0 < width <= 1`, `left + width <= 1.0001` (same for `top`/`height`), rotate EXIF first, compute integer pixel box `{ left, top, width, height }`, verify `width >= 200 && height >= 200`, and apply `.extract(...)` before `.resize(...)`.
- Populate `FANPAGE_PHOTO_SOURCES` with all surveyed full-res Photo Theater URLs:
  - 4 branches (`branch-cs1-hoang-dieu.webp`, `branch-cs2-hem-33-nct.webp`, `branch-cs3-158-nct.webp`, `branch-cs4-duc-trong.webp`)
  - 21 drinks (`drink-<id>.webp` for each of the 21 photographed drinks, with `extract` on multi-cup posters: `tra-atiso-sen-chia`, `tra-dau-tam-da-lat`, `yogurt-dau-tam`, `cold-brew-me`, `ca-phe-muoi`, `bac-xiu-da-lat`, `ca-phe-sua`)
  - 6 snacks (`snack-<id>.webp` for all 6 snacks)
  - Macro toppings (`topping-hat-sen.webp`, `topping-khuc-bach.webp`, `topping-kem-trung.webp`, `topping-tran-chau-den.webp`, `topping-hat-dac-rim.webp`, plus candidate crops from `#32`/`#50` if `>= 200x200` and visually crisp)
  - High-res space & seasonal gallery photos (`maxDimension: 1200`)
- Prune any `.webp` file under `apps/web/public/images/fanpage` and `apps/admin/public/images/fanpage` not produced by `FANPAGE_PHOTO_SOURCES`.
- Run `pnpm sync:photos` and inspect **every generated `.webp`** via `read_file`, refining `extract` boxes immediately if any crop clips a cup rim or includes adjacent items.

- [ ] **Step 4: Run `fanpage-assets.test.ts` (temporarily before manifest update, verify `extract` unit test passes)**

Run: `pnpm --filter @omsua/web test src/lib/fanpage-assets.test.ts`
Expected: `extract` unit test PASSES (asset path test updates with Task 2's manifest).

---

### Task 2: Expand `@omsua/shared` Manifest to Full 1:1 Coverage & Enforce Zero Orphan/Duplicate Assets

**Files:**
- Modify: `packages/shared/src/fanpage-media.ts`
- Modify: `packages/shared/src/fanpage-media.test.ts`
- Modify: `apps/web/src/lib/fanpage-assets.test.ts`

**Interfaces:**
- Produces (from `@omsua/shared`):
  - `BranchPhotoMeta`: `{ src: string; caption: string; postUrl: string; objectPosition?: string }`
  - `BRANCH_PHOTO_BY_ID`: 4 unique branch `.webp` paths (`branch-cs1-hoang-dieu.webp`, `branch-cs2-hem-33-nct.webp`, `branch-cs3-158-nct.webp`, `branch-cs4-duc-trong.webp`)
  - `PRODUCT_PHOTO_BY_ID`: unique 1:1 `.webp` paths covering `21` drinks, `6/6` snacks, and all visually verified macro toppings (`>= 5` toppings)
  - `FANPAGE_GALLERY_ITEMS`: `16` high-resolution items (`6` `khong-gian`, `6` `thuc-uong`, `4` `banh-trang`)

- [ ] **Step 1: Write failing tests in `packages/shared/src/fanpage-media.test.ts` and `apps/web/src/lib/fanpage-assets.test.ts`**

Assert:
1. `FANPAGE_GALLERY_ITEMS` has length `16` (`6` `khong-gian`, `6` `thuc-uong`, `4` `banh-trang`).
2. Every entry in `BRANCH_PHOTO_BY_ID` (`4` branches) has a unique `src`, and every entry in `PRODUCT_PHOTO_BY_ID` has a unique `src` (zero shared duplicate `.webp` files across different products/toppings).
3. All `6` snacks (`100%`), `21` drinks (`tra-sua-flan-chay-canh`, `sua-tuoi-duong-den`, `ca-phe-den` excluded), and all verified toppings (`hat-sen`, `khuc-bach`, `kem-trung`, `tran-chau-den`, `hat-dac-rim`, etc.) are mapped in `PRODUCT_PHOTO_BY_ID`.
4. `fanpage-assets.test.ts` verifies `RIFF....WEBP` magic bytes + size `> 2048` on BOTH `apps/web/public` and `apps/admin/public`, AND verifies that every `.webp` file recursively present under `apps/web/public/images/fanpage` and `apps/admin/public/images/fanpage` is referenced by `@omsua/shared` (zero orphan `.webp` files).

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/shared test && pnpm --filter @omsua/web test src/lib/fanpage-assets.test.ts`
Expected: FAIL (`FANPAGE_GALLERY_ITEMS` length `12` vs `16`, duplicate `src` entries, legacy `.webp` paths).

- [ ] **Step 3: Update `packages/shared/src/fanpage-media.ts`, rebuild `@omsua/shared`, and verify disk parity**

Update `BranchPhotoMeta`, `BRANCH_PHOTO_BY_ID`, `PRODUCT_PHOTO_BY_ID`, and `FANPAGE_GALLERY_ITEMS` with exact canonical `.webp` paths, `objectPosition` values verified from Task 1's `read_file` pass, and consistent `postUrl` links. Remove any unreferenced `.webp` if not mapped in `@omsua/shared`.

- [ ] **Step 4: Run shared & asset tests to verify they pass**

Run: `pnpm build:shared && pnpm --filter @omsua/shared test && pnpm --filter @omsua/web test src/lib/fanpage-assets.test.ts`
Expected: PASS (`0` failures).

- [ ] **Step 5: Commit Tasks 1 & 2**

```bash
git add scripts/sync-fanpage-photos.mjs packages/shared/src/fanpage-media.ts packages/shared/src/fanpage-media.test.ts apps/web/src/lib/fanpage-assets.test.ts apps/web/public/images/fanpage apps/admin/public/images/fanpage
git commit -m "feat(assets,shared): harvest full-res 1:1 fanpage photos for 32+ SKUs, 4 branches, and 16-item gallery"
```

---

### Task 3: Polish Branch `objectPosition`, Lightbox Slide Key, Tests & Documentation (`@omsua/web`, `@omsua/admin`, `README.md`)

**Files:**
- Modify: `apps/web/src/components/modals/PhotoLightboxModal.tsx`
- Modify: `apps/web/src/components/storefront/BrandFooter.tsx`
- Modify: `apps/admin/src/pages/BranchesPage.tsx`
- Modify: `apps/web/src/components/storefront/fanpage-gallery.test.tsx`
- Modify: `apps/admin/src/App.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `BranchPhotoMeta.objectPosition`, 16-item `FANPAGE_GALLERY_ITEMS`, canonical `branch-cs1-hoang-dieu.webp` path, and topping photo mappings from `@omsua/shared`.
- Produces: Framed branch banners in Web & Admin, keyed `PhotoLightboxModal` `<img>`, updated Web/Admin tests, and accurate `README.md` asset documentation.

- [ ] **Step 1: Write failing tests in `apps/web/src/components/storefront/fanpage-gallery.test.tsx` and `apps/admin/src/App.test.tsx`**

Update/add assertions:
1. `fanpage-gallery.test.tsx`: `"Tất cả (16)"` and `"Bánh tráng Nhà Ốm (4)"`, `BrandFooter` branch `<img>` applies `style.objectPosition` from `getBranchPhoto(branch.id)?.objectPosition`, and `ToppingStripSection` renders real `.webp` `<img>` thumbnails for mapped toppings (such as `hat-sen` and `khuc-bach`).
2. `apps/admin/src/App.test.tsx`: `branch-photo-cs1-hoang-dieu` has canonical `src="/images/fanpage/branches/branch-cs1-hoang-dieu.webp"` and `objectPosition` style, and newly photographed items (`tra-sua-atiso-chuoi`, `com-chay-cha-bong`) display `"Ảnh thực tế"` on `/menu`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/storefront/fanpage-gallery.test.tsx && pnpm --filter @omsua/admin test src/App.test.tsx`
Expected: FAIL (`Tất cả (12)` vs `(16)` / missing `objectPosition` style).

- [ ] **Step 3: Implement UI polish in `PhotoLightboxModal.tsx`, `BrandFooter.tsx`, `BranchesPage.tsx`, and update `README.md`**

- Add `key={currentItem.src}` to `<img ... />` in `PhotoLightboxModal.tsx`.
- Pass `style={{ objectPosition: branchPhoto.objectPosition ?? 'center' }}` on branch `<img>` elements in `BrandFooter.tsx` and `BranchesPage.tsx`.
- Update `README.md` directory counts and 1:1 fanpage coverage summary.

- [ ] **Step 4: Run full monorepo verification gate**

Run: `pnpm --reporter=append-only build && pnpm --reporter=append-only typecheck && pnpm --reporter=append-only lint && pnpm --reporter=append-only test`
Expected: PASS (`0` errors, `0` warnings across all 4 workspace packages).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/modals/PhotoLightboxModal.tsx apps/web/src/components/storefront/BrandFooter.tsx apps/admin/src/pages/BranchesPage.tsx apps/web/src/components/storefront/fanpage-gallery.test.tsx apps/admin/src/App.test.tsx README.md
git commit -m "feat(web,admin,docs): apply branch objectPosition framing, lightbox slide key, and updated asset docs"
```
