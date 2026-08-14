import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@/database/database.service';
import { PrismaHealthRepository } from '../../repositories/prisma-health.repository';

describe('PrismaHealthRepository', () => {
  let repository: PrismaHealthRepository;
  const databaseService = {
    ping: jest.fn<Promise<void>, []>(),
  };

  beforeEach(async () => {
    databaseService.ping.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaHealthRepository,
        {
          provide: DatabaseService,
          useValue: databaseService,
        },
      ],
    }).compile();

    repository = module.get(PrismaHealthRepository);
  });

  it('delegates the database ping to the database service', async () => {
    databaseService.ping.mockResolvedValue();

    await expect(repository.pingDatabase()).resolves.toBeUndefined();
    expect(databaseService.ping).toHaveBeenCalledTimes(1);
  });
});
