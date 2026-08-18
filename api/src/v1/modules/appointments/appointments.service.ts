import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { DeleteInactiveRecordsDto } from '@/common/dto/delete-inactive-records.dto';
import {
  AppointmentNotFoundException,
  AppointmentUnavailableException,
  InvalidAppointmentPeriodException,
  RoomNotFoundException,
  VisitorNotFoundException,
} from '@/common/exceptions';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import {
  AppointmentListResponseDto,
  AppointmentResponseDto,
} from './dto/appointment-response.dto';
import { AppointmentSlotsResponseDto } from './dto/appointment-slot-response.dto';
import { ListAppointmentSlotsQueryDto } from './dto/list-appointment-slots-query.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import {
  AppointmentRecord,
  AppointmentRoomRecord,
  AppointmentsRepository,
} from './repositories/appointments.repository';

const STATUS_LABELS: Record<number, string> = {
  1: 'Pendente',
  2: 'Confirmado',
  3: 'Cancelado',
  4: 'Finalizado',
};

const BUSINESS_OFFSET = '-04:00';
const DEFAULT_APPOINTMENT_DURATION_MINUTES = 60;
const MAX_SUGGESTION_DAYS = 60;
const SUGGESTION_STEP_MINUTES = 15;
const SLOT_STEP_MINUTES = DEFAULT_APPOINTMENT_DURATION_MINUTES;

interface AppointmentPeriod {
  date: string;
  startsAt: string;
  endsAt: string;
  startsAtUtc: Date;
  endsAtUtc: Date;
}

