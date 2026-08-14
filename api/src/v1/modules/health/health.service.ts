import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthRepository } from './repositories/health.repository';

@Injectable()
export class HealthService {
  constructor(
    private readonly healthRepository: HealthRepository,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<HealthResponseDto> {
    const startedAt = Date.now();

    try {
      await this.healthRepository.pingDatabase();

      return {
        status: 'ok',
        service: this.configService.getOrThrow<string>('app.name'),
        timestamp: new Date().toISOString(),
        uptimeSeconds: Number(process.uptime().toFixed(2)),
        checks: {
          database: {
            status: 'up',
            latencyMs: Date.now() - startedAt,
          },
        },
      };
    } catch {
      throw new ServiceUnavailableException({
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is unavailable.',
        details: {
          database: {
            status: 'down',
            latencyMs: Date.now() - startedAt,
          },
        },
      });
    }
  }
}
