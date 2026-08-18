import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';
import { HolidaysRepository } from './repositories/holidays.repository';
import { PrismaHolidaysRepository } from './repositories/prisma-holidays.repository';

@Module({
  imports: [PrismaModule],
  controllers: [HolidaysController],
  providers: [
    HolidaysService,
    PrismaHolidaysRepository,
    { provide: HolidaysRepository, useExisting: PrismaHolidaysRepository },
  ],
})
export class HolidaysModule {}
