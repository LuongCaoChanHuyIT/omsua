import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { CreateOrderPayload } from '@omsua/shared';
import { CatalogModule } from '../catalog/catalog.module';
import { CatalogService } from '../catalog/catalog.service';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { OrdersModule } from './orders.module';
import { OrdersService } from './orders.service';

describe('OrdersService (SQLite :memory:)', () => {
  let moduleRef: TestingModule;
  let ordersService: OrdersService;
  let catalogService: CatalogService;
  let databaseService: DatabaseService;
  const originalSqlitePath = process.env.SQLITE_PATH;

  const baseOrderPayload: CreateOrderPayload = {
    branchId: 'cs1-hoang-dieu',
    customerName: '  Nguyễn Minh Anh  ',
    customerPhone: '0905 123-456',
    deliveryAddress: '  12 Khu Hòa Bình, Phường 1, Đà Lạt  ',
    note: '  Giao trước 16h giúp mình  ',
    paymentMethod: 'cod',
    items: [
      {
        productId: 'tra-sua-atiso',
        quantity: 1,
        size: 'M',
        sugarLevel: '70',
        iceLevel: '70',
        toppingIds: ['tran-chau-den'],
      },
      {
        productId: 'banh-trang-tron-top-mo',
        quantity: 1,
        size: 'STD',
        spiceLevel: 'cay-vua',
      },
    ],
  };

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
        OrdersModule,
      ],
    }).compile();

    await moduleRef.init();

    ordersService = moduleRef.get<OrdersService>(OrdersService);
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

  it('creates an order transactionally with server-calculated totals, normalized phone, and OM-YYYYMMDD-XXXX code', () => {
    const created = ordersService.createOrder(baseOrderPayload);

    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(created.orderCode).toMatch(/^OM-\d{8}-[A-Z0-9]{4}$/);
    expect(created.branchId).toBe('cs1-hoang-dieu');
    expect(created.branchName).toBe('Cơ sở 1 — Hoàng Diệu');
    expect(created.customerName).toBe('Nguyễn Minh Anh');
    expect(created.customerPhone).toBe('0905123456');
    expect(created.deliveryAddress).toBe('12 Khu Hòa Bình, Phường 1, Đà Lạt');
    expect(created.note).toBe('Giao trước 16h giúp mình');
    expect(created.paymentMethod).toBe('cod');
    expect(created.status).toBe('pending');
    expect(created.subtotal).toBe(95000);
    expect(created.shippingFee).toBe(0);
    expect(created.ecoFee).toBe(0);
    expect(created.grandTotal).toBe(95000);
    expect(created.totalItems).toBe(2);
    expect(created.items).toHaveLength(2);
    expect(created.items[0]).toMatchObject({
      productId: 'tra-sua-atiso',
      size: 'M',
      basePrice: 45000,
      unitPrice: 55000,
      lineTotal: 55000,
    });
    expect(created.items[1]).toMatchObject({
      productId: 'banh-trang-tron-top-mo',
      size: 'STD',
      spiceLevel: 'cay-vua',
      basePrice: 40000,
      unitPrice: 40000,
      lineTotal: 40000,
    });

    const persistedOrders = databaseService.db
      .prepare('SELECT COUNT(*) AS count FROM orders')
      .get() as { count: number };
    const persistedItems = databaseService.db
      .prepare('SELECT COUNT(*) AS count FROM order_items')
      .get() as { count: number };
    expect(persistedOrders.count).toBe(1);
    expect(persistedItems.count).toBe(2);
  });

  it('rejects invalid phone, unknown branchId, invalid size, toppings on snacks, and unavailable products', () => {
    expect(() =>
      ordersService.createOrder({
        ...baseOrderPayload,
        customerPhone: '12345',
      }),
    ).toThrow(BadRequestException);

    expect(() =>
      ordersService.createOrder({
        ...baseOrderPayload,
        branchId: 'unknown-branch',
      }),
    ).toThrow(BadRequestException);

    expect(() =>
      ordersService.createOrder({
        ...baseOrderPayload,
        items: [
          {
            productId: 'quyt-nhai-cat-tuong',
            quantity: 1,
            size: 'M',
            sugarLevel: '70',
            iceLevel: '70',
          },
        ],
      }),
    ).toThrow(BadRequestException);

    expect(() =>
      ordersService.createOrder({
        ...baseOrderPayload,
        items: [
          {
            productId: 'banh-trang-tron-top-mo',
            quantity: 1,
            size: 'STD',
            spiceLevel: 'cay-vua',
            toppingIds: ['tran-chau-den'],
          },
        ],
      }),
    ).toThrow(BadRequestException);

    catalogService.setProductAvailability('tra-sua-atiso', false);

    expect(() => ordersService.createOrder(baseOrderPayload)).toThrow(
      BadRequestException,
    );
  });

  it('lists orders newest-first with optional status/branchId filters and updates order status', () => {
    const firstOrder = ordersService.createOrder({
      ...baseOrderPayload,
      note: undefined,
    });
    const secondOrder = ordersService.createOrder({
      ...baseOrderPayload,
      branchId: 'cs2-hem-33-nct',
      paymentMethod: 'qr',
    });

    const allOrders = ordersService.listOrders();
    expect(allOrders.map((order) => order.id)).toEqual([
      secondOrder.id,
      firstOrder.id,
    ]);
    expect(allOrders[1]?.items).toEqual(firstOrder.items);
    expect(allOrders[1]?.note).toBeUndefined();

    const filteredCs1 = ordersService.listOrders({
      branchId: 'cs1-hoang-dieu',
      status: 'pending',
    });
    expect(filteredCs1).toHaveLength(1);
    expect(filteredCs1[0]?.id).toBe(firstOrder.id);

    const updated = ordersService.updateOrderStatus(firstOrder.id, 'preparing');
    expect(updated.status).toBe('preparing');

    expect(
      ordersService.listOrders({
        branchId: 'cs1-hoang-dieu',
        status: 'pending',
      }),
    ).toHaveLength(0);
    expect(
      ordersService.listOrders({
        branchId: 'cs1-hoang-dieu',
        status: 'preparing',
      }),
    ).toHaveLength(1);

    expect(() =>
      ordersService.updateOrderStatus('non-existent-order-id', 'completed'),
    ).toThrow(NotFoundException);
  });

  it('retries orderCode generation on collision and rolls back orders insert if order_items insert fails', () => {
    const suffixSpy = jest.spyOn(
      ordersService as unknown as { generateOrderCodeSuffix: () => string },
      'generateOrderCodeSuffix',
    );
    suffixSpy
      .mockReturnValueOnce('AB12')
      .mockReturnValueOnce('AB12')
      .mockReturnValueOnce('CD34');

    const first = ordersService.createOrder(baseOrderPayload);
    const second = ordersService.createOrder(baseOrderPayload);

    expect(first.orderCode).toMatch(/^OM-\d{8}-AB12$/);
    expect(second.orderCode).toMatch(/^OM-\d{8}-CD34$/);
    suffixSpy.mockRestore();

    databaseService.db.exec(`
      CREATE TRIGGER fail_order_items_insert
      BEFORE INSERT ON order_items
      BEGIN
        SELECT RAISE(ABORT, 'simulated order_items failure');
      END;
    `);

    expect(() => ordersService.createOrder(baseOrderPayload)).toThrow();

    const orderCountAfterRollback = databaseService.db
      .prepare('SELECT COUNT(*) AS count FROM orders')
      .get() as { count: number };
    expect(orderCountAfterRollback.count).toBe(2);

    databaseService.db.exec('DROP TRIGGER fail_order_items_insert');

    const recovered = ordersService.createOrder(baseOrderPayload);
    expect(recovered.orderCode).toMatch(/^OM-\d{8}-[A-Z0-9]{4}$/);
  });

  it('merges duplicate OrderItemDto inputs sharing canonicalizeCartItemKey into one order_items row and enforces quantity <= 99 after summing', () => {
    const mergedOrder = ordersService.createOrder({
      ...baseOrderPayload,
      items: [
        {
          productId: 'tra-sua-atiso',
          quantity: 1,
          size: 'M',
          sugarLevel: '70',
          iceLevel: '70',
          toppingIds: ['khuc-bach', 'tran-chau-den'],
        },
        {
          productId: 'tra-sua-atiso',
          quantity: 2,
          size: 'M',
          sugarLevel: '70',
          iceLevel: '70',
          toppingIds: ['tran-chau-den', 'khuc-bach'],
        },
      ],
    });

    expect(mergedOrder.items).toHaveLength(1);
    expect(mergedOrder.items[0]).toMatchObject({
      productId: 'tra-sua-atiso',
      quantity: 3,
      unitPrice: 65000,
      lineTotal: 195000,
    });
    expect(mergedOrder.totalItems).toBe(3);
    expect(mergedOrder.grandTotal).toBe(195000);

    const rowCount = databaseService.db
      .prepare('SELECT COUNT(*) AS count FROM order_items WHERE order_id = ?')
      .get(mergedOrder.id) as { count: number };
    expect(rowCount.count).toBe(1);

    // Merged quantity > 99 must be rejected by resolveOrderLine
    expect(() =>
      ordersService.createOrder({
        ...baseOrderPayload,
        items: [
          {
            productId: 'tra-sua-atiso',
            quantity: 60,
            size: 'M',
            sugarLevel: '70',
            iceLevel: '70',
          },
          {
            productId: 'tra-sua-atiso',
            quantity: 50,
            size: 'M',
            sugarLevel: '70',
            iceLevel: '70',
          },
        ],
      }),
    ).toThrow(BadRequestException);
  });
});
