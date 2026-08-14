import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { HealthController } from './health.controller';
import { HealthRepository } from './repositories/health.repository';
import { PrismaHealthRepository } from './repositories/prisma-health.repository';
import { HealthService } from './health.service';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    PrismaHealthRepository,
    {
      provide: HealthRepository,
      useExisting: PrismaHealthRepository,
    },
  ],
})
export class HealthModule {}
