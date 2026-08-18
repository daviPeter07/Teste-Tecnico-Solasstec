import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import {
  HolidaysRepository,
  HolidayRecord,
  ListHolidaysInput,
  SaveHolidayInput,
} from './holidays.repository';

function parseSearchDate(search?: string): Date | undefined {
  if (!search || !/^\d{4}-\d{2}-\d{2}$/.test(search)) return undefined;
  const date = new Date(`${search}T00:00:00.000Z`);
  return date.toISOString().slice(0, 10) === search ? date : undefined;
}

@Injectable()
export class PrismaHolidaysRepository implements HolidaysRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    input: ListHolidaysInput,
  ): Promise<{ data: HolidayRecord[]; total: number }> {
    const searchDate = parseSearchDate(input.search);
    const where = {
      active: input.active,
      ...(input.search
        ? {
            OR: [
              {
                description: {
                  contains: input.search,
                  mode: 'insensitive' as const,
                },
              },
              ...(searchDate ? [{ date: searchDate }] : []),
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.holiday.findMany({
        where,
        orderBy: { date: 'asc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.holiday.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: number): Promise<HolidayRecord | null> {
    return this.prisma.holiday.findFirst({ where: { id, active: true } });
  }

  findByDate(date: Date): Promise<HolidayRecord | null> {
    return this.prisma.holiday.findUnique({ where: { date } });
  }

  create(input: SaveHolidayInput): Promise<HolidayRecord> {
    return this.prisma.holiday.create({
      data: {
        date: input.date,
        description: input.description,
        type: input.type ?? null,
      },
    });
  }

  update(id: number, input: SaveHolidayInput): Promise<HolidayRecord> {
    return this.prisma.holiday.update({
      where: { id },
      data: {
        date: input.date,
        description: input.description,
        type: input.type ?? null,
      },
    });
  }

  async deactivate(id: number): Promise<void> {
    await this.prisma.holiday.update({
      where: { id },
      data: { active: false },
    });
  }
}
