import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import {
  BRANCH_PHOTO_BY_ID,
  FANPAGE_GALLERY_ITEMS,
  PRODUCT_PHOTO_BY_ID,
} from '@omsua/shared';
import { describe, expect, it } from 'vitest';
import { validateAndOptimizePhotoBuffer } from '../../../../scripts/sync-fanpage-photos.mjs';

const nextPkgPath = realpathSync(
  path.resolve(__dirname, '..', '..', 'node_modules', 'next', 'package.json'),
);
const sharp = createRequire(nextPkgPath)('sharp') as (input?: unknown) => {
  png: () => { toBuffer: () => Promise<Buffer> };
};

describe('Fanpage local WebP assets & sharp validation pipeline', () => {
  it('rejects non-image content types, corrupt >=512B payloads, and <200x200 images via sharp metadata', async () => {
    await expect(
      validateAndOptimizePhotoBuffer(
        Buffer.from('<html>signature expired</html>'),
        'text/html; charset=utf-8',
      ),
    ).rejects.toThrow(/content-type/i);

    await expect(
      validateAndOptimizePhotoBuffer(Buffer.alloc(1024, 0x41), 'image/jpeg'),
    ).rejects.toThrow();

    const tinyPngBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 238, g: 234, b: 223 },
      },
    })
      .png()
      .toBuffer();

    await expect(
      validateAndOptimizePhotoBuffer(tinyPngBuffer, 'image/png'),
    ).rejects.toThrow(/dimensions too small/i);
  });

  it('ships valid, non-empty RIFF WEBP files for every gallery, product, and branch photo in web and admin public dirs', () => {
    const webPublic = path.resolve(__dirname, '..', '..', 'public');
    const adminPublic = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'admin',
      'public',
    );

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
