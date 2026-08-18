import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { setupApplication } from '@/config/application.setup';
import { PrismaService } from '@/database/prisma/prisma.service';

describe('Rooms (e2e)', () => {
  let app: INestApplication;

  const room = {
    id: 1,
    name: 'Sala Horizonte',
    capacity: 12,
    availability: [{ dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' }],
    active: true,
    createdAt: new Date('2026-08-15T12:00:00.000Z'),
    responsibleHistory: [
      {
        id: 1,
        name: 'Ana Souza',
        validFrom: new Date('2026-08-15T12:00:00.000Z'),
        validUntil: null,
        active: true,
      },
    ],
  };

  const transactionClient = {
    room: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    roomResponsible: {
      update: jest.fn(),
      create: jest.fn(),
    },
    roomAvailabilityHistory: {
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  type RoomTransactionCallback = (
    client: typeof transactionClient,
  ) => Promise<unknown>;

  const prismaService = {
    $transaction: jest.fn((input: unknown) => {
      if (Array.isArray(input)) return Promise.all(input);
      if (typeof input === 'function') {
        const transaction = input as RoomTransactionCallback;
        return Promise.resolve(transaction(transactionClient));
      }
      return Promise.resolve(input);
    }),
    room: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
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
    prismaService.room.findMany.mockResolvedValue([room]);
    prismaService.room.count.mockResolvedValue(1);
    prismaService.room.findFirst.mockResolvedValue(room);
    prismaService.room.create.mockResolvedValue(room);
    prismaService.room.update.mockResolvedValue({ ...room, active: false });
    transactionClient.room.findUnique.mockResolvedValue({
      ...room,
      availabilityHistory: [
        {
          id: 1,
          availability: room.availability,
          validFrom: new Date('2026-08-15T12:00:00.000Z'),
          validUntil: null,
          active: true,
        },
      ],
    });
    transactionClient.room.update.mockResolvedValue(room);
    transactionClient.room.findUniqueOrThrow.mockResolvedValue({
      ...room,
      name: 'Sala Aurora',
    });
  });

  it('GET /api/v1/rooms returns a paginated room list', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/api/v1/rooms?page=1')
      .expect(200);

    expect(response.body).toMatchObject({
      data: [
        {
          id: 1,
          name: 'Sala Horizonte',
          currentResponsible: { name: 'Ana Souza' },
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  });

  it('POST /api/v1/rooms creates responsible and availability histories', async () => {
    await request(app.getHttpServer() as Server)
      .post('/api/v1/rooms')
      .send({
        name: 'Sala Horizonte',
        capacity: 12,
        responsibleName: 'Ana Souza',
        availability: [{ dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' }],
      })
      .expect(201);

    type RoomCreateInput = {
      data: {
        responsibleHistory: { create: { name: string; validFrom: Date } };
        availabilityHistory: {
          create: { availability: unknown[]; validFrom: Date };
        };
      };
    };
    const createCalls = prismaService.room.create.mock.calls as Array<
      [RoomCreateInput]
    >;
    const createInput = createCalls[0]?.[0];
    expect(createInput?.data.responsibleHistory.create.name).toBe('Ana Souza');
    expect(
      createInput?.data.responsibleHistory.create.validFrom,
    ).toBeInstanceOf(Date);
    expect(createInput?.data.availabilityHistory.create.availability).toEqual([
      { dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' },
    ]);
    expect(
      createInput?.data.availabilityHistory.create.validFrom,
    ).toBeInstanceOf(Date);
  });

  it('PATCH /api/v1/rooms/:id updates a room', async () => {
    const response = await request(app.getHttpServer() as Server)
      .patch('/api/v1/rooms/1')
      .send({ name: 'Sala Aurora' })
      .expect(200);

    expect(response.body).toMatchObject({ id: 1, name: 'Sala Aurora' });
    const updateCalls = transactionClient.room.update.mock.calls as Array<
      [{ where: { id: number }; data: { name: string } }]
    >;
    const updateInput = updateCalls[0]?.[0];
    expect(updateInput).toMatchObject({
      where: { id: 1 },
      data: { name: 'Sala Aurora' },
    });
  });

  it('DELETE /api/v1/rooms/:id deactivates a room', async () => {
    await request(app.getHttpServer() as Server)
      .delete('/api/v1/rooms/1')
      .expect(204);

    expect(prismaService.room.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { active: false },
    });
  });

  it('rejects overlapping availability periods', async () => {
    await request(app.getHttpServer() as Server)
      .post('/api/v1/rooms')
      .send({
        name: 'Sala Horizonte',
        capacity: 12,
        responsibleName: 'Ana Souza',
        availability: [
          { dayOfWeek: 1, opensAt: '08:00', closesAt: '12:00' },
          { dayOfWeek: 1, opensAt: '11:00', closesAt: '18:00' },
        ],
      })
      .expect(400);
  });
});
