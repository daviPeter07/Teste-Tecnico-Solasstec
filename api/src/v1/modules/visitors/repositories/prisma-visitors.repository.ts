import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import {
  CreateVisitorInput,
  ListVisitorsInput,
  VisitorRecord,
  VisitorsRepository,
} from './visitors.repository';

const visitorInclude = { priorityType: true } as const;

@Injectable()
export class PrismaVisitorsRepository implements VisitorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    input: ListVisitorsInput,
  ): Promise<{ data: VisitorRecord[]; total: number }> {
    const where = {
      active: input.active,
      ...(input.search
        ? {
            OR: [
              {
                name: { contains: input.search, mode: 'insensitive' as const },
              },
              {
                document: {
                  contains: input.search
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, ''),
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.visitor.findMany({
        where,
        include: visitorInclude,
        orderBy: { name: 'asc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.visitor.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: number): Promise<VisitorRecord | null> {
    return this.prisma.visitor.findFirst({
      where: { id, active: true },
      include: visitorInclude,
    });
  }

  findByDocument(document: string): Promise<VisitorRecord | null> {
    return this.prisma.visitor.findFirst({
      where: { document, active: true },
      include: visitorInclude,
    });
  }

  findPriorityByLevel(level: number) {
    return this.prisma.priorityType.findUnique({
      where: { priorityLevel: level },
    });
  }

  findPriorities() {
    return this.prisma.priorityType.findMany({
      orderBy: { priorityLevel: 'asc' },
    });
  }

  async updatePriority(
    visitorId: number,
    priorityTypeId: number,
  ): Promise<void> {
    await this.prisma.visitor.update({
      where: { id: visitorId },
      data: { priorityTypeId },
    });
  }

  create(input: CreateVisitorInput): Promise<VisitorRecord> {
    return this.prisma.visitor.create({
      data: input,
      include: visitorInclude,
    });
  }

  update(id: number, input: CreateVisitorInput): Promise<VisitorRecord> {
    return this.prisma.visitor.update({
      where: { id },
      data: input,
      include: visitorInclude,
    });
  }

  async deactivate(id: number): Promise<void> {
    await this.prisma.visitor.update({
      where: { id },
      data: { active: false },
    });
  }

  async deleteInactive(ids?: number[]): Promise<number> {
    const result = await this.prisma.visitor.deleteMany({
      where: {
        active: false,
        ...(ids?.length ? { id: { in: ids } } : {}),
      },
    });
    return result.count;
  }
}
