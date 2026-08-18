import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { setupApplication } from '@/config/application.setup';
import { PrismaService } from '@/database/prisma/prisma.service';

describe('Visitor and room registrations (e2e)', () => {
  let app: INestApplication;
  const priorityType = {
    id: 2,
    description: 'Visitante com idade igual ou superior a 60 anos.',
    priorityLevel: 1,
    active: true,
    createdAt: new Date('2026-08-15T12:00:00.000Z'),
  };
  const prismaService = {
    visitor: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    priorityType: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    room: {
      create: jest.fn(),
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

  beforeEach(() => jest.clearAllMocks());

  it('POST /api/v1/visitors normalizes document and returns priority', async () => {
    prismaService.visitor.findFirst.mockResolvedValue(null);
    prismaService.priorityType.findUnique.mockResolvedValue(priorityType);
    prismaService.visitor.create.mockResolvedValue({
      id: 1,
      name: 'Maria da Silva',
      documentType: 'CPF',
      document: '52998224725',
      birthDate: new Date('1960-01-01T00:00:00.000Z'),
      hasDisability: false,
      photo: null,
      active: true,
      createdAt: new Date('2026-08-15T12:00:00.000Z'),
      priorityType,
    });

    const response = await request(app.getHttpServer() as Server)
      .post('/api/v1/visitors')
      .send({
        name: 'Maria da Silva',
        documentType: 'CPF',
        document: '529.982.247-25',
        birthDate: '1960-01-01',
        hasDisability: false,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      birthDate: '1960-01-01',
      document: '52998224725',
      isPriority: true,
      priorityType: { priorityLevel: 1 },
    });
    const responseBody = response.body as { priorityType: unknown };
    expect(responseBody.priorityType).toEqual({
      id: 2,
      description: priorityType.description,
      priorityLevel: 1,
    });
  });

  it('rejects whitespace-only visitor names', async () => {
    await request(app.getHttpServer() as Server)
      .post('/api/v1/visitors')
      .send({
        name: '   ',
        documentType: 'CPF',
        document: '529.982.247-25',
        birthDate: '1990-01-01',
        hasDisability: false,
      })
      .expect(400);
  });

  it('POST /api/v1/rooms creates responsible and availability histories', async () => {
    prismaService.room.create.mockResolvedValue({
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
    });

    await request(app.getHttpServer() as Server)
      .post('/api/v1/rooms')
      .send({
        name: 'Sala Horizonte',
        capacity: 12,
        responsibleName: 'Ana Souza',
        availability: [{ dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' }],
      })
      .expect(201);

    const createCalls = prismaService.room.create.mock.calls as Array<
      [
        {
          data: {
            responsibleHistory: { create: { name: string } };
            availabilityHistory: { create: { availability: unknown[] } };
          };
        },
      ]
    >;
    const createInput = createCalls[0][0];
    expect(createInput.data.responsibleHistory.create.name).toBe('Ana Souza');
    expect(
      createInput.data.availabilityHistory.create.availability,
    ).toHaveLength(1);
  });
});
