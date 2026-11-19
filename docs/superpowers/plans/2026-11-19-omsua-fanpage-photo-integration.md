# Ốm Sữa Fanpage Photo & Real Gallery Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Download, optimize, and integrate real photography and verified social metadata from the official `Ốm Sữa - Trà sữa Đà Lạt` Facebook fanpage (`@trasuadalatomsua`) across `@omsua/shared`, `@omsua/web`, and `@omsua/admin` with automatic studio-vector fallback.

**Architecture:** `@omsua/shared` owns a typed local-path manifest (`FANPAGE_GALLERY_ITEMS`, `PRODUCT_PHOTO_BY_ID`, `BRANCH_PHOTO_BY_ID`, `OMSUA_SOCIAL_LINKS`) containing zero expiring `fbcdn.net` URLs. A one-shot Node + `sharp` ingestion script (`scripts/sync-fanpage-photos.mjs`) downloads the 19 surveyed fanpage photos, validates image headers/dimensions, and writes optimized `.webp` files into `apps/web/public/images/fanpage/` and `apps/admin/public/images/fanpage/branches/`. `@omsua/web` and `@omsua/admin` render these local `.webp` photos inside warm Đà Lạt frames via `<ProductMedia />`, `<FanpageGallerySection />` + `<PhotoLightboxModal />`, and branch cards, falling back seamlessly to `<ProductIllustration />` on missing mappings or `onError`.

**Tech Stack:** TypeScript 5, Node.js 22 (`fetch`, `node:fs`), `sharp` 0.35 (bundled via `@omsua/web` Next.js 15), React 19, Tailwind CSS v4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-19-omsua-fanpage-photo-integration-design.md` (companion to `docs/superpowers/specs/2026-11-18-omsua-storefront-ordering-design.md`)

## Global Constraints

- **Node.js `>= 22.0.0` & `pnpm >= 10.0.0`:** Zero new external npm packages; resolve `sharp` from the existing workspace (`apps/web/node_modules/next` / pnpm store).
- **Zero Pure `#FFFFFF` or `#000000`:** Never introduce `#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)`, or Tailwind `*-white` / `*-black` utilities in any `.ts`, `.tsx`, `.css`, `.html`, or `.svg` file. Use `#F7F4EC` (`surface-light`), `#EEEADF` (`canvas-cream`), and `#29261D` (`espresso` / `hero-espresso`).
- **Zero Runtime Hotlinking to `fbcdn.net`:** Runtime UI components and `@omsua/shared` exports must reference only local `/images/fanpage/...webp` paths; `scontent.*.fbcdn.net` download URLs live exclusively in `scripts/sync-fanpage-photos.mjs` (while permanent `https://www.facebook.com/...` post links are used only for external `"Xem bài gốc trên Fanpage"` anchors).
- **100% Graceful Fallback:** Every `<img>` rendered for a product, topping, gallery card, or branch card must handle `onError` without leaving a broken browser image icon (falling back to `<ProductIllustration />` for menu items or a warm brand placeholder for gallery/branch frames).
- **WCAG AA & Mobile Ergonomics:** All interactive pills, toggle buttons, social links, and lightbox controls must enforce `min-h-11` (`>= 44px`), preserve existing `aria-label` / `getByRole` / `getByText` contracts across all 138 existing tests, and use `useModalAccessibility` for `PhotoLightboxModal`.

## Review Focus

1. **Runtime `<img>` load failure (`onError`):** When `/images/fanpage/products/drink-tra-sua-atiso.webp` fails to load in the browser, `<ProductMedia productId="tra-sua-atiso" />` must catch `onError` and immediately render the `<svg>` from `<ProductIllustration productId="tra-sua-atiso" />` instead of a broken `<img>`.
2. **Expired `fbcdn.net` signature returning HTML/text during asset sync:** `validateAndOptimizePhotoBuffer(buffer, contentType, maxDimension)` in `scripts/sync-fanpage-photos.mjs` must reject non-`image/*` content types and buffers whose `sharp` metadata lacks `width >= 200` and `height >= 200`, throwing an explicit error rather than writing corrupt `.webp` files.
3. **Pure `#FFFFFF` / `#000000` in lightbox backdrops or photo caption overlays:** Recursive static source scanners in `apps/web/src/lib/web-review.test.ts` and `apps/admin/src/vite-config.test.ts` must scan all newly added components and pass with `0` violations.
4. **Duplicate screen-reader announcements inside product cards:** `<ProductMedia />` without an explicit `title` or `alt` prop must render `alt=""` and `aria-hidden="true"` on the `<img>` wrapper so adjacent `<h3>`/`<h4>` product titles remain the single accessible name.
5. **Keyboard cycling & focus restoration in `PhotoLightboxModal`:** Pressing `ArrowRight` on the last filtered gallery photo wraps to index `0`, `ArrowLeft` on index `0` wraps to the last photo, `Escape` closes the modal, and focus returns to the gallery trigger button.

---

## File Structure

- **Shared Manifest (`packages/shared`):**
  - Create `packages/shared/src/fanpage-media.ts` — canonical types, `OMSUA_SOCIAL_LINKS`, `FANPAGE_GALLERY_ITEMS` (12 items), `PRODUCT_PHOTO_BY_ID`, `BRANCH_PHOTO_BY_ID`, `getProductPhoto()`, `getBranchPhoto()`.
  - Modify `packages/shared/src/index.ts` — re-export fanpage media contracts and helpers.
  - Create `packages/shared/src/fanpage-media.test.ts` — unit tests for manifest integrity, catalog/branch ID alignment, and zero `fbcdn.net` runtime URLs.
- **Asset Ingestion Pipeline (`scripts/` & `public/images/fanpage/`):**
  - Create `scripts/sync-fanpage-photos.mjs` — exports `validateAndOptimizePhotoBuffer()` + CLI runner downloading 19 fanpage photos into `apps/web/public/images/fanpage/{branches,space,products,seasonal}/*.webp` and copying the 4 branch `.webp` files into `apps/admin/public/images/fanpage/branches/*.webp`.
  - Modify `package.json` — add `"sync:photos": "node scripts/sync-fanpage-photos.mjs"`.
  - Create `apps/web/src/lib/fanpage-assets.test.ts` — verifies `validateAndOptimizePhotoBuffer()` rejects non-image/tiny payloads and asserts every `.webp` referenced by `@omsua/shared` exists on disk in `apps/web/public` and `apps/admin/public` with valid RIFF `WEBP` magic bytes.
