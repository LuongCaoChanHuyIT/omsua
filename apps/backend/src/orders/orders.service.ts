import { randomInt, randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ORDER_STATUSES,
  OrderValidationError,
  PAYMENT_METHODS,
  calculateOrderTotals,
  canonicalizeCartItemKey,
  resolveOrderLine,
  type CreateOrderPayload,
  type IceLevel,
  type OrderItemInput,
  type OrderLineResolved,
  type OrderLineTopping,
  type OrderRecord,
  type OrderStatus,
  type PaymentMethod,
  type ProductKind,
  type ProductSizeCode,
  type SpiceLevel,
  type SugarLevel,
} from '@omsua/shared';
import { CatalogService } from '../catalog/catalog.service';
import { DatabaseService } from '../database/database.service';

const ORDER_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_ORDER_CODE_ATTEMPTS = 16;

const SIZE_LABELS: Record<ProductSizeCode, string> = {
  S: 'Size S',
  M: 'Size M (Chuẩn)',
  L: 'Size L (Lớn)',
  STD: 'Phần tiêu chuẩn',
};

interface OrderRow {
  id: string;
  order_code: string;
  branch_id: string;
  branch_name: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  note: string;
  payment_method: string;
  status: string;
  subtotal: number;
  shipping_fee: number;
  eco_fee: number;
  grand_total: number;
  total_items: number;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  id: number;
  order_id: string;
  product_id: string;
  product_name: string;
  kind: string;
  quantity: number;
  size: string;
  sugar_level: string | null;
  ice_level: string | null;
  toppings_json: string;
  spice_level: string | null;
  unit_price: number;
  line_total: number;
}

export interface OrdersFilter {
  status?: OrderStatus;
  branchId?: string;
}

