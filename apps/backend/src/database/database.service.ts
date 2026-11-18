import * as fs from 'node:fs';
import * as path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OMSUA_BRANCHES,
  OMSUA_PRODUCTS,
  OMSUA_TOPPINGS,
} from '@omsua/shared';

const SCHEMA_DDL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL,
  kind TEXT NOT NULL,
  category_id TEXT,
  name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  description TEXT NOT NULL,
  sizes_json TEXT NOT NULL,
  is_signature INTEGER NOT NULL DEFAULT 0,
  is_best_seller INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0,
  is_spotlight INTEGER NOT NULL DEFAULT 0,
  is_available INTEGER NOT NULL DEFAULT 1,
  illustration_key TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS toppings (
  id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_available INTEGER NOT NULL DEFAULT 1,
  illustration_key TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  short_label TEXT NOT NULL,
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  hotline TEXT NOT NULL,
  delivery_eta TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  branch_id TEXT NOT NULL REFERENCES branches(id),
  branch_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping_fee INTEGER NOT NULL,
  eco_fee INTEGER NOT NULL,
  grand_total INTEGER NOT NULL,
  total_items INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  kind TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  size TEXT NOT NULL,
  sugar_level TEXT,
  ice_level TEXT,
  toppings_json TEXT NOT NULL DEFAULT '[]',
  spice_level TEXT,
  unit_price INTEGER NOT NULL,
  line_total INTEGER NOT NULL
);
`;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private database: DatabaseSync | null = null;

  constructor(private readonly configService: ConfigService) {}

  get db(): DatabaseSync {
    return this.ensureDatabase();
  }

  onModuleInit(): void {
    const database = this.ensureDatabase();
    database.exec(SCHEMA_DDL);
    this.seedDefaults(database);
  }

  onModuleDestroy(): void {
    if (this.database && this.database.isOpen) {
      this.database.close();
    }
    this.database = null;
  }

  private ensureDatabase(): DatabaseSync {
    if (this.database && this.database.isOpen) {
      return this.database;
    }

    const sqlitePath = this.resolveSqlitePath();
    const database = new DatabaseSync(sqlitePath);
    database.exec(SCHEMA_DDL);
    this.seedDefaults(database);
    this.database = database;
    return database;
  }

  private resolveSqlitePath(): string {
    const configured = this.configService.get<string>('SQLITE_PATH')?.trim();
    if (configured === ':memory:') {
      return ':memory:';
    }

    const resolvedPath =
      configured && configured.length > 0
        ? path.resolve(process.cwd(), configured)
        : path.resolve(process.cwd(), 'data/omsua.sqlite');

    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    return resolvedPath;
  }

  private seedDefaults(database: DatabaseSync): void {
    const insertProduct = database.prepare(`
      INSERT OR IGNORE INTO products (
        id,
        sort_order,
        kind,
        category_id,
        name,
        english_name,
        description,
        sizes_json,
        is_signature,
        is_best_seller,
        is_new,
        is_spotlight,
        is_available,
        illustration_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTopping = database.prepare(`
      INSERT OR IGNORE INTO toppings (
        id,
        sort_order,
        name,
        short_name,
        price,
        is_available,
        illustration_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertBranch = database.prepare(`
      INSERT OR IGNORE INTO branches (
        id,
        sort_order,
        name,
        short_label,
        address,
        area,
        hotline,
        delivery_eta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    database.exec('BEGIN');
    try {
      OMSUA_PRODUCTS.forEach((product, index) => {
        insertProduct.run(
          product.id,
          index,
          product.kind,
          product.categoryId,
          product.name,
          product.englishName,
          product.description,
          JSON.stringify(product.sizes),
          product.isSignature ? 1 : 0,
          product.isBestSeller ? 1 : 0,
          product.isNew ? 1 : 0,
          product.isSpotlight ? 1 : 0,
          product.isAvailable ? 1 : 0,
          product.id,
        );
      });

      OMSUA_TOPPINGS.forEach((topping, index) => {
        insertTopping.run(
          topping.id,
          index,
          topping.name,
          topping.shortName,
          topping.price,
          topping.isAvailable ? 1 : 0,
          topping.id,
        );
      });

      OMSUA_BRANCHES.forEach((branch, index) => {
        const isDucTrong = branch.address.includes('Đức Trọng');
        insertBranch.run(
          branch.id,
          index,
          branch.name,
          branch.shortLabel,
          branch.address,
          isDucTrong ? 'Đức Trọng' : 'Đà Lạt',
          branch.hotline,
          isDucTrong ? '20–30 phút' : '15–25 phút',
        );
      });

      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  }
}
