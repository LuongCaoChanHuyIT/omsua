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
import {
  FANPAGE_PHOTO_SOURCES,
  validateAndOptimizePhotoBuffer,
} from '../../../../scripts/sync-fanpage-photos.mjs';

const nextPkgPath = realpathSync(
  path.resolve(__dirname, '..', '..', 'node_modules', 'next', 'package.json'),
);
const sharp = createRequire(nextPkgPath)('sharp') as (input?: unknown) => {
  png: () => { toBuffer: () => Promise<Buffer> };
  metadata: () => Promise<{ width?: number; height?: number }>;
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

    await expect(
      validateAndOptimizePhotoBuffer(widePngBuffer, 'image/png', {
        maxDimension: 640,
        extract: { left: 1.00005, top: 0, width: 0.00001, height: 1 },
      }),
    ).rejects.toThrow(/Invalid extract box/i);

    await expect(
      validateAndOptimizePhotoBuffer(widePngBuffer, 'image/png', 0),
    ).rejects.toThrow(/Invalid maxDimension/i);

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

  it('ships valid, high-resolution (>=320x380) RIFF WEBP files for every gallery, product, and branch photo in web and admin public dirs with zero orphan .webp files', async () => {
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

    const assertValidWebpFile = async (fullPath: string, label: string) => {
      expect(existsSync(fullPath), `Missing asset: ${label}`).toBe(true);
      const size = statSync(fullPath).size;
      expect(size).toBeGreaterThan(2048);
      expect(size).toBeLessThan(400 * 1024);

      const fileBytes = readFileSync(fullPath);
      const header = fileBytes.subarray(0, 12);
      expect(header.subarray(0, 4).toString('ascii')).toBe('RIFF');
      expect(header.subarray(8, 12).toString('ascii')).toBe('WEBP');

      const meta = await sharp(fileBytes).metadata();
      expect(
        meta.width ?? 0,
        `Width < 320px on ${label} (${String(meta.width)}x${String(meta.height)})`,
      ).toBeGreaterThanOrEqual(320);
      expect(
        meta.height ?? 0,
        `Height < 380px on ${label} (${String(meta.width)}x${String(meta.height)})`,
      ).toBeGreaterThanOrEqual(380);
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
      await assertValidWebpFile(path.join(webPublic, relSrc), `web:${relSrc}`);
    }

    const expectedAdminPaths = new Set<string>(
      Object.values(BRANCH_PHOTO_BY_ID).map((meta) => meta.src),
    );
    for (const relSrc of expectedAdminPaths) {
      await assertValidWebpFile(
        path.join(adminPublic, relSrc),
        `admin:${relSrc}`,
      );
    }

    const expectedSourceWebPaths = new Set<string>(
      FANPAGE_PHOTO_SOURCES.map(
        (entry: { relPath: string }) => `/images/fanpage/${entry.relPath}`,
      ),
    );
    expect(expectedSourceWebPaths).toEqual(allWebPaths);

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

  it('ships valid printable Botanical Press PDF and high-res PNG preview in apps/web/public/brand', async () => {
    const brandDir = path.resolve(__dirname, '..', '..', 'public', 'brand');
    const pdfPath = path.join(brandDir, 'omsua-botanical-menu-poster.pdf');
    const pngPath = path.join(brandDir, 'omsua-botanical-menu-poster.png');

    expect(existsSync(pdfPath)).toBe(true);
    expect(existsSync(pngPath)).toBe(true);

    const pdfBytes = readFileSync(pdfPath);
    expect(pdfBytes.byteLength).toBeGreaterThan(10 * 1024);
    expect(pdfBytes.subarray(0, 5).toString('ascii')).toBe('%PDF-');

    const pngBytes = readFileSync(pngPath);
    expect(pngBytes.byteLength).toBeGreaterThan(15 * 1024);
    expect(pngBytes.subarray(1, 4).toString('ascii')).toBe('PNG');

    const pngMeta = await sharp(pngBytes).metadata();
    expect(pngMeta.width ?? 0).toBeGreaterThanOrEqual(1200);
    expect(pngMeta.height ?? 0).toBeGreaterThanOrEqual(1600);

    const posterScript = readFileSync(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'scripts',
        'generate-brand-poster.py',
      ),
      'utf8',
    );
    expect(posterScript).toContain('"Cà Phê Muối / Bạc Xỉu"');
    expect(posterScript).toContain('"40k • 35k"');
    expect(posterScript).not.toContain('"35k • 40k"');
  });
});
