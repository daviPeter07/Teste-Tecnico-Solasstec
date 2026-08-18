import { RoomAvailabilityDto } from '../dto/room-availability.dto';

export interface RoomResponsibleRecord {
  id: number;
  name: string;
  validFrom: Date;
  validUntil: Date | null;
  active: boolean;
}

export interface RoomAvailabilityHistoryRecord {
  id: number;
  availability: unknown;
  validFrom: Date;
  validUntil: Date | null;
  active: boolean;
}

export interface RoomRecord {
  id: number;
  name: string;
  capacity: number;
  availability: unknown;
  active: boolean;
  createdAt: Date;
  responsibleHistory: RoomResponsibleRecord[];
}

export interface RoomHistoryRecord {
  id: number;
  responsibleHistory: RoomResponsibleRecord[];
  availabilityHistory: RoomAvailabilityHistoryRecord[];
}

export interface ListRoomsInput {
  page: number;
  limit: number;
  search?: string;
  active: boolean;
}

export interface CreateRoomInput {
  name: string;
  capacity: number;
  responsibleName: string;
  availability: RoomAvailabilityDto[];
}

export abstract class RoomsRepository {
  abstract list(
    input: ListRoomsInput,
  ): Promise<{ data: RoomRecord[]; total: number }>;
  abstract findById(id: number): Promise<RoomRecord | null>;
  abstract findHistory(id: number): Promise<RoomHistoryRecord | null>;
  abstract create(input: CreateRoomInput): Promise<RoomRecord>;
  abstract update(id: number, input: CreateRoomInput): Promise<RoomRecord>;
  abstract deactivate(id: number): Promise<void>;
}
