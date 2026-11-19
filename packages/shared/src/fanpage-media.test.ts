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
      ...OMSUA_PRODUCTS.map((p) => p.id),
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
