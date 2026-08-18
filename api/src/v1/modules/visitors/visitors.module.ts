import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { PrismaVisitorsRepository } from './repositories/prisma-visitors.repository';
import { VisitorsRepository } from './repositories/visitors.repository';
import { VisitorPriorityService } from './visitor-priority.service';
import { VisitorsController } from './visitors.controller';
import { VisitorsService } from './visitors.service';

@Module({
  imports: [PrismaModule],
  controllers: [VisitorsController],
  providers: [
    VisitorsService,
    VisitorPriorityService,
    PrismaVisitorsRepository,
    { provide: VisitorsRepository, useExisting: PrismaVisitorsRepository },
  ],
})
export class VisitorsModule {}