- **Storefront Integration (`apps/web`):**
  - Create `apps/web/src/components/artwork/ProductMedia.tsx` — hybrid real `.webp` photo + `<ProductIllustration />` fallback component.
  - Create `apps/web/src/components/artwork/ProductMedia.test.tsx` — tests real `<img>` rendering, `alt=""` default vs explicit `alt`, `preferIllustration` toggle, and `onError` SVG fallback.
  - Create `apps/web/src/components/modals/PhotoLightboxModal.tsx` — accessible warm-palette lightbox modal (`useModalAccessibility`, `ArrowLeft`/`ArrowRight` wrap-around, Facebook post link).
  - Create `apps/web/src/components/storefront/FanpageGallerySection.tsx` — `#khong-gian` 12-photo curated gallery with 4 filter tabs and social proof strip.
  - Create `apps/web/src/components/storefront/fanpage-gallery.test.tsx` — tests category filtering, lightbox keyboard wrap-around, `Escape` close, and `BrandFooter` social links/branch thumbnails.
  - Modify `HeroSpotlight.tsx`, `DrinkMenuSection.tsx`, `ToppingStripSection.tsx`, `SnackMenuSection.tsx`, `ProductCustomizerModal.tsx`, `CartCheckoutDrawer.tsx`, `BrandFooter.tsx`, `StorefrontHeader.tsx`, `StorefrontClientShell.tsx`, `storefront/index.ts` — wire `<ProductMedia />`, `"Ảnh thực tế / Minh họa Studio"` toggle, `#khong-gian` nav & gallery section, branch storefront photos, and verified social links.
- **Admin & Documentation (`apps/admin` & `README.md`):**
  - Modify `apps/admin/src/pages/BranchesPage.tsx` & `apps/admin/src/pages/MenuPage.tsx` — render branch storefront `.webp` banner thumbnails (with `onError` fallback) and `"Ảnh thực tế"` indicator pill on mapped menu products.
  - Modify `apps/admin/src/App.test.tsx` & `README.md` — test Admin photo enhancements and document `pnpm sync:photos` + hybrid media architecture.

---

### Task 1: Shared Fanpage Media Manifest & Social Metadata (`@omsua/shared`)

**Files:**
- Create: `packages/shared/src/fanpage-media.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `packages/shared/src/fanpage-media.test.ts`

**Interfaces:**
- Consumes: `OMSUA_BRANCHES`, `OMSUA_DRINKS`, `OMSUA_SNACKS`, `OMSUA_TOPPINGS` from `packages/shared/src/seed-data.ts`
- Produces (exported from `@omsua/shared`):
  - `export type FanpageGalleryCategory = 'all' | 'khong-gian' | 'thuc-uong' | 'banh-trang'`
  - `export interface FanpagePhotoItem { id: string; category: Exclude<FanpageGalleryCategory, 'all'>; src: string; title: string; caption: string; postUrl: string; aspectRatio: '4/3' | '4/5' | '1/1'; }`
  - `export interface ProductPhotoMeta { src: string; objectPosition?: string; postUrl: string; }`
  - `export interface BranchPhotoMeta { src: string; caption: string; postUrl: string; }`
  - `export const OMSUA_SOCIAL_LINKS: { readonly facebook: string; readonly instagram: string; readonly tiktok: string; readonly handle: string; readonly followersLabel: string; readonly ratingLabel: string; }`
  - `export const FANPAGE_GALLERY_ITEMS: readonly FanpagePhotoItem[]` (12 items)
  - `export const PRODUCT_PHOTO_BY_ID: Readonly<Record<string, ProductPhotoMeta>>`
  - `export const BRANCH_PHOTO_BY_ID: Readonly<Record<string, BranchPhotoMeta>>`
  - `export function getProductPhoto(targetId: string | undefined): ProductPhotoMeta | null`
  - `export function getBranchPhoto(branchId: string | undefined): BranchPhotoMeta | null`

- [ ] **Step 1: Write the failing test in `packages/shared/src/fanpage-media.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import {
  BRANCH_PHOTO_BY_ID,
  FANPAGE_GALLERY_ITEMS,
  OMSUA_BRANCHES,
  OMSUA_DRINKS,
  OMSUA_SNACKS,
  OMSUA_SOCIAL_LINKS,
  OMSUA_TOPPINGS,
  PRODUCT_PHOTO_BY_ID,
  getBranchPhoto,
  getProductPhoto,
} from './index';