interface RoomAvailabilityPeriod {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  async list(
    query: ListAppointmentsQueryDto,
  ): Promise<AppointmentListResponseDto> {
    const result = await this.appointmentsRepository.list(query);
    return {
      data: result.data.map((appointment) => this.toResponse(appointment)),
      meta: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  async findById(id: number): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsRepository.findById(id);
    if (!appointment) this.throwNotFound();
    return this.toResponse(appointment);
  }

  async slots(
    query: ListAppointmentSlotsQueryDto,
  ): Promise<AppointmentSlotsResponseDto> {
    const room = await this.appointmentsRepository.findRoomById(query.roomId);
    if (!room) throw new RoomNotFoundException();
    if (query.visitorId) {
      const visitor = await this.appointmentsRepository.findVisitorById(
        query.visitorId,
      );
      if (!visitor) throw new VisitorNotFoundException();
    }

    const day = this.parseDateOnly(query.date);
    const isHoliday = await this.appointmentsRepository.hasActiveHoliday(day);
    const suggestion = isHoliday
      ? await this.findFirstAvailableSlot({
          date: query.date,
          room,
          visitorId: query.visitorId,
          ignoredId: query.appointmentId,
        })
      : null;
    const availability = this.normalizeAvailability(room.availability).filter(
      (period) => period.dayOfWeek === day.getUTCDay(),
    );
    const slots = [];

    for (const period of availability) {
      const opens = this.timeToMinutes(period.opensAt);
      const closes = this.timeToMinutes(period.closesAt);
      for (
        let minutes = opens;
        minutes + DEFAULT_APPOINTMENT_DURATION_MINUTES <= closes;
        minutes += SLOT_STEP_MINUTES
      ) {
        const startsAt = this.minutesToTime(minutes);
        const endsAt = this.minutesToTime(
          minutes + DEFAULT_APPOINTMENT_DURATION_MINUTES,
        );
        const appointmentPeriod = this.parsePeriod(
          query.date,
          startsAt,
          endsAt,
        );
        const occupancy = await this.appointmentsRepository.countRoomOverlaps({
          roomId: room.id,
          startsAt: appointmentPeriod.startsAtUtc,
          endsAt: appointmentPeriod.endsAtUtc,
          ignoredId: query.appointmentId,
        });
        const visitorBusy = query.visitorId
          ? await this.appointmentsRepository.hasVisitorOverlap({
              visitorId: query.visitorId,
              startsAt: appointmentPeriod.startsAtUtc,
              endsAt: appointmentPeriod.endsAtUtc,
              ignoredId: query.appointmentId,
            })
          : false;
        const available =
          !isHoliday && !visitorBusy && occupancy < room.capacity;
        slots.push({
          startsAt,
          endsAt,
          available,
          occupancy,
          capacity: room.capacity,
          reason: this.getSlotReason({
            isHoliday,
            visitorBusy,
            occupancy,
            room,
          }),
        });
      }
    }

    return { date: query.date, slots, suggestion };
  }

  async create(input: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const period = this.parsePeriod(input.date, input.startsAt, input.endsAt);
    return this.appointmentsRepository.runWithAppointmentLocks(
      {
        roomId: input.roomId,
        visitorId: input.visitorId,
      },
      async () => {
        const room = await this.validateBaseEntities(
          input.visitorId,
          input.roomId,
        );
        await this.ensureAvailable({
          period,
          room,
          visitorId: input.visitorId,
        });

        const appointment = await this.appointmentsRepository.create({
          visitorId: input.visitorId,
          roomId: input.roomId,
          startsAt: period.startsAtUtc,
          endsAt: period.endsAtUtc,
        });
        return this.toResponse(appointment);
      },
    );
  }

  async update(
    id: number,
    input: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsRepository.runWithAppointmentRecordLock(
      id,
      async () => {
        const existing = await this.appointmentsRepository.findById(id);
        if (!existing) this.throwNotFound();

        const current = this.toBusinessPeriod(
          existing.startsAt,
          existing.endsAt,
        );
        const visitorId = input.visitorId ?? existing.visitorId;
        const roomId = input.roomId ?? existing.roomId;
        const period = this.parsePeriod(
          input.date ?? current.date,
          input.startsAt ?? current.startsAt,
          input.endsAt ?? (input.startsAt ? undefined : current.endsAt),
        );
        return this.appointmentsRepository.runWithAppointmentLocks(
          {
            roomId,
            visitorId,
          },
          async () => {
            const room = await this.validateBaseEntities(visitorId, roomId);
            await this.ensureAvailable({
              period,
              room,
              visitorId,
              ignoredId: id,
            });

            const appointment = await this.appointmentsRepository.update(id, {
              visitorId,
              roomId,
              startsAt: period.startsAtUtc,
              endsAt: period.endsAtUtc,
            });
            return this.toResponse(appointment);
          },
        );
      },
    );
  }

  async updateStatus(
    id: number,
    input: UpdateAppointmentStatusDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsRepository.runWithAppointmentRecordLock(
      id,
      async () => {
        const existing = await this.appointmentsRepository.findById(id);
        if (!existing) this.throwNotFound();
        if (input.status === 1 || input.status === 2) {
          return this.appointmentsRepository.runWithAppointmentLocks(
            {
              roomId: existing.roomId,
              visitorId: existing.visitorId,
            },
            async () => {
              const period = this.toBusinessPeriod(
                existing.startsAt,
                existing.endsAt,
              );
              const room = await this.validateBaseEntities(
                existing.visitorId,
                existing.roomId,
              );
              await this.ensureAvailable({
                period: {
                  ...period,
                  startsAtUtc: existing.startsAt,
                  endsAtUtc: existing.endsAt,
                },
                room,
                visitorId: existing.visitorId,
                ignoredId: id,
              });

              const appointment =
                await this.appointmentsRepository.updateStatus(
                  id,
                  input.status,
                );
              return this.toResponse(appointment);
            },
          );
        }

        const appointment = await this.appointmentsRepository.updateStatus(
          id,
          input.status,
        );
        return this.toResponse(appointment);
      },
    );
  }

  async remove(id: number): Promise<void> {
    const existing = await this.appointmentsRepository.findById(id);
    if (!existing) this.throwNotFound();
    await this.appointmentsRepository.deactivate(id);
  }

  async deleteInactive(input?: DeleteInactiveRecordsDto): Promise<void> {
    try {
      await this.appointmentsRepository.deleteInactive(input?.ids);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Não foi possível excluir definitivamente agendamentos com histórico vinculado.',
        );
      }
      throw error;
    }
  }

  private async validateBaseEntities(
    visitorId: number,
    roomId: number,
  ): Promise<AppointmentRoomRecord> {
    const [visitor, room] = await Promise.all([
      this.appointmentsRepository.findVisitorById(visitorId),
      this.appointmentsRepository.findRoomById(roomId),
    ]);
    if (!visitor) throw new VisitorNotFoundException();
    if (!room) throw new RoomNotFoundException();
    return room;
  }

  private async ensureAvailable(input: {
    period: AppointmentPeriod;
    room: AppointmentRoomRecord;
    visitorId: number;
    ignoredId?: number;
  }): Promise<void> {
    const availability = this.normalizeAvailability(input.room.availability);
    const invalidMessage = await this.getInvalidReason({
      ...input,
      availability,
    });
    if (!invalidMessage) return;

    const suggestion = await this.findSuggestion({
      ...input,
      availability,
    });
    throw new AppointmentUnavailableException(invalidMessage, suggestion);
  }

  private async getInvalidReason(input: {
    period: AppointmentPeriod;
    room: AppointmentRoomRecord;
    availability: RoomAvailabilityPeriod[];
    visitorId: number;
    ignoredId?: number;
  }): Promise<string | null> {
    const dateUtc = new Date(`${input.period.date}T00:00:00.000Z`);
    if (await this.appointmentsRepository.hasActiveHoliday(dateUtc)) {
      return 'A data selecionada é um feriado.';
    }

    const fitsSchedule = this.fitsRoomSchedule(
      input.period,
      input.availability,
    );
    if (!fitsSchedule) {
      return 'A sala não funciona no período solicitado.';
    }

    const hasVisitorOverlap =
      await this.appointmentsRepository.hasVisitorOverlap({
        visitorId: input.visitorId,
        startsAt: input.period.startsAtUtc,
        endsAt: input.period.endsAtUtc,
        ignoredId: input.ignoredId,
      });
    if (hasVisitorOverlap) {
      return 'O visitante já possui agendamento neste horário.';
    }

    const roomOverlaps = await this.appointmentsRepository.countRoomOverlaps({
      roomId: input.room.id,
      startsAt: input.period.startsAtUtc,
      endsAt: input.period.endsAtUtc,
      ignoredId: input.ignoredId,
    });
    if (roomOverlaps >= input.room.capacity) {
      return 'A sala atingiu a capacidade no período solicitado.';
    }

    return null;
  }

  private async findSuggestion(input: {
    period: AppointmentPeriod;
    room: AppointmentRoomRecord;
    availability: RoomAvailabilityPeriod[];
    visitorId: number;
    ignoredId?: number;
  }): Promise<{ startsAt: string; endsAt: string } | null> {
    const duration =
      input.period.endsAtUtc.getTime() - input.period.startsAtUtc.getTime();
    const startDay = new Date(`${input.period.date}T00:00:00.000Z`);
    const requestedMinutes = this.timeToMinutes(input.period.startsAt);

    for (let dayOffset = 0; dayOffset <= MAX_SUGGESTION_DAYS; dayOffset += 1) {
      const date = this.addUtcDays(startDay, dayOffset);
      const dateString = date.toISOString().slice(0, 10);
      if (await this.appointmentsRepository.hasActiveHoliday(date)) continue;

      const weekday = date.getUTCDay();
      const dayPeriods = input.availability.filter(
        (period) => period.dayOfWeek === weekday,
      );

      for (const period of dayPeriods) {
        const opens = this.timeToMinutes(period.opensAt);
        const closes = this.timeToMinutes(period.closesAt);
        const durationMinutes = Math.ceil(duration / 60000);
        let candidateMinutes =
          dayOffset === 0 ? Math.max(opens, requestedMinutes) : opens;
        candidateMinutes = this.roundUpMinutes(
          candidateMinutes,
          SUGGESTION_STEP_MINUTES,
        );

        while (candidateMinutes + durationMinutes <= closes) {
          const candidate = this.parsePeriod(
            dateString,
            this.minutesToTime(candidateMinutes),
            this.minutesToTime(candidateMinutes + durationMinutes),
          );
          const invalidReason = await this.getInvalidReason({
            ...input,
            period: candidate,
          });
          if (!invalidReason) {
            return {
              startsAt: candidate.startsAtUtc.toISOString(),
              endsAt: candidate.endsAtUtc.toISOString(),
            };
          }
          candidateMinutes += SUGGESTION_STEP_MINUTES;
        }
      }
    }

    return null;
  }

  private async findFirstAvailableSlot(input: {
    date: string;
    room: AppointmentRoomRecord;
    visitorId?: number;
    ignoredId?: number;
  }): Promise<{
    date: string;
    opensAt: string;
    closesAt: string;
    startsAt: string;
    endsAt: string;
  } | null> {
    const startDay = this.parseDateOnly(input.date);
    const availability = this.normalizeAvailability(input.room.availability);

    for (let dayOffset = 1; dayOffset <= MAX_SUGGESTION_DAYS; dayOffset += 1) {
      const date = this.addUtcDays(startDay, dayOffset);
      if (await this.appointmentsRepository.hasActiveHoliday(date)) continue;

      const dateString = date.toISOString().slice(0, 10);
      const dayPeriods = availability.filter(
        (period) => period.dayOfWeek === date.getUTCDay(),
      );

      for (const period of dayPeriods) {
        const opens = this.timeToMinutes(period.opensAt);
        const closes = this.timeToMinutes(period.closesAt);
        for (
          let minutes = opens;
          minutes + DEFAULT_APPOINTMENT_DURATION_MINUTES <= closes;
          minutes += SLOT_STEP_MINUTES
        ) {
          const startsAt = this.minutesToTime(minutes);
          const endsAt = this.minutesToTime(
            minutes + DEFAULT_APPOINTMENT_DURATION_MINUTES,
          );
          const candidate = this.parsePeriod(dateString, startsAt, endsAt);
          const occupancy = await this.appointmentsRepository.countRoomOverlaps(
            {
              roomId: input.room.id,
              startsAt: candidate.startsAtUtc,
              endsAt: candidate.endsAtUtc,
              ignoredId: input.ignoredId,
            },
          );
          const visitorBusy = input.visitorId
            ? await this.appointmentsRepository.hasVisitorOverlap({
                visitorId: input.visitorId,
                startsAt: candidate.startsAtUtc,
                endsAt: candidate.endsAtUtc,
                ignoredId: input.ignoredId,
              })
            : false;

          if (!visitorBusy && occupancy < input.room.capacity) {
            return {
              date: dateString,
              opensAt: period.opensAt,
              closesAt: period.closesAt,
              startsAt,
              endsAt,
            };
          }
        }
      }
    }

    return null;
  }

  private fitsRoomSchedule(
    period: AppointmentPeriod,
    availability: RoomAvailabilityPeriod[],
  ): boolean {
    const dayOfWeek = new Date(`${period.date}T00:00:00.000Z`).getUTCDay();
    return availability.some(
      (slot) =>
        slot.dayOfWeek === dayOfWeek &&
        slot.opensAt <= period.startsAt &&
        slot.closesAt >= period.endsAt,
    );
  }

  private parsePeriod(
    date: string,
    startsAt: string,
    endsAt?: string,
  ): AppointmentPeriod {
    this.parseDateOnly(date);
    const resolvedEndsAt =
      endsAt ??
      this.addMinutesToTime(startsAt, DEFAULT_APPOINTMENT_DURATION_MINUTES);
    if (!resolvedEndsAt) {
      throw new InvalidAppointmentPeriodException(
        'O horário selecionado não comporta a duração padrão do atendimento.',
      );
    }
    if (startsAt >= resolvedEndsAt) {
      throw new InvalidAppointmentPeriodException(
        'O horário de início deve ser anterior ao horário de fim.',
      );
    }

    return {
      date,
      startsAt,
      endsAt: resolvedEndsAt,
      startsAtUtc: this.businessDateToUtc(date, startsAt),
      endsAtUtc: this.businessDateToUtc(date, resolvedEndsAt),
    };
  }

  private parseDateOnly(date: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new InvalidAppointmentPeriodException('Informe uma data válida.');
    }
    const day = new Date(`${date}T00:00:00.000Z`);
    if (
      Number.isNaN(day.getTime()) ||
      day.toISOString().slice(0, 10) !== date
    ) {
      throw new InvalidAppointmentPeriodException('Informe uma data válida.');
    }
    return day;
  }

  private toBusinessPeriod(startsAt: Date, endsAt: Date) {
    const startParts = this.businessParts(startsAt);
    const endParts = this.businessParts(endsAt);
    return {
      date: startParts.date,
      startsAt: startParts.time,
      endsAt: endParts.time,
    };
  }

  private toResponse(appointment: AppointmentRecord): AppointmentResponseDto {
    const period = this.toBusinessPeriod(
      appointment.startsAt,
      appointment.endsAt,
    );
    return {
      id: appointment.id,
      visitor: {
        id: appointment.visitor.id,
        name: appointment.visitor.name,
        documentType: appointment.visitor.documentType,
        document: appointment.visitor.document,
        priority: appointment.visitor.priorityType.description,
      },
      room: {
        id: appointment.room.id,
        name: appointment.room.name,
        capacity: appointment.room.capacity,
      },
      date: period.date,
      startsAt: period.startsAt,
      endsAt: period.endsAt,
      status: appointment.status,
      statusLabel: STATUS_LABELS[appointment.status] ?? 'Desconhecido',
      active: appointment.active,
      createdAt: appointment.createdAt.toISOString(),
    };
  }

  private businessDateToUtc(date: string, time: string): Date {
    return new Date(`${date}T${time}:00.000${BUSINESS_OFFSET}`);
  }

  private businessParts(date: Date): { date: string; time: string } {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Manaus',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(date).map((part) => [part.type, part.value]),
    );
    return {
      date: `${parts.year}-${parts.month}-${parts.day}`,
      time: `${parts.hour}:${parts.minute}`,
    };
  }

  private normalizeAvailability(value: unknown): RoomAvailabilityPeriod[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item) => this.isAvailabilityPeriod(item));
  }

  private isAvailabilityPeriod(
    value: unknown,
  ): value is RoomAvailabilityPeriod {
    if (!value || typeof value !== 'object') return false;
    const record = value as Record<string, unknown>;
    return (
      typeof record.dayOfWeek === 'number' &&
      typeof record.opensAt === 'string' &&
      typeof record.closesAt === 'string'
    );
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
  }

  private addMinutesToTime(time: string, minutesToAdd: number): string | null {
    const total = this.timeToMinutes(time) + minutesToAdd;
    if (total >= 24 * 60) return null;
    return this.minutesToTime(total);
  }

  private getSlotReason(input: {
    isHoliday: boolean;
    visitorBusy: boolean;
    occupancy: number;
    room: AppointmentRoomRecord;
  }): string | undefined {
    if (input.isHoliday) return 'Feriado';
    if (input.visitorBusy) return 'Visitante ocupado';
    if (input.occupancy >= input.room.capacity) return 'Horário ocupado';
    return undefined;
  }

  private roundUpMinutes(minutes: number, step: number): number {
    return Math.ceil(minutes / step) * step;
  }

  private addUtcDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private throwNotFound(): never {
    throw new AppointmentNotFoundException();
  }
}
