import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthRepository } from './repositories/health.repository';

@Injectable()
export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  async check(): Promise<HealthResponseDto> {
    try {
      await this.healthRepository.pingDatabase();

      return {
        message: 'Banco de dados conectado.',
      };
    } catch {
      throw new ServiceUnavailableException({
        code: 'DATABASE_UNAVAILABLE',
        message: 'Banco de dados não conectado.',
      });
    }
  }
}
