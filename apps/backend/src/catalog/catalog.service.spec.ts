import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  OMSUA_BRANCHES,
  OMSUA_CATEGORIES,
  OMSUA_PRODUCTS,
  OMSUA_TOPPINGS,
} from '@omsua/shared';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { CatalogModule } from './catalog.module';
import { CatalogService } from './catalog.service';

describe('CatalogService (SQLite :memory:)', () => {
  let moduleRef: TestingModule;
  let catalogService: CatalogService;
  let databaseService: DatabaseService;
  const originalSqlitePath = process.env.SQLITE_PATH;

  beforeEach(async () => {
    process.env.SQLITE_PATH = ':memory:';

    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        DatabaseModule,
        CatalogModule,
      ],
    }).compile();

    await moduleRef.init();

    catalogService = moduleRef.get<CatalogService>(CatalogService);
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  afterEach(async () => {
    await moduleRef.close();
    if (originalSqlitePath === undefined) {
      delete process.env.SQLITE_PATH;
    } else {
      process.env.SQLITE_PATH = originalSqlitePath;
    }
  });

  it('creates all 5 required SQLite tables with foreign_keys, busy_timeout, synchronous pragmas and order indexes', () => {
    const fkRow = databaseService.db.prepare('PRAGMA foreign_keys').get() as
      | { foreign_keys: number }
      | undefined;
    expect(fkRow?.foreign_keys).toBe(1);

    const busyTimeoutRow = databaseService.db
      .prepare('PRAGMA busy_timeout')
      .get() as { timeout: number } | undefined;
    expect(busyTimeoutRow?.timeout).toBe(5000);

    const syncRow = databaseService.db.prepare('PRAGMA synchronous').get() as
      | { synchronous: number }
      | undefined;
    expect(syncRow?.synchronous).toBe(1);

    const tableRows = databaseService.db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC",
      )
      .all() as Array<{ name: string }>;

    expect(tableRows.map((row) => row.name)).toEqual([
      'branches',
      'order_items',
      'orders',
      'products',
      'toppings',
    ]);

    const indexRows = databaseService.db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'index' AND name IN ('idx_order_items_order_id', 'idx_orders_branch_status_created') ORDER BY name ASC",
      )
      .all() as Array<{ name: string }>;

    expect(indexRows.map((row) => row.name)).toEqual([
      'idx_order_items_order_id',
      'idx_orders_branch_status_created',
    ]);
  });

  it('enables WAL journal_mode on file-backed SQLite databases', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omsua-wal-pragma-'));
    const sqliteFile = path.join(tempDir, 'omsua-wal.sqlite');
    let walModule: TestingModule | undefined;

    try {
      walModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [() => ({ SQLITE_PATH: sqliteFile })],
          }),
          DatabaseModule,
          CatalogModule,
        ],
      }).compile();
      await walModule.init();

      const walDb = walModule.get<DatabaseService>(DatabaseService);
      const journalRow = walDb.db.prepare('PRAGMA journal_mode').get() as
        | { journal_mode: string }
        | undefined;
      expect(journalRow?.journal_mode.toLowerCase()).toBe('wal');
    } finally {
      if (walModule) {
        await walModule.close();
      }
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('getCatalog() returns 4 categories, 30 seeded products (24 drinks + 6 snacks), and 8 toppings in seed order', () => {
    const catalog = catalogService.getCatalog();

    expect(catalog.categories).toHaveLength(4);
    expect(catalog.categories).toEqual(OMSUA_CATEGORIES);

    expect(catalog.products).toHaveLength(30);
    expect(catalog.products.filter((p) => p.kind === 'drink')).toHaveLength(24);
    expect(catalog.products.filter((p) => p.kind === 'snack')).toHaveLength(6);
    expect(catalog.products).toEqual(OMSUA_PRODUCTS);

    expect(catalog.toppings).toHaveLength(8);
    expect(catalog.toppings).toEqual(OMSUA_TOPPINGS);
  });

  it('getBranches() returns 4 Đà Lạt / Đức Trọng branches starting with cs1-hoang-dieu', () => {
    const branches = catalogService.getBranches();

    expect(branches).toHaveLength(4);
    expect(branches[0]?.id).toBe('cs1-hoang-dieu');
    expect(branches.map((b) => b.id)).toEqual([
      'cs1-hoang-dieu',
      'cs2-hem-33-nct',
      'cs3-158-nct',
      'cs4-duc-trong',
    ]);
    expect(branches).toEqual(OMSUA_BRANCHES);
  });

  it('setProductAvailability("tra-sua-atiso", false) persists in SQLite and reflects immediately in getCatalog() and getProductsMap()', () => {
    const updated = catalogService.setProductAvailability(
      'tra-sua-atiso',
      false,
    );
    expect(updated.id).toBe('tra-sua-atiso');
    expect(updated.isAvailable).toBe(false);

    const rawRow = databaseService.db
      .prepare('SELECT is_available FROM products WHERE id = ?')
      .get('tra-sua-atiso') as { is_available: number } | undefined;
    expect(rawRow?.is_available).toBe(0);

    // Re-running onModuleInit must be idempotent and NOT overwrite is_available back to 1
    databaseService.onModuleInit();

    const catalogAfter = catalogService.getCatalog();
    const atisoInCatalog = catalogAfter.products.find(
      (p) => p.id === 'tra-sua-atiso',
    );
    expect(atisoInCatalog?.isAvailable).toBe(false);

    const productsMap = catalogService.getProductsMap();
    expect(productsMap.size).toBe(30);
    expect(productsMap.get('tra-sua-atiso')?.isAvailable).toBe(false);

    const toppingsMap = catalogService.getToppingsMap();
    expect(toppingsMap.size).toBe(8);
    expect(toppingsMap.get('tran-chau-den')?.price).toBe(10000);
  });

  it('setProductAvailability("unknown-id", false) throws NotFoundException', () => {
    expect(() =>
      catalogService.setProductAvailability('unknown-id', false),
    ).toThrow(NotFoundException);
  });

  it('creates parent directories for file-backed SQLITE_PATH and preserves availability across restarts', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omsua-sqlite-'));
    const sqliteFile = path.join(tempDir, 'nested', 'omsua.sqlite');

    try {
      const firstModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [() => ({ SQLITE_PATH: sqliteFile })],
          }),
          DatabaseModule,
          CatalogModule,
        ],
      }).compile();
      await firstModule.init();

      const firstCatalog = firstModule.get<CatalogService>(CatalogService);
      firstCatalog.setProductAvailability('tra-sua-atiso', false);
      expect(fs.existsSync(sqliteFile)).toBe(true);

      await firstModule.close();

      const secondModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [() => ({ SQLITE_PATH: sqliteFile })],
          }),
          DatabaseModule,
          CatalogModule,
        ],
      }).compile();
      await secondModule.init();

      const secondCatalog = secondModule.get<CatalogService>(CatalogService);
      const reloaded = secondCatalog
        .getCatalog()
        .products.find((p) => p.id === 'tra-sua-atiso');
      expect(reloaded?.isAvailable).toBe(false);

      await secondModule.close();
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('resolves relative SQLITE_PATH against backend package root instead of process.cwd() and runs seedDefaults once on cold boot', async () => {
    const fakeCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'omsua-fake-cwd-'));
    const backendRoot = path.resolve(__dirname, '../..');
    const relativeDbDir = path.join(backendRoot, '.tmp-rel-sqlite-spec');
    const expectedSqliteFile = path.join(relativeDbDir, 'omsua-rel.sqlite');
    const cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(fakeCwd);
    const seedSpy = jest.spyOn(
      DatabaseService.prototype as unknown as {
        seedDefaults: (...args: unknown[]) => void;
      },
      'seedDefaults',
    );

    let customModule: TestingModule | undefined;
    try {
      customModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                SQLITE_PATH: '.tmp-rel-sqlite-spec/omsua-rel.sqlite',
              }),
            ],
          }),
          DatabaseModule,
          CatalogModule,
        ],
      }).compile();

      await customModule.init();

      expect(seedSpy).toHaveBeenCalledTimes(1);
      expect(fs.existsSync(expectedSqliteFile)).toBe(true);
      expect(
        fs.existsSync(
          path.join(fakeCwd, '.tmp-rel-sqlite-spec', 'omsua-rel.sqlite'),
        ),
      ).toBe(false);

      const customDb = customModule.get<DatabaseService>(DatabaseService);
      customDb.onModuleInit();
      expect(seedSpy).toHaveBeenCalledTimes(2);
    } finally {
      seedSpy.mockRestore();
      cwdSpy.mockRestore();
      if (customModule) {
        await customModule.close();
      }
      fs.rmSync(relativeDbDir, { recursive: true, force: true });
      fs.rmSync(fakeCwd, { recursive: true, force: true });
    }
  });
});
