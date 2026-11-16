import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('Backend App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
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

  it('enforces CORS allowlist for web (:3000) and admin (:3001) while omitting unlisted origins', async () => {
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
