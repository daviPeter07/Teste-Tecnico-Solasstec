import { Injectable } from '@nestjs/common';
import { SystemUnavailableException } from '@/common/exceptions';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthRepository } from './repositories/health.repository';

@Injectable()
export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  async check(): Promise<HealthResponseDto> {
    try {
      await this.healthRepository.pingDatabase();

      return {
        message: 'Sistema operando normalmente.',
      };
    } catch {
      throw new SystemUnavailableException();
    }
  }
}