describe('fanpage-media manifest (@omsua/shared)', () => {
  it('exports verified social metadata and 12 gallery items with local .webp paths and zero fbcdn.net URLs', () => {
    expect(OMSUA_SOCIAL_LINKS.facebook).toBe(
      'https://www.facebook.com/trasuadalatomsua',
    );
    expect(OMSUA_SOCIAL_LINKS.instagram).toBe(
      'https://www.instagram.com/omsuadalat',
    );
    expect(OMSUA_SOCIAL_LINKS.tiktok).toBe('https://tiktok.com/@omsuaphache');
    expect(FANPAGE_GALLERY_ITEMS).toHaveLength(12);

    for (const item of FANPAGE_GALLERY_ITEMS) {
      expect(item.src).toMatch(/^\/images\/fanpage\/[a-z0-9/-]+\.webp$/);
      expect(item.src).not.toContain('fbcdn.net');
      expect(item.postUrl).toMatch(/^https:\/\/www\.facebook\.com\//);
    }
  });

  it('maps valid catalog product/topping IDs and covers all 4 canonical branches', () => {
    const validCatalogIds = new Set([
      ...OMSUA_DRINKS.map((d) => d.id),
      ...OMSUA_SNACKS.map((s) => s.id),
      ...OMSUA_TOPPINGS.map((t) => t.id),
    ]);

    const mappedKeys = Object.keys(PRODUCT_PHOTO_BY_ID);
    expect(mappedKeys.length).toBeGreaterThanOrEqual(14);
    for (const key of mappedKeys) {
      expect(validCatalogIds.has(key), `Unknown catalog ID: ${key}`).toBe(true);
      expect(getProductPhoto(key)?.src).toMatch(
        /^\/images\/fanpage\/products\/[a-z0-9-]+\.webp$/,
      );
    }
    expect(getProductPhoto('unknown-id')).toBeNull();
    expect(getProductPhoto(undefined)).toBeNull();

    for (const branch of OMSUA_BRANCHES) {
      const photo = getBranchPhoto(branch.id);
      expect(photo, `Missing branch photo for ${branch.id}`).not.toBeNull();
      expect(photo?.src).toMatch(
        /^\/images\/fanpage\/branches\/[a-z0-9-]+\.webp$/,
      );
      expect(BRANCH_PHOTO_BY_ID[branch.id]).toBeDefined();
    }
    expect(getBranchPhoto('unknown-branch')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @omsua/shared test`
Expected: FAIL (`getProductPhoto` / `FANPAGE_GALLERY_ITEMS` is not exported from `./index`).

- [ ] **Step 3: Implement `packages/shared/src/fanpage-media.ts` and re-export from `packages/shared/src/index.ts`**

Populate exact mappings from Spec §2.1, §2.2, and §3:
- `BRANCH_PHOTO_BY_ID`: `cs1-hoang-dieu` -> `/images/fanpage/branches/branch-hoang-dieu.webp`, `cs2-hem-33-nct` -> `/images/fanpage/branches/branch-hem-33-nct.webp`, `cs3-158-nct` -> `/images/fanpage/branches/branch-nguyen-cong-tru.webp`, `cs4-duc-trong` -> `/images/fanpage/branches/branch-duc-trong-vuon-hoa.webp`.
- `PRODUCT_PHOTO_BY_ID`: map `tra-sua-atiso`, `tra-sua-atiso-chuoi`, `tra-atiso-sen-chia`, `quyt-nhai-cat-tuong`, `matcha-latte`, `matcha-oreo-da-xay`, `ca-phe-kem-tiramisu`, `tra-sua-tiramisu`, `ca-phe-sua`, `ca-phe-muoi`, `bac-xiu-da-lat`, `tran-chau-trang`, `banh-trang-tron-top-mo`, `com-chay-cha-bong`, `banh-trang-sot-tac`, `phoi-suong-toi-ot`, `banh-cham-long-dao`, `banh-trang-cuon-bo` to the 11 `/images/fanpage/products/*.webp` slugs in Spec §2.2.
- `FANPAGE_GALLERY_ITEMS`: 12 curated items across `'khong-gian'` (5 items: `space-morning-01`, `space-morning-02`, `space-street-dalat`, `branch-hoang-dieu`, `branch-hem-33-nct`), `'thuc-uong'` (4 items: `drink-tra-sua-atiso`, `drink-quyt-nhai`, `seasonal-hong-trung-lang`, `drink-matcha-latte`), and `'banh-trang'` (3 items: `snack-banh-trang-top-mo`, `snack-banh-trang-sot-tac`, `snack-banh-cham-long-dao`).

- [ ] **Step 4: Build `@omsua/shared` and verify tests pass**

Run: `pnpm --filter @omsua/shared build && pnpm --filter @omsua/shared test && pnpm --filter @omsua/shared lint`
Expected: PASS (`3` test suites green, dual CJS/ESM build succeeds).

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/fanpage-media.ts packages/shared/src/fanpage-media.test.ts packages/shared/src/index.ts
git commit -m "feat(shared): add Ốm Sữa fanpage photo manifest and verified social links"
```

---

### Task 2: Fanpage Photo Downloader, `sharp` WebP Optimizer & Local Asset Verification

**Files:**
- Create: `scripts/sync-fanpage-photos.mjs`
- Create: `apps/web/public/images/fanpage/...` (19 `.webp` files) & `apps/admin/public/images/fanpage/branches/...` (4 `.webp` files)
- Modify: `package.json`
- Test: `apps/web/src/lib/fanpage-assets.test.ts`

**Interfaces:**
- Consumes: `FANPAGE_GALLERY_ITEMS`, `PRODUCT_PHOTO_BY_ID`, `BRANCH_PHOTO_BY_ID` from `@omsua/shared`
- Produces:
  - `export async function validateAndOptimizePhotoBuffer(buffer: Buffer, contentType: string | null, maxDimension?: number): Promise<{ data: Buffer; width: number; height: number }>` in `scripts/sync-fanpage-photos.mjs`
  - Verified `.webp` files at every `src` path declared in `@omsua/shared` under `apps/web/public` (and branch `.webp` files mirrored under `apps/admin/public`)

- [ ] **Step 1: Write the failing test in `apps/web/src/lib/fanpage-assets.test.ts`**

```ts
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  BRANCH_PHOTO_BY_ID,
  FANPAGE_GALLERY_ITEMS,
  PRODUCT_PHOTO_BY_ID,
} from '@omsua/shared';
import { describe, expect, it } from 'vitest';
// @ts-expect-error -- ESM script module
import { validateAndOptimizePhotoBuffer } from '../../../../scripts/sync-fanpage-photos.mjs';

describe('Fanpage local WebP assets & sharp validation pipeline', () => {
  it('rejects non-image content types and tiny/corrupt buffers before writing disk files', async () => {
    await expect(
      validateAndOptimizePhotoBuffer(
        Buffer.from('<html>signature expired</html>'),
        'text/html; charset=utf-8',
      ),
    ).rejects.toThrow(/content-type/i);

    await expect(
      validateAndOptimizePhotoBuffer(Buffer.from('not-an-image'), 'image/jpeg'),
    ).rejects.toThrow();
  });

  it('ships valid, non-empty RIFF WEBP files for every gallery, product, and branch photo in web and admin public dirs', () => {
    const webPublic = path.resolve(__dirname, '..', '..', 'public');
    const adminPublic = path.resolve(__dirname, '..', '..', '..', 'admin', 'public');

    const allWebPaths = new Set<string>([
      ...FANPAGE_GALLERY_ITEMS.map((item) => item.src),
      ...Object.values(PRODUCT_PHOTO_BY_ID).map((meta) => meta.src),
      ...Object.values(BRANCH_PHOTO_BY_ID).map((meta) => meta.src),
    ]);

    for (const relSrc of allWebPaths) {
      const fullPath = path.join(webPublic, relSrc);
      expect(existsSync(fullPath), `Missing web asset: ${relSrc}`).toBe(true);
      const size = statSync(fullPath).size;
      expect(size).toBeGreaterThan(2048);
      expect(size).toBeLessThan(400 * 1024);

      const header = readFileSync(fullPath).subarray(0, 12);
      expect(header.subarray(0, 4).toString('ascii')).toBe('RIFF');
      expect(header.subarray(8, 12).toString('ascii')).toBe('WEBP');
    }

    for (const meta of Object.values(BRANCH_PHOTO_BY_ID)) {
      const adminBranchPath = path.join(adminPublic, meta.src);
      expect(
        existsSync(adminBranchPath),
        `Missing admin branch asset: ${meta.src}`,
      ).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @omsua/web test src/lib/fanpage-assets.test.ts`
Expected: FAIL (`Cannot find module '../../../../scripts/sync-fanpage-photos.mjs'`).

- [ ] **Step 3: Implement `scripts/sync-fanpage-photos.mjs`, add `"sync:photos"` to root `package.json`, and run it**

Load `sharp` via `createRequire` anchored at `apps/web/node_modules/next/package.json` (fallback to root `import.meta.url`). Configure the 19 surveyed fanpage sources:
1. `branches/branch-hoang-dieu.webp` (`max: 800`): `https://scontent.fsgn5-1.fna.fbcdn.net/v/t39.30808-6/492006583_1285024350162229_7307278815580420121_n.jpg?stp=dst-jpg_tt6&cstp=mx1252x1252&ctp=s552x414&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFT8EFL5jOpSvJdzeocYOea2oEPWlkwQo7agQ9aWTBCjhn4J-MdjuEdMqEck7wty7f8frQjzTmfkjc-ZwIQyR3n&_nc_ohc=PNkDCmSZxqUQ7kNvwGjsLyW&_nc_oc=AdqU3Mve9Llo7snTJECd9EaU9gAaKNN444NmYzJ_a_qZfdR7eXtPin8-U0xVWMWRjh4HH-Qa9_V5rVv547m8NBpzb&_nc_zt=23&_nc_ht=scontent.fsgn5-1.fna&_nc_gid=pt-Mrjo-7smJj9AEAypWHw&_nc_ss=7b2a8&oh=00_AQT5QHEBqznADBI2AmV190LBEnqe3GlRI1R1q57IT5Uqtg&oe=6B045126`
2. `branches/branch-hem-33-nct.webp` (`max: 800`): `https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/491043331_1285024300162234_4753694535174971019_n.jpg?stp=dst-jpg_tt6&cstp=mx1250x1250&ctp=s552x414&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeH4CxJ384_fmeDzeaPq8SlhwOM7ZMviYSzA4ztky-JhLBVNmumkg2hUNu0gvfXb27hRZQ50dxYMx5YO1qxue8BU&_nc_ohc=lFVoQMiFzc0Q7kNvwEuungq&_nc_oc=AdrSm4xRwjp4YlTnEb0KzbSsfxr7CTtB-ffCrCMQjSZKOUyBJAcCPQX_MywPjKVBn0GTdaEgtZvgDYesSUypPiK2&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=Q0fmL6n7QcANIUNtw9K5Kw&_nc_ss=7b2a8&oh=00_AQRiHcT1zGefvE6i-p9vkUWQao67DoZpwsYSoG1jLdpqpA&oe=6B044D1E`
3. `branches/branch-nguyen-cong-tru.webp` (`max: 960`): `https://scontent.fsgn5-22.fna.fbcdn.net/v/t39.99422-6/874488220_1164406112822741_8851282115556108221_n.png?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=111&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHRi2VzbbaV2zag2MpucALuKGkrdpZKqwEoaSt2lkqrAWW0Narym5s9EOBjX28kB99pDIDZwMeQfNp2QZm67bs9&_nc_ohc=HLhRZi-EXjQQ7kNvwHea97L&_nc_oc=AdrFadK-cGEzfCjLtEe7NSdbV2gjVUHj-dau-0jc9XSk3ooxCzrClA29QYE1p0Wm9dZh9Ta_TuYoETvyp8t_nxfd&_nc_zt=14&_nc_ht=scontent.fsgn5-22.fna&_nc_gid=ULcLOKJYkF_F7KRBZUTOSw&_nc_ss=7b2a8&oh=00_AQQIw3s2wfOM3wxAMH_ZgJI-Jh9G1xtEZ5ho4CyQ37GVoA&oe=6B046537`
4. `branches/branch-duc-trong-vuon-hoa.webp` (`max: 800`): `https://scontent.fsgn5-1.fna.fbcdn.net/v/t39.30808-6/492008759_1285024283495569_8542372184927399953_n.jpg?stp=dst-jpg_tt6&cstp=mx1252x1252&ctp=s552x414&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFQ2oQKtQAiLQvbehPF-3TPJ0coq4bRvIknRyirhtG8iTD1RMy8LFeOp5Kl0OXysqLMXsPZauZfwtoLPD3WnNlk&_nc_ohc=ldRmEa-20ScQ7kNvwEdJo-n&_nc_oc=AdoPD-kUr1Sr-A4o-DNNM6EbreZii_pS1heRZ_YGrgHi-_QeSnNk3BtOiJz6D6xNlI4sTKdTF73wbkvePU7SBBpb&_nc_zt=23&_nc_ht=scontent.fsgn5-1.fna&_nc_gid=pt-Mrjo-7smJj9AEAypWHw&_nc_ss=7b2a8&oh=00_AQQK0uQ8NbdmCdWSOcnIxjQPiHr3RuKwzMIJAwE5pi2YjQ&oe=6B0450EF`
5. `space/space-morning-01.webp` (`max: 960`): `https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/548025700_1420044753326854_737510483725628327_n.jpg?stp=dst-jpg_tt6&cstp=mx1366x2048&ctp=s552x414&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHq5-0OXNV4WhEH4f5xL6bWX9Xp0E5NhLtf1enQTk2Eu58MzyqysW-FbB-1eFSj7l5wqTVVb6a_lOHgpi-eINhV&_nc_ohc=NHdgyR5GDrYQ7kNvwF54WG6&_nc_oc=AdpFaEeW0lqlYic4VRNWSz5SRKZmIRvppcLVmAodwJt2aOH9KgHwaqL1xGu9BDLowvAQI9UGs2nggbM-pW9j4Wrf&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=Q0fmL6n7QcANIUNtw9K5Kw&_nc_ss=7b2a8&oh=00_AQT8gwKKsTh2i7shOv9ilRKr2MZ2QU663UjeT1IYt4_dzw&oe=6B045DDC`
6. `space/space-morning-02.webp` (`max: 960`): `https://scontent.fsgn5-13.fna.fbcdn.net/v/t39.30808-6/549261856_1420044763326853_7200004865330505728_n.jpg?stp=dst-jpg_tt6&cstp=mx1366x2048&ctp=s552x414&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHybhC2pG7El50PnrX2QiHz_QjU1lDFYPv9CNTWUMVg-wCx_y_8RMwRdR5iJB1UHy4XDU79JpqozXF4r0V-G_LL&_nc_ohc=EB7AetDC3tcQ7kNvwFxx_Xk&_nc_oc=AdouyxhFB_Z4kUTjjYAz-z_T_MmRo_ELImYbWwidOrL7UFsKT5-HMmN-gbUzhdFfDw50DEvm04zobFHBKfqlBfqX&_nc_zt=23&_nc_ht=scontent.fsgn5-13.fna&_nc_gid=Q0fmL6n7QcANIUNtw9K5Kw&_nc_ss=7b2a8&oh=00_AQRvF0-dhv9ZhjC9rX5HjLd0n6CCwMjvu5Jn--PA_EsCjA&oe=6B044C8B`
7. `space/space-street-dalat.webp` (`max: 960`): `https://scontent.fsgn5-2.fna.fbcdn.net/v/t39.30808-6/863511835_1812186644112661_1186378661690163911_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGaueQeCBqhTcOBHD7DH7ICMN8EyRMPidUw3wTJEw-J1VjPweOAq9gjru1UCPhJRlYI7RMZOpjvp8SCzloy8ZtG&_nc_ohc=kt6IYe4jbr4Q7kNvwEomx57&_nc_oc=Adppv5ZX6_H6SW1FXGkoCkMW41LfKBGmHW4Pj3phD8TBIWW9nBszSanh-EV6-r9e93cAvbGhJWcprpTRJ-ait9iT&_nc_zt=23&_nc_ht=scontent.fsgn5-2.fna&_nc_gid=aLYiPa9y3EgbQS9x_OLoYw&_nc_ss=7b2a8&oh=00_AQQXA1MotPljjBiQEMO06GZUPtMlLQRSfdwnX-CeuMgN5Q&oe=6B046275`
8. `products/drink-tra-sua-atiso.webp` (`max: 640`): `https://scontent.fsgn5-7.fna.fbcdn.net/v/t39.30808-6/490244681_1281262833871714_3765918317492135566_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=p526x296&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHMEbbWWwxvyFWQRKbuv4D2qXzdhlfYu1WpfN2GV9i7VUeWENSiQ7TrWkFzJPuInzK9RrGsiBKcPnp1WUhDWcDj&_nc_ohc=9JNb3wP1SawQ7kNvwHvy3h9&_nc_oc=AdoWeJd4xsPrDY6oHBWePNVN2g4caQ3TsUH-_gAgtNwcRcIn1XS21vldH9be6KAIj2hO6NPLmSi0vPil75TcBo4Q&_nc_zt=23&_nc_ht=scontent.fsgn5-7.fna&_nc_gid=vjiTGnuafVHRgXSDyL043g&_nc_ss=7b2a8&oh=00_AQSrwoApuFugrQhuo0bDj09G1GxfCqmzyIOjq8sGngczpg&oe=6B0457F6`
9. `products/drink-atiso-chuoi.webp` (`max: 640`): `https://scontent.fsgn5-8.fna.fbcdn.net/v/t39.30808-6/491996875_1285024310162233_3428697168946334763_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=p526x296&_nc_cat=102&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeG0115XS0lDRb4sPyIYw_ovOVFLymScSrs5UUvKZJxKu8Am05LKmfreB5an8WcyUJE_5lBWRf9IzXPeeMQwIiiM&_nc_ohc=5WbkCmXg2vQQ7kNvwEbRJub&_nc_oc=AdobIxTZK84qZpgN_NE5jTPmCYXFE-a8vN-pAcJ4KdozAovkbMvkRJj6UXVuQ8u4AIDmZk8k3XlQwlM76_fr_MTN&_nc_zt=23&_nc_ht=scontent.fsgn5-8.fna&_nc_gid=vjiTGnuafVHRgXSDyL043g&_nc_ss=7b2a8&oh=00_AQQqGkxZWERHoFC369pXOC3jFjJTENQt841XFU7K61eOQA&oe=6B047474`
10. `products/drink-quyt-nhai.webp` (`max: 640`): `https://scontent.fsgn5-21.fna.fbcdn.net/v/t39.30808-6/619618333_1535984968399498_2149815520543420901_n.jpg?stp=dst-jpg_tt6&cstp=mx1638x2048&ctp=s640x640&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFZaLXn21c9uDoCtuodAEfr5aTux8rpwdvlpO7HyunB2-o9Rny5VowxXOVZwPSWQZXOcqLqoHpz76uq-1HwLv2n&_nc_ohc=qnI9xWxFa_UQ7kNvwG44qfE&_nc_oc=AdqS2-WNnUbTqWFj-golXU8s3YAWt1lN6xBcWvgCE2-eLt2Y4EMUXgBkyTakq0PcyZ6OASjL6YBHI-WMZpG-mTT1&_nc_zt=23&_nc_ht=scontent.fsgn5-21.fna&_nc_gid=OMST3HZ2LIBDCJ0C5tgUJg&_nc_ss=7b2a8&oh=00_AQSz-6aN1g1JUQ3asUEOfE-d5otNMkwpPIHFGX37Wni1dw&oe=6B046985`
11. `products/drink-matcha-latte.webp` (`max: 640`): `https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/543181062_1408975524433777_2588488351793530384_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1351&ctp=s1080x1351&_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeETcTCZZC6uLu_xJlXLDPSKroV1j3HWXniuhXWPcdZeeDA0EMLjQqAVaZTcDLydjNRhIMrqVLLuqe1DNDvbtcWw&_nc_ohc=l3fre8UVzN8Q7kNvwHkyZmO&_nc_oc=AdowxVSGTbB3JNOq_-jChQ8aCJVHz4iFBqsuNQTrRo4bT3kB3pQLiyKbwPGn3IQGdDKdOoi_03UwwFUPvASdmraM&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=aufVIgO9sgkMRrJhQJHMWg&_nc_ss=7b2a8&oh=00_AQQho1TjgZnqrSkDuEa5vovkBvEX7Nxlwj9Rjvb_HhPYLQ&oe=6B044E41`
12. `products/drink-matcha-oreo.webp` (`max: 640`): `https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/543365004_1408975527767110_505982448827614146_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1351&ctp=s1080x1351&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeE4APyi-TMmjBJaaYofxGRQt9C8BoNm73O30LwGg2bvcycazfjmJKuKxK_ilSvb4NGfr7KK42y9wowxAPEsAF88&_nc_ohc=dnfz1wzUyH0Q7kNvwF3cEEo&_nc_oc=AdoJIhm2GC-zQIU2IckPosQDKyARj9Ou94H2fXLEUWIttkGUKse33QGuGlnxOzifnEi2t6wlbzNIyzbEjB6cDIvr&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=Nl5QXWCa8K9gB6xbkGomNg&_nc_ss=7b2a8&oh=00_AQS-mFQy8X6qhHq0lf1wIIPbLvdFjIEBN5u0YDSQs1treA&oe=6B045A54`
13. `products/drink-ca-phe-tiramisu.webp` (`max: 640`): `https://scontent.fsgn5-18.fna.fbcdn.net/v/t39.30808-6/491396372_1282852653712732_1880512663039686558_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1351&ctp=s640x640&_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFR8NuBQSIPwFRis2Yr6w249eQkoF8av0L15CSgXxq_QgNLEOOC0otWPrxIUqnA2d0vG52j7RsVWYieqn5L6Jxj&_nc_ohc=mfy-ZNdkIewQ7kNvwGHA0YY&_nc_oc=AdpXX9C6BH6ujwgw2-8qzqewdj_2H0cMiOmMbqOcFeZhLVjBTUMh0IYrKnohoe-oQLEbtbfbsXm1vEsBmS9K_omu&_nc_zt=23&_nc_ht=scontent.fsgn5-18.fna&_nc_gid=zTZIt8TVYKcRyvbQ_k24hw&_nc_ss=7b2a8&oh=00_AQRFyJQtQ8EzuJlK0kFEW-DEo-PGBtAOET8pjzdIvktcRg&oe=6B044E97`
14. `products/drink-ca-phe-da-lat.webp` (`max: 640`): `https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-6/489624159_1277775404220457_5015849322556943084_n.jpg?stp=dst-jpg_tt6&cstp=mx1079x1350&ctp=s640x640&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEHmvWXXPe1zSy5DZdPKR_tsZfuutVwTVOxl-661XBNUzRXC4-sZ7tv3zgz9iE_AYfr2EQkCvesfuCKy6oIFild&_nc_ohc=45o5EAEKPywQ7kNvwEsaH6-&_nc_oc=AdpcV8rJDa_yNpVGPP3aayTD4nyB9yr0XUZ87PsGuz3A8yqGy79mzIdWgyWRJ0Hc8t0gRGVnD2whRDnM6DBWZ0kK&_nc_zt=23&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=zTZIt8TVYKcRyvbQ_k24hw&_nc_ss=7b2a8&oh=00_AQTVrsm5Jnle8mJpbTw49OUENknwaxOjMBGLMYuqgLlY1w&oe=6B046B46`
15. `seasonal/seasonal-hong-trung-lang.webp` (`max: 960`): `https://scontent.fsgn5-22.fna.fbcdn.net/v/t39.30808-6/856375821_1801587178505941_6768353433244066752_n.jpg?stp=dst-jpg_tt6&cstp=mx1448x2048&ctp=s851x315&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeETEgXZH4BBoA3LnHeUk05uaPcROeTpVNlo9xE55OlU2RF-bB66qrZhVP_0nuNZcrTDxXDBiRf4CF8dCluiBuoN&_nc_ohc=qXjydlorf9cQ7kNvwFlFV-s&_nc_oc=AdoeevHK6a3Wwv2oN02M_avsUU2PQQpeaDMSXXePqL0OK6JppSvD6SsxE2hSxIRS37RudEPbqddC40DxTBnL_-kK&_nc_zt=23&_nc_ht=scontent.fsgn5-22.fna&_nc_gid=AyP4lq8FwXuV2cK3GvZzXQ&_nc_ss=7b2a8&oh=00_AQQ9Hc0mSoUgNHfDVmtv27M9oLc0BauXz8lkwvK1B7AqdQ&oe=6B0473B0`
16. `products/topping-khoai-tam.webp` (`max: 512`): `https://scontent.fsgn5-13.fna.fbcdn.net/v/t39.30808-6/492723918_1293481385983192_8511663928692684871_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1351&ctp=s640x640&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHdvAyaPv8jOVEUojhhU15FBdvdvKSvhBcF2928pK-EF0H3vt3FINfIC19izmp0Np7t3BrzjhT8k94wHUXQX8y2&_nc_ohc=N1VKgnegO_IQ7kNvwEUczOv&_nc_oc=AdoZVtC3gnaybUPSCkW4ONbgCHXul1S9C_1XYbplC7dZVUkVAhgf9w3AepFlnbH1dHZnPHK1m85LozRC-tf6O33O&_nc_zt=23&_nc_ht=scontent.fsgn5-13.fna&_nc_gid=WP5FB1w-kQ88aKM3bYVkOA&_nc_ss=7b2a8&oh=00_AQTGdXjqK0K9ddCVj4uoy--1e0yxlVxQ4ScbVMAzQoq_hw&oe=6B046EF2`
17. `products/snack-banh-trang-top-mo.webp` (`max: 640`): `https://scontent.fsgn5-11.fna.fbcdn.net/v/t39.30808-6/492362225_1293623299302334_3499813956209347588_n.jpg?stp=dst-jpg_tt6&cstp=mx1078x1350&ctp=s1078x1350&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGG7DOjfOeJzICI_GfVx_nuY_nRDISgG1hj-dEMhKAbWMiiwHv4LSQl2IWMly5zROumQY3pPMsl1GoOFbgCZfP7&_nc_ohc=Ruyvnmsr_F4Q7kNvwEupmAd&_nc_oc=AdqIwQ7KYzDCCxM-Kn1O1CHRJDqVB5fEXKMLO2Qvv0LwCu1YTMDLosydojaORdMPZVjHUubDnQ9Hre4KOX-PJxbt&_nc_zt=23&_nc_ht=scontent.fsgn5-11.fna&_nc_gid=zttB1yLK1iugwq5ZA3IyIQ&_nc_ss=7b2a8&oh=00_AQS5TaDjcWodv1CIIpPDZ0fnqdhLalseknwMgcXYVN93hQ&oe=6B047329`
18. `products/snack-banh-trang-sot-tac.webp` (`max: 640`): `https://scontent.fsgn5-22.fna.fbcdn.net/v/t39.30808-6/487414781_1268933241771340_1429769129729889271_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1634x2048&ctp=s552x414&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEH6NtAWVgxHYJyZhdvHAL1QMIbPTnjp0hAwhs9OeOnSBGG_uqESFole-DrEqFZrXYR8M9H2_5CR00WxQjnOdwH&_nc_ohc=uRd5S_bi4a8Q7kNvwH1f4Cu&_nc_oc=AdoVcJvfn2zLwpUktNiB11LCudQ95bUwHULxjyOpQUCpmOgnI5lyog4LucusrgGtjHlfIer5cJ4nyOvtYxkcT4J_&_nc_zt=23&_nc_ht=scontent.fsgn5-22.fna&_nc_gid=cru_RTsegK31FCZslN3-Ig&_nc_ss=7b2a8&oh=00_AQSvBUVJIOteiVCqGL7KOYgGWO5UUeytggEd0z4XiHiMBQ&oe=6B0466A6`
19. `products/snack-banh-cham-long-dao.webp` (`max: 640`): `https://scontent.fsgn5-18.fna.fbcdn.net/v/t39.30808-6/487171999_1266908505307147_8743356903196529238_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx2048x2048&ctp=s552x414&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHOFs6ePlM8lVvDv9QdMYL_GBHeALpN3tUYEd4Auk3e1TtYDU0b80zaRRIRpPMK_LkDWwdfj61twE70MaCXDC-8&_nc_ohc=0q9HVf1Xb_QQ7kNvwEuTzv-&_nc_oc=Adr1YxJIOLwqx5wHgssyBS9VH3zlDVjXMRkgvsKMn-jh9dHW9IUrZh7FS4LH4F_jkIKgWSwIDzcqFwTbDvknhtg5&_nc_zt=23&_nc_ht=scontent.fsgn5-18.fna&_nc_gid=lA4zwU9xdws9lgXv47mmww&_nc_ss=7b2a8&oh=00_AQQm34YJFPh3hjQUBhGSo5V_YvGM0J-YsLw95v7rUBwJ1Q&oe=6B045AB8`

 Guard CLI execution with `if (import.meta.url === pathToFileURL(process.argv[1]).href)` so importing `validateAndOptimizePhotoBuffer` in Vitest does not trigger network downloads. Execute `pnpm sync:photos` once to generate all `.webp` files on disk.

- [ ] **Step 4: Run asset verification test**

Run: `pnpm --filter @omsua/web test src/lib/fanpage-assets.test.ts`
Expected: PASS (all `.webp` files present in `apps/web/public` and `apps/admin/public` with valid `RIFF....WEBP` headers).

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/sync-fanpage-photos.mjs apps/web/public/images/fanpage apps/admin/public/images/fanpage apps/web/src/lib/fanpage-assets.test.ts
git commit -m "feat(assets): add sharp fanpage photo sync script and optimized local WebP images"
```

---

### Task 3: Hybrid `<ProductMedia />`, Fanpage Gallery + Lightbox & Social Footer (`@omsua/web`)

**Files:**
- Create: `apps/web/src/components/artwork/ProductMedia.tsx`
- Create: `apps/web/src/components/modals/PhotoLightboxModal.tsx`
- Create: `apps/web/src/components/storefront/FanpageGallerySection.tsx`
- Modify: `apps/web/src/components/storefront/HeroSpotlight.tsx`
- Modify: `apps/web/src/components/storefront/DrinkMenuSection.tsx`
- Modify: `apps/web/src/components/storefront/ToppingStripSection.tsx`
- Modify: `apps/web/src/components/storefront/SnackMenuSection.tsx`
- Modify: `apps/web/src/components/storefront/BrandFooter.tsx`
- Modify: `apps/web/src/components/storefront/StorefrontHeader.tsx`
- Modify: `apps/web/src/components/storefront/StorefrontClientShell.tsx`
- Modify: `apps/web/src/components/storefront/index.ts`
- Modify: `apps/web/src/components/modals/ProductCustomizerModal.tsx`
- Modify: `apps/web/src/components/modals/CartCheckoutDrawer.tsx`
- Test: `apps/web/src/components/artwork/ProductMedia.test.tsx`, `apps/web/src/components/storefront/fanpage-gallery.test.tsx`

**Interfaces:**
- Consumes: `getProductPhoto`, `getBranchPhoto`, `FANPAGE_GALLERY_ITEMS`, `OMSUA_SOCIAL_LINKS`, `type FanpageGalleryCategory`, `type FanpagePhotoItem` from `@omsua/shared`; `useModalAccessibility` from `@/hooks/use-modal-accessibility`; `ProductIllustration`, `type ProductIllustrationProps` from `@/components/artwork/OmSuaArtwork`
- Produces:
  - `export interface ProductMediaProps extends ProductIllustrationProps { preferIllustration?: boolean }`
  - `export function ProductMedia(props: ProductMediaProps): JSX.Element`
  - `export interface PhotoLightboxModalProps { items: readonly FanpagePhotoItem[]; activeIndex: number | null; onChangeIndex: (nextIndex: number) => void; onClose: () => void; }`
  - `export function PhotoLightboxModal(props: PhotoLightboxModalProps): JSX.Element | null`
  - `export function FanpageGallerySection(): JSX.Element`

- [ ] **Step 1: Write failing tests in `ProductMedia.test.tsx` and `fanpage-gallery.test.tsx`**

In `apps/web/src/components/artwork/ProductMedia.test.tsx`:
```tsx
// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ProductMedia } from './ProductMedia';

afterEach(() => cleanup());

describe('ProductMedia hybrid photo + studio SVG fallback', () => {
  it('renders local .webp img with alt="" and aria-hidden when no title/alt is given, and falls back to SVG on error', () => {
    const { container } = render(<ProductMedia productId="tra-sua-atiso" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', '/images/fanpage/products/drink-tra-sua-atiso.webp');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('aria-hidden', 'true');

    fireEvent.error(img!);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders accessible img label when alt is passed, and renders SVG directly when preferIllustration is true or product has no photo', () => {
    const { rerender, container } = render(
      <ProductMedia productId="tra-sua-atiso" alt="Ly Trà Sữa Atiso thực tế" />,
    );
    expect(
      screen.getByRole('img', { name: 'Ly Trà Sữa Atiso thực tế' }),
    ).toBeInTheDocument();

    rerender(<ProductMedia productId="tra-sua-atiso" preferIllustration />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();

    rerender(<ProductMedia productId="oolong-sen-gung" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
```

In `apps/web/src/components/storefront/fanpage-gallery.test.tsx`:
```tsx
// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { OMSUA_BRANCHES } from '@omsua/shared';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BrandFooter } from './BrandFooter';
import { FanpageGallerySection } from './FanpageGallerySection';

afterEach(() => cleanup());

describe('FanpageGallerySection, PhotoLightboxModal & BrandFooter social/branch photos', () => {
  it('filters gallery photos by category, cycles lightbox with ArrowRight/ArrowLeft wrap-around, and restores focus on Escape', () => {
    render(<FanpageGallerySection />);

    expect(
      screen.getByRole('button', { name: 'Tất cả (12)' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/14K người theo dõi/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Bánh tráng Nhà Ốm \(3\)/i }),
    );
    const triggers = screen.getAllByRole('button', { name: /Xem ảnh lớn:/i });
    expect(triggers).toHaveLength(3);

    triggers[2]!.focus();
    fireEvent.click(triggers[2]!);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('3 / 3')).toBeInTheDocument();

    // Wrap-around from last (index 2) -> first (index 0)
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(within(dialog).getByText('1 / 3')).toBeInTheDocument();

    // Wrap-around from first (index 0) -> last (index 2)
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(within(dialog).getByText('3 / 3')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(triggers[2]);
  });

  it('renders verified Facebook, Instagram, TikTok links and branch storefront photos in BrandFooter', () => {
    const { container } = render(<BrandFooter branches={OMSUA_BRANCHES} />);

    expect(
      screen.getByRole('link', { name: /Facebook Fanpage/i }),
    ).toHaveAttribute('href', 'https://www.facebook.com/trasuadalatomsua');
    expect(screen.getByRole('link', { name: /Instagram/i })).toHaveAttribute(
      'href',
      'https://www.instagram.com/omsuadalat',
    );
    expect(screen.getByRole('link', { name: /TikTok/i })).toHaveAttribute(
      'href',
      'https://tiktok.com/@omsuaphache',
    );

    const branchImages = container.querySelectorAll(
      'img[src^="/images/fanpage/branches/"]',
    );
    expect(branchImages).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @omsua/web test src/components/artwork/ProductMedia.test.tsx src/components/storefront/fanpage-gallery.test.tsx`
Expected: FAIL (`Cannot find module './ProductMedia'` / `'./FanpageGallerySection'`).

- [ ] **Step 3: Implement `ProductMedia.tsx`, `PhotoLightboxModal.tsx`, `FanpageGallerySection.tsx`, and wire into Storefront & Modals**

Key wiring details:
- **`ProductMedia.tsx`**: Track `failedSrc: string | null` in state (comparing `failedSrc === photo.src` so changing `productId` automatically resets error state without a `useEffect`). Render `<ProductIllustration {...rest} />` whenever `preferIllustration`, `!photo`, or `failedSrc === photo.src`.
- **`DrinkMenuSection.tsx`**: Accept optional `preferIllustration?: boolean` and `onToggleMediaMode?: (preferIllustration: boolean) => void`; when `onToggleMediaMode` is passed, render a segmented warm pill control (`Ảnh thực tế` / `Minh họa Studio`, `min-h-11`, `aria-pressed`) next to category filters, and swap `<ProductIllustration />` to `<ProductMedia preferIllustration={preferIllustration} />`.
- **`HeroSpotlight.tsx`, `SnackMenuSection.tsx`, `ToppingStripSection.tsx`, `ProductCustomizerModal.tsx`, `CartCheckoutDrawer.tsx`**: Replace `<ProductIllustration />` with `<ProductMedia preferIllustration={preferIllustration} />` (passing `preferIllustration` down from `StorefrontClientShell`).
- **`FanpageGallerySection.tsx` (`id="khong-gian"`) & `PhotoLightboxModal.tsx`**: Place `<FanpageGallerySection />` right after `<BrandStorySection />` inside `<main>` in `StorefrontClientShell.tsx`, and add `{ label: 'Không gian Ốm', href: '#khong-gian' }` to `StorefrontHeader.tsx`. Use `bg-hero-espresso/85`, `bg-surface-light`, `text-espresso`, `bg-card-butter`, and `bg-terracotta` (strictly zero `#FFFFFF`/`#000000`).
- **`BrandFooter.tsx`**: Render each branch's `getBranchPhoto(branch.id)` thumbnail (`aspect-[16/9] w-full rounded-xl object-cover`, hiding cleanly on `onError`) and render `Facebook Fanpage`, `Instagram`, `TikTok` links (`min-h-11`, `target="_blank"`, `rel="noreferrer"`) in the follow card.

- [ ] **Step 4: Run the entire `@omsua/web` test suite, typecheck, and lint (including static pure B/W scanner)**

Run: `pnpm --filter @omsua/web typecheck && pnpm --filter @omsua/web lint && pnpm --filter @omsua/web test`
Expected: PASS (all existing web tests + new `ProductMedia`, `fanpage-gallery`, and `web-review.test.ts` pure B/W scanner green).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src
git commit -m "feat(web): integrate real fanpage product photos, Đà Lạt gallery lightbox, and social links"
```

---

### Task 4: Admin Branch Storefront Photos, Menu Photo Badges & Documentation (`@omsua/admin` & `README.md`)

**Files:**
- Modify: `apps/admin/src/pages/BranchesPage.tsx`
- Modify: `apps/admin/src/pages/MenuPage.tsx`
- Modify: `apps/admin/src/App.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `getBranchPhoto`, `getProductPhoto` from `@omsua/shared`
- Produces: Branch storefront banners on `/branches` (`data-testid="branch-photo-${branch.id}"` when loaded, hidden on `onError`), `"Ảnh thực tế"` pill badge on mapped menu cards on `/menu`, and updated root `README.md`

- [ ] **Step 1: Write the failing test in `apps/admin/src/App.test.tsx`**

Append a test case to `apps/admin/src/App.test.tsx`:
```tsx
  it('renders fanpage storefront photos on BranchesPage (with onError fallback) and Ảnh thực tế badges on MenuPage', async () => {
    const catalog = getDefaultCatalog();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (input: string) => {
        if (input.endsWith('/branches')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: OMSUA_BRANCHES,
              timestamp: '2026-11-19T08:00:00.000Z',
            }),
          };
        }
        if (input.endsWith('/catalog')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: catalog,
              timestamp: '2026-11-19T08:00:00.000Z',
            }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [],
            timestamp: '2026-11-19T08:00:00.000Z',
          }),
        };
      }),
    );

    const { unmount } = render(
      <MemoryRouter initialEntries={['/branches']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const cs1Photo = await screen.findByTestId('branch-photo-cs1-hoang-dieu');
    expect(cs1Photo).toHaveAttribute(
      'src',
      '/images/fanpage/branches/branch-hoang-dieu.webp',
    );
    fireEvent.error(cs1Photo);
    expect(
      screen.queryByTestId('branch-photo-cs1-hoang-dieu'),
    ).not.toBeInTheDocument();

    unmount();

    render(
      <MemoryRouter initialEntries={['/menu']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const atisoCard = await screen.findByTestId('menu-product-tra-sua-atiso');
    expect(within(atisoCard).getByText('Ảnh thực tế')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @omsua/admin test src/App.test.tsx`
Expected: FAIL (`Unable to find an element by: [data-testid="branch-photo-cs1-hoang-dieu"]`).

- [ ] **Step 3: Implement Admin photo banners/badges in `BranchesPage.tsx` & `MenuPage.tsx` and update `README.md`**

- `apps/admin/src/pages/BranchesPage.tsx`: For each branch card, resolve `const branchPhoto = getBranchPhoto(branch.id)` and render a `h-40 w-full rounded-xl object-cover` `<img>` (`alt=""`, `aria-hidden="true"`, `data-testid={`branch-photo-${branch.id}`}`) above the branch badge header, tracking failed IDs in `failedPhotoBranchIds: Set<string>` so `onError` cleanly unmounts only the failed image.
- `apps/admin/src/pages/MenuPage.tsx`: Inside `AdminProductCard`, check `Boolean(getProductPhoto(product.id))` and render a warm sage/olive pill `<span className="rounded-full border border-[#B4C488] bg-card-sage/65 px-2.5 py-0.5 text-[11px] font-semibold text-espresso">Ảnh thực tế</span>` in the top badge strip.
- `README.md`: Document `pnpm sync:photos`, the local `.webp` fanpage asset layout (`apps/web/public/images/fanpage/` & `apps/admin/public/images/fanpage/`), and the hybrid `<ProductMedia />` + `<ProductIllustration />` fallback architecture.

- [ ] **Step 4: Run the full monorepo build, typecheck, lint, and test suite**

Run: `pnpm --reporter=append-only build && pnpm --reporter=append-only typecheck && pnpm --reporter=append-only lint && pnpm --reporter=append-only test`
Expected: PASS (`0` errors, `0` warnings across all 4 packages; `@omsua/admin` `vite-config.test.ts` and `@omsua/web` `web-review.test.ts` static pure B/W scanners both pass).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/pages/BranchesPage.tsx apps/admin/src/pages/MenuPage.tsx apps/admin/src/App.test.tsx README.md
git commit -m "feat(admin,docs): add branch storefront photos, menu photo badges, and fanpage asset docs"
```
