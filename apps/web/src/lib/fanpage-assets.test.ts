import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from 'node:fs';
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

  it('supports normalized proportional extract crops and rejects out-of-bounds or <200x200 crop regions', async () => {
    const widePngBuffer = await sharp({
      create: {
        width: 600,
        height: 400,
        channels: 3,
        background: { r: 217, g: 107, b: 30 },
      },
    })
      .png()
      .toBuffer();

    const cropped = await validateAndOptimizePhotoBuffer(
      widePngBuffer,
      'image/png',
      {
        maxDimension: 640,
        extract: { left: 0, top: 0, width: 0.5, height: 1 },
      },
    );
    expect(cropped.width).toBe(300);
    expect(cropped.height).toBe(400);
    expect(cropped.data.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(cropped.data.subarray(8, 12).toString('ascii')).toBe('WEBP');

    await expect(
      validateAndOptimizePhotoBuffer(widePngBuffer, 'image/png', {
        maxDimension: 640,
        extract: { left: 0.8, top: 0, width: 0.5, height: 1 },
      }),
    ).rejects.toThrow(/extract/i);

    const squarePngBuffer = await sharp({
      create: {
        width: 600,
        height: 600,
        channels: 3,
        background: { r: 122, g: 139, b: 59 },
      },
    })
      .png()
      .toBuffer();

    await expect(
      validateAndOptimizePhotoBuffer(squarePngBuffer, 'image/png', {
        maxDimension: 640,
        extract: { left: 0, top: 0, width: 0.25, height: 0.25 },
      }),
    ).rejects.toThrow(/dimensions too small/i);
  });

  it('ships valid, non-empty RIFF WEBP files for every gallery, product, and branch photo in web and admin public dirs with zero orphan .webp files', () => {
    const collectDiskWebp = (dir: string, rootPublic: string): string[] => {
      if (!existsSync(dir)) return [];
      const out: string[] = [];
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const child = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          out.push(...collectDiskWebp(child, rootPublic));
        } else if (entry.isFile() && entry.name.endsWith('.webp')) {
          out.push('/' + path.relative(rootPublic, child).replace(/\\/g, '/'));
        }
      }
      return out;
    };

    const assertValidWebpFile = (fullPath: string, label: string) => {
      expect(existsSync(fullPath), `Missing asset: ${label}`).toBe(true);
      const size = statSync(fullPath).size;
      expect(size).toBeGreaterThan(2048);
      expect(size).toBeLessThan(400 * 1024);

      const header = readFileSync(fullPath).subarray(0, 12);
      expect(header.subarray(0, 4).toString('ascii')).toBe('RIFF');
      expect(header.subarray(8, 12).toString('ascii')).toBe('WEBP');
    };

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
      assertValidWebpFile(path.join(webPublic, relSrc), `web:${relSrc}`);
    }

    const expectedAdminPaths = new Set<string>(
      Object.values(BRANCH_PHOTO_BY_ID).map((meta) => meta.src),
    );
    for (const relSrc of expectedAdminPaths) {
      assertValidWebpFile(path.join(adminPublic, relSrc), `admin:${relSrc}`);
    }

    const actualWebFiles = collectDiskWebp(
      path.join(webPublic, 'images', 'fanpage'),
      webPublic,
    );
    const orphanWebFiles = actualWebFiles.filter((p) => !allWebPaths.has(p));
    expect(orphanWebFiles, 'Found unreferenced web .webp files').toEqual([]);

    const actualAdminFiles = collectDiskWebp(
      path.join(adminPublic, 'images', 'fanpage'),
      adminPublic,
    );
    const orphanAdminFiles = actualAdminFiles.filter(
      (p) => !expectedAdminPaths.has(p),
    );
    expect(orphanAdminFiles, 'Found unreferenced admin .webp files').toEqual(
      [],
    );
  });
});
