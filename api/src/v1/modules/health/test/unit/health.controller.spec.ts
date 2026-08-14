import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../health.controller';
import { HealthService } from '../../health.service';

describe('HealthController', () => {
  let controller: HealthController;
  const healthResponse = {
    message: 'Banco de dados conectado.',
  };
  const healthService = {
    check: jest.fn().mockResolvedValue(healthResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: healthService,
        },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('delegates the health check to the service', async () => {
    await expect(controller.check()).resolves.toEqual(healthResponse);
    expect(healthService.check).toHaveBeenCalledTimes(1);
  });
});
