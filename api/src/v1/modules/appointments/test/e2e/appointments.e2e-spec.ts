import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { setupApplication } from '@/config/application.setup';
import { PrismaService } from '@/database/prisma/prisma.service';

describe('Appointments (e2e)', () => {
  let app: INestApplication;

  const visitor = {
    id: 1,
    name: 'João Silva',
    documentType: 'CPF',
    document: '12345678909',
    active: true,
    priorityType: { description: 'Normal' },
  };
  const room = {
    id: 1,
    name: 'Sala Horizonte',
    capacity: 1,
    active: true,
    availability: [
      { dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 2, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 3, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 4, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 5, opensAt: '08:00', closesAt: '18:00' },
    ],
  };
  const appointment = {
    id: 1,
    visitorId: 1,
    roomId: 1,
    startsAt: new Date('2026-08-20T13:00:00.000Z'),
    endsAt: new Date('2026-08-20T14:00:00.000Z'),
    status: 1,
    active: true,
    createdAt: new Date('2026-08-18T12:00:00.000Z'),
    visitor,
    room,
  };

  const prismaService = {
    $transaction: jest.fn((input: unknown) => {
      if (Array.isArray(input)) return Promise.all(input);
      if (typeof input === 'function') {
        const callback = input as (transaction: {
          $executeRaw: unknown;
        }) => unknown;
        return Promise.resolve(
          callback({ $executeRaw: jest.fn().mockResolvedValue(undefined) }),
        );
      }
      return Promise.resolve(input);
    }),
    appointment: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    visitor: { findFirst: jest.fn() },
    room: { findFirst: jest.fn() },
    holiday: { findFirst: jest.fn() },
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
    prismaService.appointment.findMany.mockResolvedValue([appointment]);
    prismaService.appointment.count.mockResolvedValue(0);
    prismaService.appointment.findFirst.mockResolvedValue(null);
    prismaService.appointment.create.mockResolvedValue(appointment);
    prismaService.appointment.update.mockResolvedValue({
      ...appointment,
      active: false,
      status: 3,
    });
    prismaService.visitor.findFirst.mockResolvedValue(visitor);
    prismaService.room.findFirst.mockResolvedValue(room);
    prismaService.holiday.findFirst.mockResolvedValue(null);
  });

  it('GET /api/v1/appointments returns a paginated appointment list', async () => {
    prismaService.appointment.count.mockResolvedValueOnce(1);

    const response = await request(app.getHttpServer() as Server)
      .get('/api/v1/appointments?page=1')
      .expect(200);

    expect(response.body).toMatchObject({
      data: [
        {
          id: 1,
          visitor: { name: 'João Silva' },
          room: { name: 'Sala Horizonte' },
          date: '2026-08-20',
          startsAt: '09:00',
          endsAt: '10:00',
        },
      ],
      meta: { page: 1, limit: 15, total: 1, totalPages: 1 },
    });
  });

  it('GET /api/v1/appointments can include inactive room history', async () => {
    await request(app.getHttpServer() as Server)
      .get('/api/v1/appointments?roomId=1&includeInactive=true&page=1')
      .expect(200);

    const findManyCalls = prismaService.appointment.findMany.mock
      .calls as Array<[{ where?: { active?: boolean; roomId?: number } }]>;
    const findManyArgs = findManyCalls.at(-1)?.[0];

    expect(findManyArgs?.where?.active).toBeUndefined();
    expect(findManyArgs?.where?.roomId).toBe(1);
  });

  it('GET /api/v1/appointments can include inactive visitor history', async () => {
    await request(app.getHttpServer() as Server)
      .get('/api/v1/appointments?visitorId=1&includeInactive=true&page=1')
      .expect(200);

    const findManyCalls = prismaService.appointment.findMany.mock
      .calls as Array<[{ where?: { active?: boolean; visitorId?: number } }]>;
    const findManyArgs = findManyCalls.at(-1)?.[0];

    expect(findManyArgs?.where?.active).toBeUndefined();
    expect(findManyArgs?.where?.visitorId).toBe(1);
  });

  it('rejects invalid appointment status transitions', async () => {
    prismaService.appointment.findFirst.mockResolvedValue({
      ...appointment,
      status: 2,
    });

    const response = await request(app.getHttpServer() as Server)
      .patch('/api/v1/appointments/1/status')
      .send({ status: 1 })
      .expect(400);

    expect(response.body).toMatchObject({
      code: 'INVALID_APPOINTMENT_STATUS_TRANSITION',
    });
  });

  it('POST /api/v1/appointments creates an appointment', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/api/v1/appointments')
      .send({
        visitorId: 1,
        roomId: 1,
        date: '2026-08-20',
        startsAt: '09:00',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: 1,
      date: '2026-08-20',
      startsAt: '09:00',
      endsAt: '10:00',
    });
    expect(prismaService.appointment.create).toHaveBeenCalledWith({
      data: {
        visitorId: 1,
        roomId: 1,
        startsAt: new Date('2026-08-20T13:00:00.000Z'),
        endsAt: new Date('2026-08-20T14:00:00.000Z'),
      },
      include: {
        visitor: { include: { priorityType: true } },
        room: true,
      },
    });
  });

  it('GET /api/v1/appointments/availability returns selectable slots', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/api/v1/appointments/availability?roomId=1&date=2026-08-20')
      .expect(200);
    const body = response.body as unknown as {
      date: string;
      slots: Array<{
        startsAt: string;
        endsAt: string;
        available: boolean;
        occupancy: number;
        capacity: number;
      }>;
    };

    expect(body.date).toBe('2026-08-20');
    expect(body.slots).toContainEqual({
      startsAt: '08:00',
      endsAt: '09:00',
      available: true,
      occupancy: 0,
      capacity: 1,
    });
    expect(body.slots.map((slot) => slot.startsAt)).not.toContain('08:30');
  });

  it('GET /api/v1/appointments/availability suggests the next date for a holiday', async () => {
    prismaService.holiday.findFirst.mockImplementation(
      ({ where }: { where: { date: Date } }) =>
        Promise.resolve(
          where.date.toISOString().slice(0, 10) === '2026-08-20'
            ? { id: 1 }
            : null,
        ),
    );

    const response = await request(app.getHttpServer() as Server)
      .get(
        '/api/v1/appointments/availability?roomId=1&date=2026-08-20&visitorId=1',
      )
      .expect(200);

    expect(response.body).toMatchObject({
      suggestion: {
        date: '2026-08-21',
        opensAt: '08:00',
        closesAt: '18:00',
        startsAt: '08:00',
        endsAt: '09:00',
      },
    });
  });

  it('rejects holiday appointments with a suggestion', async () => {
    prismaService.holiday.findFirst.mockImplementation(
      ({ where }: { where: { date: Date } }) =>
        Promise.resolve(
          where.date.toISOString().slice(0, 10) === '2026-08-20'
            ? { id: 1 }
            : null,
        ),
    );

    const response = await request(app.getHttpServer() as Server)
      .post('/api/v1/appointments')
      .send({
        visitorId: 1,
        roomId: 1,
        date: '2026-08-20',
        startsAt: '09:00',
      })
      .expect(422);

    expect(response.body).toMatchObject({
      code: 'APPOINTMENT_UNAVAILABLE',
      message: 'A data selecionada é um feriado.',
      details: {
        suggestion: {
          startsAt: '2026-08-21T12:00:00.000Z',
          endsAt: '2026-08-21T13:00:00.000Z',
        },
      },
    });
  });
});
