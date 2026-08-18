import { Test, TestingModule } from '@nestjs/testing';
import { SystemUnavailableException } from '@/common/exceptions';
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

  it('returns a message when system is healthy', async () => {
    healthRepository.pingDatabase.mockResolvedValue();

    await expect(service.check()).resolves.toEqual({
      message: 'Sistema operando normalmente.',
    });
  });

  it('throws a service unavailable error when database is down', async () => {
    healthRepository.pingDatabase.mockRejectedValue(
      new Error('connection refused'),
    );

    await expect(service.check()).rejects.toBeInstanceOf(
      SystemUnavailableException,
    );
  });
});
