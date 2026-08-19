import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { PrismaService } from '@/database/prisma/prisma.service';
import {
  CreateRoomInput,
  ListRoomsInput,
  RoomHistoryRecord,
  RoomRecord,
  RoomsRepository,
} from './rooms.repository';

const roomInclude = {
  responsibleHistory: {
    where: { active: true, validUntil: null },
    orderBy: { validFrom: 'desc' as const },
    take: 1,
  },
} as const;

const roomUpdateInclude = {
  ...roomInclude,
  availabilityHistory: {
    where: { active: true, validUntil: null },
    orderBy: { validFrom: 'desc' as const },
    take: 1,
  },
} as const;

@Injectable()
export class PrismaRoomsRepository implements RoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    input: ListRoomsInput,
  ): Promise<{ data: RoomRecord[]; total: number }> {
    const where = {
      active: input.active,
      ...(input.search
        ? {
            OR: [
              {
                name: { contains: input.search, mode: 'insensitive' as const },
              },
              {
                responsibleHistory: {
                  some: {
                    name: {
                      contains: input.search,
                      mode: 'insensitive' as const,
                    },
                    active: true,
                    validUntil: null,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.room.findMany({
        where,
        include: roomInclude,
        orderBy: { name: 'asc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.room.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: number): Promise<RoomRecord | null> {
    return this.prisma.room.findFirst({
      where: { id, active: true },
      include: roomInclude,
    });
  }

  findByName(name: string): Promise<RoomRecord | null> {
    return this.prisma.room.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, active: true },
      include: roomInclude,
    });
  }

  findHistory(id: number): Promise<RoomHistoryRecord | null> {
    return this.prisma.room.findFirst({
      where: { id, active: true },
      select: {
        id: true,
        responsibleHistory: { orderBy: { validFrom: 'desc' } },
        availabilityHistory: { orderBy: { validFrom: 'desc' } },
      },
    });
  }

  create(input: CreateRoomInput): Promise<RoomRecord> {
    const now = new Date();
    const availability = input.availability as unknown as Prisma.InputJsonValue;

    return this.prisma.room.create({
      data: {
        name: input.name,
        capacity: input.capacity,
        availability,
        responsibleHistory: {
          create: { name: input.responsibleName, validFrom: now },
        },
        availabilityHistory: {
          create: { availability, validFrom: now },
        },
      },
      include: roomInclude,
    });
  }

  async update(id: number, input: CreateRoomInput): Promise<RoomRecord> {
    const now = new Date();
    const availability = input.availability as unknown as Prisma.InputJsonValue;

    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.room.findUnique({
        where: { id },
        include: roomUpdateInclude,
      });

      if (!existing || !existing.active) {
        throw new Error('ROOM_NOT_FOUND');
      }

      await transaction.room.update({
        where: { id },
        data: {
          name: input.name,
          capacity: input.capacity,
          availability,
        },
      });

      const currentResponsible = existing.responsibleHistory[0];
      if (currentResponsible?.name !== input.responsibleName) {
        if (currentResponsible) {
          await transaction.roomResponsible.update({
            where: { id: currentResponsible.id },
            data: { active: false, validUntil: now },
          });
        }

        await transaction.roomResponsible.create({
          data: {
            roomId: id,
            name: input.responsibleName,
            validFrom: now,
          },
        });
      }

      if (
        JSON.stringify(existing.availability) !==
        JSON.stringify(input.availability)
      ) {
        const currentAvailability = existing.availabilityHistory[0];
        if (currentAvailability) {
          await transaction.roomAvailabilityHistory.update({
            where: { id: currentAvailability.id },
            data: { active: false, validUntil: now },
          });
        }

        await transaction.roomAvailabilityHistory.create({
          data: {
            roomId: id,
            availability,
            validFrom: now,
          },
        });
      }

      return transaction.room.findUniqueOrThrow({
        where: { id },
        include: roomInclude,
      });
    });
  }

  async deactivate(id: number): Promise<void> {
    await this.prisma.room.update({
      where: { id },
      data: { active: false },
    });
  }

  async deleteInactive(ids?: number[]): Promise<number> {
    const rooms = await this.prisma.room.findMany({
      where: {
        active: false,
        ...(ids?.length ? { id: { in: ids } } : {}),
      },
      select: { id: true },
    });
    const roomIds = rooms.map((room) => room.id);
    if (roomIds.length === 0) return 0;

    return this.prisma.$transaction(async (transaction) => {
      await transaction.roomResponsible.deleteMany({
        where: { roomId: { in: roomIds } },
      });
      await transaction.roomAvailabilityHistory.deleteMany({
        where: { roomId: { in: roomIds } },
      });
      const result = await transaction.room.deleteMany({
        where: { id: { in: roomIds }, active: false },
      });
      return result.count;
    });
  }
}
