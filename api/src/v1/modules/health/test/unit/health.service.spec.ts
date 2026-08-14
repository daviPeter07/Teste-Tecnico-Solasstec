import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../../health.service';
import { HealthRepository } from '../../repositories/health.repository';

describe('HealthService', () => {
  let service: HealthService;
  let healthRepository: { pingDatabase: jest.Mock<Promise<void>, []> };

  beforeEach(async () => {
    healthRepository = {
      pingDatabase: jest.fn<Promise<void>, []>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: HealthRepository,
          useValue: healthRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('solasstec-portaria-api'),
          },
        },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  it('returns the API and database status', async () => {
    healthRepository.pingDatabase.mockResolvedValue();

    await expect(service.check()).resolves.toMatchObject({
      status: 'ok',
      service: 'solasstec-portaria-api',
      checks: {
        database: { status: 'up' },
      },
    });
  });

  it('throws a service unavailable error when the database is down', async () => {
    healthRepository.pingDatabase.mockRejectedValue(
      new Error('connection refused'),
    );

    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
