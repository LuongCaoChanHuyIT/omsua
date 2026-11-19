import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('Backend App (e2e)', () => {
  let app: INestApplication;
  const originalCorsOrigins = process.env.CORS_ORIGINS;
  const originalSqlitePath = process.env.SQLITE_PATH;

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

  it('GET /api/health returns 200 with ApiResponse<HealthStatus>', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      status: 'ok',
      service: 'omsua-backend',
      version: '0.1.0',
    });
    expect(typeof res.body.data.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('enforces default CORS allowlist (:3000, :3001) deterministically regardless of shell or .env overrides', async () => {
    const webRes = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', 'http://localhost:3000')
      .expect(200);
    expect(webRes.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );

    const adminRes = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', 'http://localhost:3001')
      .expect(200);
    expect(adminRes.headers['access-control-allow-origin']).toBe(
      'http://localhost:3001',
    );

    const blockedRes = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', 'http://evil.example.com')
      .expect(200);
    expect(blockedRes.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('normalizes custom CORS_ORIGINS with whitespace and trailing slashes end-to-end', async () => {
    process.env.CORS_ORIGINS = ' https://portal.omsua.vn/// ';
    const customModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const customApp = customModule.createNestApplication();
    configureApp(customApp);
    await customApp.init();

    try {
      const allowed = await request(customApp.getHttpServer())
        .get('/api/health')
        .set('Origin', 'https://portal.omsua.vn')
        .expect(200);
      expect(allowed.headers['access-control-allow-origin']).toBe(
        'https://portal.omsua.vn',
      );
    } finally {
      process.env.CORS_ORIGINS = '';
      await customApp.close();
    }
  });

  it('rejects non-whitelisted query parameters via global ValidationPipe', async () => {
    await request(app.getHttpServer())
      .get('/api/health?unexpectedParam=1')
      .expect(400);
  });

  it('GET /api/docs serves Swagger UI HTML', async () => {
    const res = await request(app.getHttpServer()).get('/api/docs').expect(200);
    expect(res.text).toContain('Swagger UI');
  });

  it('GET /api/docs-json exposes single-tag operations, /api/orders/code/{orderCode}, and concrete OpenAPI response schemas', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);

    const doc = res.body as {
      paths: Record<
        string,
        Record<
          string,
          {
            tags?: string[];
            responses?: Record<
              string,
              {
                content?: {
                  'application/json'?: {
                    schema?: { $ref?: string };
                  };
                };
              }
            >;
          }
        >
      >;
      components?: {
        schemas?: Record<string, { properties?: Record<string, unknown> }>;
      };
    };

    expect(doc.paths['/api/health']?.get?.tags).toEqual(['health']);
    expect(doc.paths['/api/catalog']?.get?.tags).toEqual(['catalog']);
    expect(
      doc.paths['/api/catalog/products/{id}/availability']?.patch?.tags,
    ).toEqual(['catalog']);
    expect(doc.paths['/api/branches']?.get?.tags).toEqual(['branches']);
    expect(doc.paths['/api/orders']?.post?.tags).toEqual(['orders']);
    expect(doc.paths['/api/orders']?.get?.tags).toEqual(['orders']);
    expect(doc.paths['/api/orders/code/{orderCode}']?.get?.tags).toEqual([
      'orders',
    ]);
    expect(doc.paths['/api/orders/{id}/status']?.patch?.tags).toEqual([
      'orders',
    ]);

    const schemas = doc.components?.schemas ?? {};
    const assertConcreteEnvelopeRef = (
      pathKey: string,
      method: string,
      statusCode: string,
    ) => {
      const ref =
        doc.paths[pathKey]?.[method]?.responses?.[statusCode]?.content?.[
          'application/json'
        ]?.schema?.$ref;
      expect(ref).toMatch(/^#\/components\/schemas\/.+/);
      const schemaName = ref!.replace('#/components/schemas/', '');
      const schemaObj = schemas[schemaName];
      expect(schemaObj).toBeDefined();
      expect(schemaObj?.properties).toHaveProperty('success');
      expect(schemaObj?.properties).toHaveProperty('data');
      expect(schemaObj?.properties).toHaveProperty('timestamp');
    };

    assertConcreteEnvelopeRef('/api/health', 'get', '200');
    assertConcreteEnvelopeRef('/api/catalog', 'get', '200');
    assertConcreteEnvelopeRef(
      '/api/catalog/products/{id}/availability',
      'patch',
      '200',
    );
    assertConcreteEnvelopeRef('/api/branches', 'get', '200');
    assertConcreteEnvelopeRef('/api/orders', 'post', '201');
    assertConcreteEnvelopeRef('/api/orders', 'get', '200');
    assertConcreteEnvelopeRef('/api/orders/code/{orderCode}', 'get', '200');
    assertConcreteEnvelopeRef('/api/orders/{id}/status', 'patch', '200');

    expect(
      doc.paths['/api/orders/code/{orderCode}']?.get?.responses?.['400']
        ?.content?.['application/json']?.schema?.$ref,
    ).toMatch(/^#\/components\/schemas\/.+/);
    expect(
      doc.paths['/api/orders/code/{orderCode}']?.get?.responses?.['404']
        ?.content?.['application/json']?.schema?.$ref,
    ).toMatch(/^#\/components\/schemas\/.+/);
  });

  it('GET /api/catalog returns 200 ApiResponse<CatalogPayload> with 4 categories, 30 products, and 8 toppings', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/catalog')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(typeof res.body.timestamp).toBe('string');
    expect(res.body.data.categories).toHaveLength(4);
    expect(res.body.data.products).toHaveLength(30);
    expect(
      res.body.data.products.filter(
        (product: { kind: string }) => product.kind === 'drink',
      ),
    ).toHaveLength(24);
    expect(
      res.body.data.products.filter(
        (product: { kind: string }) => product.kind === 'snack',
      ),
    ).toHaveLength(6);
    expect(res.body.data.toppings).toHaveLength(8);
  });

  it('GET /api/branches returns 200 ApiResponse<BranchInfo[]> with 4 branches starting with cs1-hoang-dieu', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/branches')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(4);
    expect(res.body.data[0]).toMatchObject({
      id: 'cs1-hoang-dieu',
      name: 'Cơ sở 1 — Hoàng Diệu',
      shortLabel: '28A Hoàng Diệu, ĐL',
    });
  });

  it('PATCH /api/catalog/products/:id/availability toggles availability, validates boolean DTO (400), and returns 404 on unknown ID', async () => {
    const disableRes = await request(app.getHttpServer())
      .patch('/api/catalog/products/tra-sua-atiso/availability')
      .send({ isAvailable: false })
      .expect(200);

    expect(disableRes.body.success).toBe(true);
    expect(disableRes.body.data).toMatchObject({
      id: 'tra-sua-atiso',
      isAvailable: false,
    });

    const catalogAfterDisable = await request(app.getHttpServer())
      .get('/api/catalog')
      .expect(200);
    const disabledItem = catalogAfterDisable.body.data.products.find(
      (product: { id: string }) => product.id === 'tra-sua-atiso',
    );
    expect(disabledItem?.isAvailable).toBe(false);

    const enableRes = await request(app.getHttpServer())
      .patch('/api/catalog/products/tra-sua-atiso/availability')
      .send({ isAvailable: true })
      .expect(200);
    expect(enableRes.body.data.isAvailable).toBe(true);

    await request(app.getHttpServer())
      .patch('/api/catalog/products/tra-sua-atiso/availability')
      .send({ isAvailable: 'not-a-boolean' })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/api/catalog/products/tra-sua-atiso/availability')
      .send({ isAvailable: false, unexpected: true })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/api/catalog/products/unknown-id/availability')
      .send({ isAvailable: false })
      .expect(404);
  });
});
