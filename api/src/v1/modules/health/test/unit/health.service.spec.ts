import { ServiceUnavailableException } from '@nestjs/common';
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
      ],
    }).compile();

    service = module.get(HealthService);
  });

  it('returns a message when the database is connected', async () => {
    healthRepository.pingDatabase.mockResolvedValue();

    await expect(service.check()).resolves.toEqual({
      message: 'Banco de dados conectado.',
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