function formatOrderDateStamp(date: Date): string {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const year = String(vnTime.getUTCFullYear());
  const month = String(vnTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly catalogService: CatalogService,
  ) {}

  createOrder(payload: CreateOrderPayload): OrderRecord {
    const branchId =
      typeof payload.branchId === 'string' ? payload.branchId.trim() : '';
    const branch = this.catalogService
      .getBranches()
      .find((candidate) => candidate.id === branchId);

    if (!branch) {
      throw new BadRequestException(`Chi nhánh "${branchId}" không tồn tại.`);
    }

    const customerName =
      typeof payload.customerName === 'string'
        ? payload.customerName.trim()
        : '';
    if (customerName.length < 2 || customerName.length > 80) {
      throw new BadRequestException(
        'Tên người nhận phải có độ dài từ 2 đến 80 ký tự.',
      );
    }

    const customerPhone =
      typeof payload.customerPhone === 'string'
        ? payload.customerPhone.replace(/[\s.-]/g, '')
        : '';
    if (!/^0\d{9,10}$/.test(customerPhone)) {
      throw new BadRequestException(
        'Số điện thoại người nhận không hợp lệ (bắt đầu bằng 0, gồm 10–11 chữ số).',
      );
    }

    const deliveryAddress =
      typeof payload.deliveryAddress === 'string'
        ? payload.deliveryAddress.trim()
        : '';
    if (deliveryAddress.length < 5 || deliveryAddress.length > 200) {
      throw new BadRequestException(
        'Địa chỉ giao hàng phải có độ dài từ 5 đến 200 ký tự.',
      );
    }

    const trimmedNote =
      payload.note === undefined || payload.note === null
        ? ''
        : typeof payload.note === 'string'
          ? payload.note.trim()
          : '';
    if (
      payload.note !== undefined &&
      payload.note !== null &&
      typeof payload.note !== 'string'
    ) {
      throw new BadRequestException('Ghi chú đơn hàng không hợp lệ.');
    }
    if (trimmedNote.length > 300) {
      throw new BadRequestException('Ghi chú đơn hàng tối đa 300 ký tự.');
    }

    if (
      typeof payload.paymentMethod !== 'string' ||
      !(PAYMENT_METHODS as readonly string[]).includes(payload.paymentMethod)
    ) {
      throw new BadRequestException('Phương thức thanh toán không hợp lệ.');
    }

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new BadRequestException('Đơn hàng phải có ít nhất 1 món.');
    }
    if (payload.items.length > 50) {
      throw new BadRequestException('Đơn hàng không được vượt quá 50 dòng món.');
    }

    const mergedItems: OrderItemInput[] = [];
    const mergedIndexByKey = new Map<string, number>();

    for (const item of payload.items) {
      if (
        !item ||
        typeof item !== 'object' ||
        typeof item.quantity !== 'number' ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        (item.toppingIds !== undefined && !Array.isArray(item.toppingIds))
      ) {
        mergedItems.push(item);
        continue;
      }

      const key = canonicalizeCartItemKey(item);
      const existingIndex = mergedIndexByKey.get(key);
      if (existingIndex === undefined) {
        mergedIndexByKey.set(key, mergedItems.length);
        mergedItems.push({ ...item });
      } else {
        const existing = mergedItems[existingIndex]!;
        mergedItems[existingIndex] = {
          ...existing,
          quantity: existing.quantity + item.quantity,
        };
      }
    }

    const productsMap = this.catalogService.getProductsMap();
    const toppingsMap = this.catalogService.getToppingsMap();

    const resolvedLines: OrderLineResolved[] = mergedItems.map((item) => {
      try {
        return resolveOrderLine(item, productsMap, toppingsMap);
      } catch (error) {
        if (error instanceof OrderValidationError) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }
    });

    const totals = calculateOrderTotals(resolvedLines);
    const id = randomUUID();
    const now = new Date();
    const timestamp = now.toISOString();

    const db = this.databaseService.db;
    const existsByOrderCode = db.prepare(
      'SELECT 1 FROM orders WHERE order_code = ? LIMIT 1',
    );
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id,
        order_code,
        branch_id,
        branch_name,
        customer_name,
        customer_phone,
        delivery_address,
        note,
        payment_method,
        status,
        subtotal,
        shipping_fee,
        eco_fee,
        grand_total,
        total_items,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        kind,
        quantity,
        size,
        sugar_level,
        ice_level,
        toppings_json,
        spice_level,
        unit_price,
        line_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.exec('BEGIN IMMEDIATE');
    try {
      const orderCode = this.generateUniqueOrderCode(now, (candidate) =>
        Boolean(existsByOrderCode.get(candidate)),
      );

      insertOrder.run(
        id,
        orderCode,
        branch.id,
        branch.name,
        customerName,
        customerPhone,
        deliveryAddress,
        trimmedNote,
        payload.paymentMethod,
        'pending',
        totals.subtotal,
        totals.shippingFee,
        totals.ecoFee,
        totals.grandTotal,
        totals.totalItems,
        timestamp,
        timestamp,
      );

      for (const line of resolvedLines) {
        insertOrderItem.run(
          id,
          line.productId,
          line.productName,
          line.kind,
          line.quantity,
          line.size,
          line.sugarLevel ?? null,
          line.iceLevel ?? null,
          JSON.stringify(line.toppings),
          line.spiceLevel ?? null,
          line.unitPrice,
          line.lineTotal,
        );
      }

      db.exec('COMMIT');
    } catch (error) {
      try {
        db.exec('ROLLBACK');
      } catch {
        // Transaction was already rolled back by SQLite
      }
      throw error;
    }

    return this.getOrderById(id);
  }

  listOrders(filters?: OrdersFilter): OrderRecord[] {
    const db = this.databaseService.db;
    const conditions: string[] = [];
    const params: string[] = [];

    const rawStatus =
      typeof filters?.status === 'string' ? filters.status.trim() : '';
    if (rawStatus.length > 0) {
      if (!(ORDER_STATUSES as readonly string[]).includes(rawStatus)) {
        throw new BadRequestException(
          `Trạng thái đơn hàng "${rawStatus}" không hợp lệ.`,
        );
      }
      conditions.push('status = ?');
      params.push(rawStatus);
    }

    const rawBranchId =
      typeof filters?.branchId === 'string' ? filters.branchId.trim() : '';
    if (rawBranchId.length > 0) {
      conditions.push('branch_id = ?');
      params.push(rawBranchId);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderRows = db
      .prepare(
        `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC, rowid DESC`,
      )
      .all(...params) as unknown as OrderRow[];

    return this.hydrateOrders(orderRows);
  }

  getOrderByCode(rawOrderCode: string): OrderRecord {
    const normalized =
      typeof rawOrderCode === 'string' ? rawOrderCode.trim().toUpperCase() : '';
    if (!/^OM-\d{8}-[A-Z0-9]{4}$/.test(normalized)) {
      throw new BadRequestException(
        'Mã đơn hàng không đúng định dạng OM-YYYYMMDD-XXXX.',
      );
    }

    const row = this.databaseService.db
      .prepare('SELECT * FROM orders WHERE order_code = ?')
      .get(normalized) as unknown as OrderRow | undefined;

    if (!row) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${normalized}.`);
    }

    const [hydrated] = this.hydrateOrders([row]);
    if (!hydrated) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${normalized}.`);
    }

    return hydrated;
  }

  updateOrderStatus(id: string, status: OrderStatus): OrderRecord {
    if (
      typeof status !== 'string' ||
      !(ORDER_STATUSES as readonly string[]).includes(status)
    ) {
      throw new BadRequestException(
        `Trạng thái đơn hàng "${String(status)}" không hợp lệ.`,
      );
    }

    const updatedAt = new Date().toISOString();
    const result = this.databaseService.db
      .prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
      .run(status, updatedAt, id);

    if (result.changes === 0) {
      throw new NotFoundException(`Order "${id}" not found`);
    }

    return this.getOrderById(id);
  }

  private getOrderById(id: string): OrderRecord {
    const row = this.databaseService.db
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get(id) as unknown as OrderRow | undefined;

    if (!row) {
      throw new NotFoundException(`Order "${id}" not found`);
    }

    const [hydrated] = this.hydrateOrders([row]);
    if (!hydrated) {
      throw new NotFoundException(`Order "${id}" not found`);
    }

    return hydrated;
  }

  private hydrateOrders(orderRows: OrderRow[]): OrderRecord[] {
    if (orderRows.length === 0) {
      return [];
    }

    const placeholders = orderRows.map(() => '?').join(', ');
    const itemRows = this.databaseService.db
      .prepare(
        `SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`,
      )
      .all(...orderRows.map((row) => row.id)) as unknown as OrderItemRow[];

    const itemsByOrderId = new Map<string, OrderLineResolved[]>();
    for (const itemRow of itemRows) {
      const list = itemsByOrderId.get(itemRow.order_id) ?? [];
      list.push(this.mapOrderItemRow(itemRow));
      itemsByOrderId.set(itemRow.order_id, list);
    }

    return orderRows.map((row) => ({
      id: row.id,
      orderCode: row.order_code,
      branchId: row.branch_id,
      branchName: row.branch_name,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      deliveryAddress: row.delivery_address,
      ...(row.note.length > 0 ? { note: row.note } : {}),
      paymentMethod: row.payment_method as PaymentMethod,
      status: row.status as OrderStatus,
      items: itemsByOrderId.get(row.id) ?? [],
      subtotal: row.subtotal,
      shippingFee: row.shipping_fee,
      ecoFee: row.eco_fee,
      grandTotal: row.grand_total,
      totalItems: row.total_items,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  private mapOrderItemRow(row: OrderItemRow): OrderLineResolved {
    const toppings = JSON.parse(row.toppings_json) as OrderLineTopping[];
    const toppingsTotal = toppings.reduce(
      (sum, topping) => sum + topping.price,
      0,
    );
    const basePrice = row.unit_price - toppingsTotal;
    const size = row.size as ProductSizeCode;
    const sizeLabel = SIZE_LABELS[size] ?? row.size;
    const kind = row.kind as ProductKind;
    const sugarLevel = (row.sugar_level ?? undefined) as SugarLevel | undefined;
    const iceLevel = (row.ice_level ?? undefined) as IceLevel | undefined;
    const spiceLevel = (row.spice_level ?? undefined) as SpiceLevel | undefined;

    const canonicalKey = canonicalizeCartItemKey({
      productId: row.product_id,
      quantity: 1,
      size,
      sugarLevel,
      iceLevel,
      spiceLevel,
      toppingIds: toppings.map((topping) => topping.id),
    });

    return {
      canonicalKey,
      productId: row.product_id,
      productName: row.product_name,
      kind,
      quantity: row.quantity,
      size,
      sizeLabel,
      basePrice,
      ...(sugarLevel !== undefined ? { sugarLevel } : {}),
      ...(iceLevel !== undefined ? { iceLevel } : {}),
      ...(spiceLevel !== undefined ? { spiceLevel } : {}),
      toppings,
      unitPrice: row.unit_price,
      lineTotal: row.line_total,
    };
  }

  protected generateOrderCodeSuffix(): string {
    let suffix = '';
    for (let idx = 0; idx < 4; idx += 1) {
      suffix += ORDER_CODE_ALPHABET[randomInt(0, ORDER_CODE_ALPHABET.length)];
    }
    return suffix;
  }

  private generateUniqueOrderCode(
    date: Date,
    isTaken: (candidate: string) => boolean,
  ): string {
    const dateStamp = formatOrderDateStamp(date);

    for (let attempt = 0; attempt < MAX_ORDER_CODE_ATTEMPTS; attempt += 1) {
      const suffix = this.generateOrderCodeSuffix();
      const candidate = `OM-${dateStamp}-${suffix}`;
      if (!isTaken(candidate)) {
        return candidate;
      }
    }

    throw new InternalServerErrorException(
      'Unable to allocate a unique order code.',
    );
  }
}
