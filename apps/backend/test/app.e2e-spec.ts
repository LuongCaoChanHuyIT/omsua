import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('Backend App (e2e)', () => {
  let app: INestApplication;
  const originalCorsOrigins = process.env.CORS_ORIGINS;

  beforeAll(async () => {
    process.env.CORS_ORIGINS = '';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    if (originalCorsOrigins === undefined) {
      delete process.env.CORS_ORIGINS;
    } else {
      process.env.CORS_ORIGINS = originalCorsOrigins;
    }
    await app.close();
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
});
