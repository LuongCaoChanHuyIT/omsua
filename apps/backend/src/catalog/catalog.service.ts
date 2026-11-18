import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type BranchInfo,
  type CatalogPayload,
  OMSUA_CATEGORIES,
  type ProductCategoryId,
  type ProductItem,
  type ProductKind,
  type ProductSizeOption,
  type ToppingItem,
} from '@omsua/shared';
import { DatabaseService } from '../database/database.service';

interface ProductRow {
  id: string;
  sort_order: number;
  kind: string;
  category_id: string | null;
  name: string;
  english_name: string;
  description: string;
  sizes_json: string;
  is_signature: number;
  is_best_seller: number;
  is_new: number;
  is_spotlight: number;
  is_available: number;
  illustration_key: string;
}

interface ToppingRow {
  id: string;
  sort_order: number;
  name: string;
  short_name: string;
  price: number;
  is_available: number;
  illustration_key: string;
}

interface BranchRow {
  id: string;
  sort_order: number;
  name: string;
  short_label: string;
  address: string;
  area: string;
  hotline: string;
  delivery_eta: string;
}

@Injectable()
export class CatalogService {
  constructor(private readonly databaseService: DatabaseService) {}

  getCatalog(): CatalogPayload {
    return {
      categories: OMSUA_CATEGORIES.map((category) => ({ ...category })),
      products: this.queryAllProducts(),
      toppings: this.queryAllToppings(),
    };
  }

  getBranches(): BranchInfo[] {
    const rows = this.databaseService.db
      .prepare('SELECT * FROM branches ORDER BY sort_order ASC')
      .all() as unknown as BranchRow[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      shortLabel: row.short_label,
      hotline: row.hotline,
    }));
  }

  getProductsMap(): Map<string, ProductItem> {
    return new Map(
      this.queryAllProducts().map((product) => [product.id, product]),
    );
  }

  getToppingsMap(): Map<string, ToppingItem> {
    return new Map(
      this.queryAllToppings().map((topping) => [topping.id, topping]),
    );
  }

  setProductAvailability(id: string, isAvailable: boolean): ProductItem {
    const result = this.databaseService.db
      .prepare('UPDATE products SET is_available = ? WHERE id = ?')
      .run(isAvailable ? 1 : 0, id);

    if (result.changes === 0) {
      throw new NotFoundException(`Product "${id}" not found`);
    }

    const row = this.databaseService.db
      .prepare('SELECT * FROM products WHERE id = ?')
      .get(id) as unknown as ProductRow | undefined;

    if (!row) {
      throw new NotFoundException(`Product "${id}" not found`);
    }

    return this.mapProductRow(row);
  }

  private queryAllProducts(): ProductItem[] {
    const rows = this.databaseService.db
      .prepare('SELECT * FROM products ORDER BY sort_order ASC')
      .all() as unknown as ProductRow[];

    return rows.map((row) => this.mapProductRow(row));
  }

  private queryAllToppings(): ToppingItem[] {
    const rows = this.databaseService.db
      .prepare('SELECT * FROM toppings ORDER BY sort_order ASC')
      .all() as unknown as ToppingRow[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      shortName: row.short_name,
      price: row.price,
      isAvailable: Boolean(row.is_available),
    }));
  }

  private mapProductRow(row: ProductRow): ProductItem {
    return {
      id: row.id,
      kind: row.kind as ProductKind,
      categoryId: (row.category_id ?? 'snack') as ProductCategoryId,
      name: row.name,
      englishName: row.english_name,
      description: row.description,
      sizes: JSON.parse(row.sizes_json) as ProductSizeOption[],
      isSignature: Boolean(row.is_signature),
      isBestSeller: Boolean(row.is_best_seller),
      isNew: Boolean(row.is_new),
      isSpotlight: Boolean(row.is_spotlight),
      isAvailable: Boolean(row.is_available),
    };
  }
}
