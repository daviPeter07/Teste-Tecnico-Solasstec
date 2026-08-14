import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from '../database.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    {
      provide: DatabaseService,
      useExisting: PrismaService,
    },
  ],
  exports: [DatabaseService, PrismaService],
})
export class PrismaModule {}
