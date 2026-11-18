import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('Orders & Catalog Integration (e2e)', () => {
  let app: INestApplication;
  const originalCorsOrigins = process.env.CORS_ORIGINS;
  const originalSqlitePath = process.env.SQLITE_PATH;

  const validOrderPayload = {
    branchId: 'cs1-hoang-dieu',
    customerName: '  Trần Thảo Vy  ',
    customerPhone: '0912.345-678',
    deliveryAddress: '  45 Phan Đình Phùng, Phường 2, Đà Lạt  ',
    note: '  Ít ngọt tự nhiên  ',
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

  beforeAll(async () => {
    process.env.CORS_ORIGINS = '';
    process.env.SQLITE_PATH = ':memory:';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (originalCorsOrigins === undefined) {
      delete process.env.CORS_ORIGINS;
    } else {
      process.env.CORS_ORIGINS = originalCorsOrigins;
    }
    if (originalSqlitePath === undefined) {
      delete process.env.SQLITE_PATH;
    } else {
      process.env.SQLITE_PATH = originalSqlitePath;
    }
  });

  it('POST /api/orders creates a mixed drink + snack order (201) with server totals and OM-YYYYMMDD-XXXX orderCode', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .send(validOrderPayload)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(typeof res.body.timestamp).toBe('string');
    expect(res.body.data).toMatchObject({
      branchId: 'cs1-hoang-dieu',
      branchName: 'Cơ sở 1 — Hoàng Diệu',
      customerName: 'Trần Thảo Vy',
      customerPhone: '0912345678',
      deliveryAddress: '45 Phan Đình Phùng, Phường 2, Đà Lạt',
      note: 'Ít ngọt tự nhiên',
      paymentMethod: 'cod',
      status: 'pending',
      subtotal: 95000,
      shippingFee: 0,
      ecoFee: 0,
      grandTotal: 95000,
      totalItems: 2,
    });
    expect(res.body.data.orderCode).toMatch(/^OM-\d{8}-[A-Z0-9]{4}$/);
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.items[0]).toMatchObject({
      productId: 'tra-sua-atiso',
      unitPrice: 55000,
      lineTotal: 55000,
    });
    expect(res.body.data.items[1]).toMatchObject({
      productId: 'banh-trang-tron-top-mo',
      unitPrice: 40000,
      lineTotal: 40000,
    });
  });

  it('POST /api/orders rejects invalid phone, unknown branchId, invalid size, toppings on snacks, and client price tampering (400)', async () => {
    // Invalid Vietnamese phone number
    await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        ...validOrderPayload,
        customerPhone: '12345',
      })
      .expect(400);

    // Unknown branchId
    await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        ...validOrderPayload,
        branchId: 'cs99-mars',
      })
      .expect(400);

    // Invalid size 'M' on L-only drink quyt-nhai-cat-tuong
    await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        ...validOrderPayload,
        items: [
          {
            productId: 'quyt-nhai-cat-tuong',
            quantity: 1,
            size: 'M',
            sugarLevel: '70',
            iceLevel: '70',
          },
        ],
      })
      .expect(400);

    // Toppings on snack
    await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        ...validOrderPayload,
        items: [
          {
            productId: 'banh-trang-tron-top-mo',
            quantity: 1,
            size: 'STD',
            spiceLevel: 'cay-vua',
            toppingIds: ['tran-chau-den'],
          },
        ],
      })
      .expect(400);

    // Client-supplied grandTotal tampering (forbidNonWhitelisted)
    await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        ...validOrderPayload,
        grandTotal: 1000,
      })
      .expect(400);

    // Client-supplied unitPrice tampering on line item (forbidNonWhitelisted)
    await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        ...validOrderPayload,
        items: [
          {
            ...validOrderPayload.items[0],
            unitPrice: 1000,
          },
        ],
      })
      .expect(400);
  });

  it('rejects orders containing an out-of-stock product after PATCH /api/catalog/products/:id/availability disables it', async () => {
    await request(app.getHttpServer())
      .patch('/api/catalog/products/tra-sua-atiso/availability')
      .send({ isAvailable: false })
      .expect(200);

    try {
      await request(app.getHttpServer())
        .post('/api/orders')
        .send(validOrderPayload)
        .expect(400);
    } finally {
      await request(app.getHttpServer())
        .patch('/api/catalog/products/tra-sua-atiso/availability')
        .send({ isAvailable: true })
        .expect(200);
    }
  });

  it('GET /api/orders filters by branchId & status, and PATCH /api/orders/:id/status updates status (404 on unknown ID)', async () => {
    const listPendingRes = await request(app.getHttpServer())
      .get('/api/orders?branchId=cs1-hoang-dieu&status=pending')
      .expect(200);

    expect(listPendingRes.body.success).toBe(true);
    expect(listPendingRes.body.data).toHaveLength(1);
    const createdOrderId: string = listPendingRes.body.data[0].id;
    expect(listPendingRes.body.data[0].grandTotal).toBe(95000);
    expect(listPendingRes.body.data[0].items).toHaveLength(2);

    // Unfiltered GET /api/orders and empty query strings should both work cleanly
    const listAllNoQuery = await request(app.getHttpServer())
      .get('/api/orders')
      .expect(200);
    expect(listAllNoQuery.body.data.length).toBeGreaterThanOrEqual(1);

    const listAllEmptyQuery = await request(app.getHttpServer())
      .get('/api/orders?status=&branchId=')
      .expect(200);
    expect(listAllEmptyQuery.body.data.length).toBeGreaterThanOrEqual(1);

    // Non-whitelisted query param rejected with 400
    await request(app.getHttpServer())
      .get('/api/orders?unexpected=1')
      .expect(400);

    // Invalid status filter rejected with 400
    await request(app.getHttpServer())
      .get('/api/orders?status=unknown_status')
      .expect(400);

    // Update status to preparing
    const patchRes = await request(app.getHttpServer())
      .patch(`/api/orders/${createdOrderId}/status`)
      .send({ status: 'preparing' })
      .expect(200);

    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.id).toBe(createdOrderId);
    expect(patchRes.body.data.status).toBe('preparing');

    // Persisted status verified via GET /api/orders
    const listPreparingRes = await request(app.getHttpServer())
      .get('/api/orders?branchId=cs1-hoang-dieu&status=preparing')
      .expect(200);
    expect(listPreparingRes.body.data).toHaveLength(1);
    expect(listPreparingRes.body.data[0].id).toBe(createdOrderId);

    // Invalid status body rejected with 400
    await request(app.getHttpServer())
      .patch(`/api/orders/${createdOrderId}/status`)
      .send({ status: 'invalid-state' })
      .expect(400);

    // Unknown order ID returns 404
    await request(app.getHttpServer())
      .patch('/api/orders/00000000-0000-0000-0000-000000000000/status')
      .send({ status: 'preparing' })
      .expect(404);
  });
});
