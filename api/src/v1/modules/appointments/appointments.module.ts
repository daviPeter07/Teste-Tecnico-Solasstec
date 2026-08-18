import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { PrismaAppointmentsRepository } from './repositories/prisma-appointments.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    { provide: AppointmentsRepository, useClass: PrismaAppointmentsRepository },
  ],
})
export class AppointmentsModule {}
