import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import {
  AppointmentRecord,
  AppointmentRoomRecord,
  AppointmentsRepository,
  AppointmentVisitorRecord,
  ListAppointmentsInput,
  SaveAppointmentInput,
} from './appointments.repository';

const appointmentInclude = {
  visitor: { include: { priorityType: true } },
  room: true,
} as const;

const blockingStatuses = [1, 2];

@Injectable()
export class PrismaAppointmentsRepository implements AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async runWithAppointmentRecordLock<T>(
    appointmentId: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(191925, ${appointmentId})`;
      return callback();
    });
  }

  async runWithAppointmentLocks<T>(
    input: { roomId: number; visitorId: number },
    callback: () => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(191923, ${input.roomId})`;
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(191924, ${input.visitorId})`;
      return callback();
    });
  }

  async list(
    input: ListAppointmentsInput,
  ): Promise<{ data: AppointmentRecord[]; total: number }> {
    const where = {
      ...(input.includeInactive ? {} : { active: input.active }),
      ...(input.visitorId ? { visitorId: input.visitorId } : {}),
      ...(input.roomId ? { roomId: input.roomId } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.search
        ? {
            OR: [
              {
                visitor: {
                  name: {
                    contains: input.search,
                    mode: 'insensitive' as const,
                  },
                },
              },
              {
                visitor: {
                  document: {
                    contains: input.search
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, ''),
                  },
                },
              },
              {
                room: {
                  name: {
                    contains: input.search,
                    mode: 'insensitive' as const,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        include: appointmentInclude,
        orderBy: { startsAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: number): Promise<AppointmentRecord | null> {
    return this.prisma.appointment.findFirst({
      where: { id, active: true },
      include: appointmentInclude,
    });
  }

  findVisitorById(id: number): Promise<AppointmentVisitorRecord | null> {
    return this.prisma.visitor.findFirst({
      where: { id, active: true },
      include: { priorityType: true },
    });
  }

  findRoomById(id: number): Promise<AppointmentRoomRecord | null> {
    return this.prisma.room.findFirst({ where: { id, active: true } });
  }

  async hasActiveHoliday(date: Date): Promise<boolean> {
    const holiday = await this.prisma.holiday.findFirst({
      where: { date, active: true },
      select: { id: true },
    });
    return Boolean(holiday);
  }

  async countRoomOverlaps(input: {
    roomId: number;
    startsAt: Date;
    endsAt: Date;
    ignoredId?: number;
  }): Promise<number> {
    return this.prisma.appointment.count({
      where: {
        roomId: input.roomId,
        active: true,
        status: { in: blockingStatuses },
        startsAt: { lt: input.endsAt },
        endsAt: { gt: input.startsAt },
        ...(input.ignoredId ? { id: { not: input.ignoredId } } : {}),
      },
    });
  }

  async hasVisitorOverlap(input: {
    visitorId: number;
    startsAt: Date;
    endsAt: Date;
    ignoredId?: number;
  }): Promise<boolean> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        visitorId: input.visitorId,
        active: true,
        status: { in: blockingStatuses },
        startsAt: { lt: input.endsAt },
        endsAt: { gt: input.startsAt },
        ...(input.ignoredId ? { id: { not: input.ignoredId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(appointment);
  }

  create(input: SaveAppointmentInput): Promise<AppointmentRecord> {
    return this.prisma.appointment.create({
      data: input,
      include: appointmentInclude,
    });
  }

  update(id: number, input: SaveAppointmentInput): Promise<AppointmentRecord> {
    return this.prisma.appointment.update({
      where: { id },
      data: input,
      include: appointmentInclude,
    });
  }

  updateStatus(id: number, status: number): Promise<AppointmentRecord> {
    return this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: appointmentInclude,
    });
  }

  async deactivate(id: number): Promise<void> {
    await this.prisma.appointment.update({
      where: { id },
      data: { active: false, status: 3 },
    });
  }
}
