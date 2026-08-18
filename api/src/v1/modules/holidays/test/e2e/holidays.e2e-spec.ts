import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { setupApplication } from '@/config/application.setup';
import { PrismaService } from '@/database/prisma/prisma.service';

describe('Holidays (e2e)', () => {
  let app: INestApplication;

  const holiday = {
    id: 1,
    date: new Date('2026-12-25T00:00:00.000Z'),
    description: 'Natal',
    type: 1,
    active: true,
    createdAt: new Date('2026-08-18T12:00:00.000Z'),
  };

  const prismaService = {
    $transaction: jest.fn((input: unknown) => {
      if (Array.isArray(input)) return Promise.all(input);
      return Promise.resolve(input);
    }),
    holiday: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.CORS_ORIGIN ??= 'http://test.local';
    process.env.BUSINESS_TIME_ZONE = 'America/Manaus';

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

  afterAll(async () => app.close());

  beforeEach(() => {
    jest.clearAllMocks();
    prismaService.holiday.findMany.mockResolvedValue([holiday]);
    prismaService.holiday.count.mockResolvedValue(1);
    prismaService.holiday.findFirst.mockResolvedValue(holiday);
    prismaService.holiday.findUnique.mockResolvedValue(null);
    prismaService.holiday.create.mockResolvedValue(holiday);
    prismaService.holiday.update.mockResolvedValue({
      ...holiday,
      description: 'Natal Nacional',
    });
  });

  it('GET /api/v1/holidays returns a paginated holiday list', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/api/v1/holidays?page=1')
      .expect(200);

    expect(response.body).toEqual({
      data: [
        {
          id: 1,
          date: '2026-12-25',
          description: 'Natal',
          type: 1,
          active: true,
          createdAt: '2026-08-18T12:00:00.000Z',
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  });

  it('POST /api/v1/holidays creates a holiday', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/api/v1/holidays')
      .send({ date: '2026-12-25', description: ' Natal ', type: 1 })
      .expect(201);

    expect(response.body).toMatchObject({
      id: 1,
      date: '2026-12-25',
      description: 'Natal',
      type: 1,
    });
    expect(prismaService.holiday.create).toHaveBeenCalledWith({
      data: {
        date: new Date('2026-12-25T00:00:00.000Z'),
        description: 'Natal',
        type: 1,
      },
    });
  });

  it('PATCH /api/v1/holidays/:id updates a holiday', async () => {
    const response = await request(app.getHttpServer() as Server)
      .patch('/api/v1/holidays/1')
      .send({ description: ' Natal Nacional ' })
      .expect(200);

    expect(response.body).toMatchObject({
      id: 1,
      date: '2026-12-25',
      description: 'Natal Nacional',
    });
    expect(prismaService.holiday.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        date: new Date('2026-12-25T00:00:00.000Z'),
        description: 'Natal Nacional',
        type: 1,
      },
    });
  });

  it('DELETE /api/v1/holidays/:id deactivates a holiday', async () => {
    await request(app.getHttpServer() as Server)
      .delete('/api/v1/holidays/1')
      .expect(204);

    expect(prismaService.holiday.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { active: false },
    });
  });

  it('rejects duplicate holiday dates', async () => {
    prismaService.holiday.findUnique.mockResolvedValueOnce(holiday);

    const response = await request(app.getHttpServer() as Server)
      .post('/api/v1/holidays')
      .send({ date: '2026-12-25', description: 'Natal', type: 1 })
      .expect(409);

    expect(response.body).toMatchObject({
      code: 'HOLIDAY_DATE_CONFLICT',
      message: 'Já existe um feriado cadastrado para esta data.',
    });
  });
});
