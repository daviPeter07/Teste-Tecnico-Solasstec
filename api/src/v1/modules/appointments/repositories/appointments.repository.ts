export interface AppointmentVisitorRecord {
  id: number;
  name: string;
  documentType: string;
  document: string;
  active: boolean;
  priorityType: { description: string };
}

export interface AppointmentRoomRecord {
  id: number;
  name: string;
  capacity: number;
  availability: unknown;
  active: boolean;
}

export interface AppointmentRecord {
  id: number;
  visitorId: number;
  roomId: number;
  startsAt: Date;
  endsAt: Date;
  status: number;
  active: boolean;
  createdAt: Date;
  visitor: AppointmentVisitorRecord;
  room: AppointmentRoomRecord;
}

export interface ListAppointmentsInput {
  page: number;
  limit: number;
  search?: string;
  visitorId?: number;
  roomId?: number;
  status?: number;
  startsFrom?: string;
  startsTo?: string;
  active: boolean;
  includeInactive?: boolean;
}

export interface SaveAppointmentInput {
  visitorId: number;
  roomId: number;
  startsAt: Date;
  endsAt: Date;
}

export abstract class AppointmentsRepository {
  abstract runWithAppointmentRecordLock<T>(
    appointmentId: number,
    callback: () => Promise<T>,
  ): Promise<T>;
  abstract runWithAppointmentLocks<T>(
    input: { roomId: number; visitorId: number },
    callback: () => Promise<T>,
  ): Promise<T>;
  abstract list(
    input: ListAppointmentsInput,
  ): Promise<{ data: AppointmentRecord[]; total: number }>;
  abstract findById(id: number): Promise<AppointmentRecord | null>;
  abstract findVisitorById(
    id: number,
  ): Promise<AppointmentVisitorRecord | null>;
  abstract findRoomById(id: number): Promise<AppointmentRoomRecord | null>;
  abstract hasActiveHoliday(date: Date): Promise<boolean>;
  abstract countRoomOverlaps(input: {
    roomId: number;
    startsAt: Date;
    endsAt: Date;
    ignoredId?: number;
  }): Promise<number>;
  abstract hasVisitorOverlap(input: {
    visitorId: number;
    startsAt: Date;
    endsAt: Date;
    ignoredId?: number;
  }): Promise<boolean>;
  abstract create(input: SaveAppointmentInput): Promise<AppointmentRecord>;
  abstract update(
    id: number,
    input: SaveAppointmentInput,
  ): Promise<AppointmentRecord>;
  abstract updateStatus(id: number, status: number): Promise<AppointmentRecord>;
  abstract deactivate(id: number): Promise<void>;
  abstract deleteInactive(ids?: number[]): Promise<number>;
}
