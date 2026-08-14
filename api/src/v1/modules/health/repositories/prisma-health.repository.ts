import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { HealthRepository } from './health.repository';

// Adapta a infraestrutura de banco ao contrato de health, mantendo o service independente do Prisma.
@Injectable()
export class PrismaHealthRepository implements HealthRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  pingDatabase(): Promise<void> {
    return this.databaseService.ping();
  }
}
