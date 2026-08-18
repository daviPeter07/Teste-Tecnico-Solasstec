import { Injectable } from '@nestjs/common';
import { RoomNotFoundException } from '@/common/exceptions';
import { CreateRoomDto } from './dto/create-room.dto';
import { ListRoomsQueryDto } from './dto/list-rooms-query.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import {
  RoomHistoryResponseDto,
  RoomListResponseDto,
  RoomResponseDto,
} from './dto/room-response.dto';
import {
  RoomHistoryRecord,
  RoomRecord,
  RoomsRepository,
} from './repositories/rooms.repository';
import { normalizeAvailability } from './utils/normalize-availability';

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async list(query: ListRoomsQueryDto): Promise<RoomListResponseDto> {
    const result = await this.roomsRepository.list(query);
    return {
      data: result.data.map((room) => this.toResponse(room)),
      meta: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  async findById(id: number): Promise<RoomResponseDto> {
    const room = await this.roomsRepository.findById(id);
    if (!room) this.throwNotFound();
    return this.toResponse(room);
  }

  async history(id: number): Promise<RoomHistoryResponseDto> {
    const history = await this.roomsRepository.findHistory(id);
    if (!history) this.throwNotFound();
    return this.toHistoryResponse(history);
  }

  async create(input: CreateRoomDto): Promise<RoomResponseDto> {
    const availability = normalizeAvailability(input.availability);
    const room = await this.roomsRepository.create({
      name: input.name.trim(),
      capacity: input.capacity,
      responsibleName: input.responsibleName.trim(),
      availability,
    });
    return this.toResponse(room);
  }

  async update(id: number, input: UpdateRoomDto): Promise<RoomResponseDto> {
    const existing = await this.roomsRepository.findById(id);
    if (!existing) this.throwNotFound();

    const merged = {
      name: input.name ?? existing.name,
      capacity: input.capacity ?? existing.capacity,
      responsibleName:
        input.responsibleName ?? existing.responsibleHistory[0]?.name ?? '',
      availability: normalizeAvailability(
        input.availability ??
          (existing.availability as CreateRoomDto['availability']),
      ),
    };

    const room = await this.roomsRepository.update(id, {
      name: merged.name.trim(),
      capacity: merged.capacity,
      responsibleName: merged.responsibleName.trim(),
      availability: merged.availability,
    });
    return this.toResponse(room);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.roomsRepository.findById(id);
    if (!existing) this.throwNotFound();
    await this.roomsRepository.deactivate(id);
  }

  private toResponse(room: RoomRecord): RoomResponseDto {
    const currentResponsible = room.responsibleHistory[0];
    return {
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      availability: room.availability as RoomResponseDto['availability'],
      currentResponsible: currentResponsible
        ? {
            id: currentResponsible.id,
            name: currentResponsible.name,
            validFrom: currentResponsible.validFrom.toISOString(),
          }
        : null,
      active: room.active,
      createdAt: room.createdAt.toISOString(),
    };
  }

  private toHistoryResponse(
    history: RoomHistoryRecord,
  ): RoomHistoryResponseDto {
    return {
      roomId: history.id,
      responsibles: history.responsibleHistory.map((responsible) => ({
        id: responsible.id,
        name: responsible.name,
        validFrom: responsible.validFrom.toISOString(),
        validUntil: responsible.validUntil?.toISOString() ?? null,
        active: responsible.active,
      })),
      availability: history.availabilityHistory.map((period) => ({
        id: period.id,
        availability: period.availability as RoomResponseDto['availability'],
        validFrom: period.validFrom.toISOString(),
        validUntil: period.validUntil?.toISOString() ?? null,
        active: period.active,
      })),
    };
  }

  private throwNotFound(): never {
    throw new RoomNotFoundException();
  }
}
