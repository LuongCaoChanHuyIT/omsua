import { describe, expect, it } from 'vitest';
import {
  BRANCH_PHOTO_BY_ID,
  FANPAGE_GALLERY_ITEMS,
  OMSUA_BRANCHES,
  OMSUA_PRODUCTS,
  OMSUA_SOCIAL_LINKS,
  OMSUA_TOPPINGS,
  PRODUCT_PHOTO_BY_ID,
  getBranchPhoto,
  getProductPhoto,
} from './index';

describe('fanpage-media manifest (@omsua/shared)', () => {
  it('exports verified social metadata and 16 high-res gallery items (6 khong-gian, 6 thuc-uong, 4 banh-trang) with local .webp paths and zero fbcdn.net URLs', () => {
    expect(OMSUA_SOCIAL_LINKS.facebook).toBe(
      'https://www.facebook.com/trasuadalatomsua',
    );
    expect(OMSUA_SOCIAL_LINKS.instagram).toBe(
      'https://www.instagram.com/omsuadalat',
    );
    expect(OMSUA_SOCIAL_LINKS.tiktok).toBe('https://tiktok.com/@omsuaphache');
    expect(FANPAGE_GALLERY_ITEMS).toHaveLength(16);

    const byCategory = {
      'khong-gian': 0,
      'thuc-uong': 0,
      'banh-trang': 0,
    };
    const galleryIds = new Set<string>();
    const gallerySrcs = new Set<string>();

    for (const item of FANPAGE_GALLERY_ITEMS) {
      byCategory[item.category] += 1;
      expect(galleryIds.has(item.id), `Duplicate gallery id: ${item.id}`).toBe(
        false,
      );
      expect(
        gallerySrcs.has(item.src),
        `Duplicate gallery src: ${item.src}`,
      ).toBe(false);
      galleryIds.add(item.id);
      gallerySrcs.add(item.src);

      expect(item.src).toMatch(/^\/images\/fanpage\/[a-z0-9/-]+\.webp$/);
      expect(item.src).not.toContain('fbcdn.net');
      expect(item.postUrl).toMatch(/^https:\/\/www\.facebook\.com\/photo\/\?fbid=/);
    }

    expect(byCategory).toEqual({
      'khong-gian': 6,
      'thuc-uong': 6,
      'banh-trang': 4,
    });
  });

  it('maps 31 unique 1:1 catalog photos (20/24 drinks, 6/6 snacks, 5/8 macro toppings) and 4 unique branch photos with objectPosition', () => {
    const validDrinkIds = new Set(
      OMSUA_PRODUCTS.filter((p) => p.kind === 'drink').map((p) => p.id),
    );
    const validSnackIds = new Set(
      OMSUA_PRODUCTS.filter((p) => p.kind === 'snack').map((p) => p.id),
    );
    const validToppingIds = new Set(OMSUA_TOPPINGS.map((t) => t.id));
    const validCatalogIds = new Set([
      ...validDrinkIds,
      ...validSnackIds,
      ...validToppingIds,
    ]);

    const mappedEntries = Object.entries(PRODUCT_PHOTO_BY_ID);
    expect(mappedEntries).toHaveLength(31);

    const seenProductSrcs = new Set<string>();
    let drinkCount = 0;
    let snackCount = 0;
    let toppingCount = 0;

    for (const [key, meta] of mappedEntries) {
      expect(validCatalogIds.has(key), `Unknown catalog ID: ${key}`).toBe(true);
      expect(meta.src).toMatch(
        /^\/images\/fanpage\/products\/(drink|snack|topping)-[a-z0-9-]+\.webp$/,
      );
      expect(
        seenProductSrcs.has(meta.src),
        `Duplicate product photo src shared across SKUs: ${meta.src}`,
      ).toBe(false);
      seenProductSrcs.add(meta.src);

      if (validDrinkIds.has(key)) drinkCount += 1;
      if (validSnackIds.has(key)) snackCount += 1;
      if (validToppingIds.has(key)) toppingCount += 1;
    }

    expect(drinkCount).toBe(20);
    expect(snackCount).toBe(6);
    expect(toppingCount).toBe(5);

    // Explicitly unphotographed / Reel-only SKUs must remain unmapped so ProductMedia renders bespoke Studio SVG
    for (const unphotographedId of [
      'tra-sua-flan-chay-canh',
      'sua-tuoi-duong-den',
      'ca-phe-sua',
      'ca-phe-den',
      'banh-flan',
      'tran-chau-trang',
      'thach-cu-nang',
    ]) {
      expect(getProductPhoto(unphotographedId)).toBeNull();
    }

    expect(getProductPhoto('unknown-id')).toBeNull();
    expect(getProductPhoto(undefined)).toBeNull();

    const seenBranchSrcs = new Set<string>();
    for (const branch of OMSUA_BRANCHES) {
      const photo = getBranchPhoto(branch.id);
      expect(photo, `Missing branch photo for ${branch.id}`).not.toBeNull();
      expect(photo?.src).toBe(
        `/images/fanpage/branches/branch-${branch.id}.webp`,
      );
      expect(photo?.objectPosition).toBeTruthy();
      expect(seenBranchSrcs.has(photo!.src)).toBe(false);
      seenBranchSrcs.add(photo!.src);
      expect(BRANCH_PHOTO_BY_ID[branch.id]).toBeDefined();
    }
    expect(getBranchPhoto('unknown-branch')).toBeNull();
  });

  it('keeps postUrl consistent across PRODUCT_PHOTO_BY_ID, BRANCH_PHOTO_BY_ID, and FANPAGE_GALLERY_ITEMS for any shared .webp asset', () => {
    const postUrlBySrc = new Map<string, string>();
    const entries: Array<{ label: string; src: string; postUrl: string }> = [
      ...Object.entries(BRANCH_PHOTO_BY_ID).map(([id, meta]) => ({
        label: `BRANCH_PHOTO_BY_ID[${id}]`,
        src: meta.src,
        postUrl: meta.postUrl,
      })),
      ...Object.entries(PRODUCT_PHOTO_BY_ID).map(([id, meta]) => ({
        label: `PRODUCT_PHOTO_BY_ID[${id}]`,
        src: meta.src,
        postUrl: meta.postUrl,
      })),
      ...FANPAGE_GALLERY_ITEMS.map((item) => ({
        label: `FANPAGE_GALLERY_ITEMS[${item.id}]`,
        src: item.src,
        postUrl: item.postUrl,
      })),
    ];

    for (const entry of entries) {
      const existing = postUrlBySrc.get(entry.src);
      if (existing === undefined) {
        postUrlBySrc.set(entry.src, entry.postUrl);
      } else {
        expect(
          entry.postUrl,
          `Mismatched postUrl for ${entry.src} at ${entry.label}`,
        ).toBe(existing);
      }
    }
  });
});
