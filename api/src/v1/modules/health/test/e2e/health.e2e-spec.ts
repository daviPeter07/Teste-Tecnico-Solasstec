import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { setupApplication } from '@/config/application.setup';
import { PrismaService } from '@/database/prisma/prisma.service';

describe('Health (e2e)', () => {
  let app: INestApplication;
  const prismaService = {
    ping: jest.fn<Promise<void>, []>(),
  };

  beforeAll(async () => {
    process.env.DATABASE_URL ??=
      'postgresql://postgres:postgres@localhost:5432/solasstec_portaria?schema=public';
    process.env.CORS_ORIGIN ??= 'http://test.local';
    prismaService.ping.mockResolvedValue();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    setupApplication(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/api/v1/health')
      .expect(200);

    expect(response.body).toEqual({
      message: 'Sistema operando normalmente.',
    });
  });

  it('serializes database failures as 503', async () => {
    prismaService.ping.mockRejectedValueOnce(new Error('connection refused'));

    const response = await request(app.getHttpServer() as Server)
      .get('/api/v1/health')
      .expect(503);

    expect(response.body).toMatchObject({
      statusCode: 503,
      code: 'SYSTEM_UNAVAILABLE',
      message: 'Sistema indisponível temporariamente.',
      path: '/api/v1/health',
    });
  });
});
