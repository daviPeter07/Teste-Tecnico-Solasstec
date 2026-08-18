import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { PrismaRoomsRepository } from './repositories/prisma-rooms.repository';
import { RoomsRepository } from './repositories/rooms.repository';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [PrismaModule],
  controllers: [RoomsController],
  providers: [
    RoomsService,
    PrismaRoomsRepository,
    { provide: RoomsRepository, useExisting: PrismaRoomsRepository },
  ],
})
export class RoomsModule {}
