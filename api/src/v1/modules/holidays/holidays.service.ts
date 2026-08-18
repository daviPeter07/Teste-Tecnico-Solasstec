import { Injectable } from '@nestjs/common';
import {
  HolidayDateConflictException,
  HolidayNotFoundException,
  InvalidHolidayDateException,
} from '@/common/exceptions';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import {
  HolidayListResponseDto,
  HolidayResponseDto,
} from './dto/holiday-response.dto';
import { ListHolidaysQueryDto } from './dto/list-holidays-query.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import {
  HolidayRecord,
  HolidaysRepository,
} from './repositories/holidays.repository';

@Injectable()
export class HolidaysService {
  constructor(private readonly holidaysRepository: HolidaysRepository) {}

  async list(query: ListHolidaysQueryDto): Promise<HolidayListResponseDto> {
    const result = await this.holidaysRepository.list(query);
    return {
      data: result.data.map((holiday) => this.toResponse(holiday)),
      meta: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  }

  async findById(id: number): Promise<HolidayResponseDto> {
    const holiday = await this.holidaysRepository.findById(id);
    if (!holiday) this.throwNotFound();
    return this.toResponse(holiday);
  }

  async create(input: CreateHolidayDto): Promise<HolidayResponseDto> {
    const date = this.parseHolidayDate(input.date);
    await this.ensureDateIsAvailable(date);

    const holiday = await this.holidaysRepository.create({
      date,
      description: input.description.trim(),
      type: input.type ?? null,
    });
    return this.toResponse(holiday);
  }

  async update(
    id: number,
    input: UpdateHolidayDto,
  ): Promise<HolidayResponseDto> {
    const existing = await this.holidaysRepository.findById(id);
    if (!existing) this.throwNotFound();

    const date = input.date ? this.parseHolidayDate(input.date) : existing.date;
    if (date.getTime() !== existing.date.getTime()) {
      await this.ensureDateIsAvailable(date, id);
    }

    const holiday = await this.holidaysRepository.update(id, {
      date,
      description: (input.description ?? existing.description).trim(),
      type: input.type === undefined ? existing.type : input.type,
    });
    return this.toResponse(holiday);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.holidaysRepository.findById(id);
    if (!existing) this.throwNotFound();
    await this.holidaysRepository.deactivate(id);
  }

  private async ensureDateIsAvailable(
    date: Date,
    ignoredId?: number,
  ): Promise<void> {
    const existing = await this.holidaysRepository.findByDate(date);
    if (existing && existing.id !== ignoredId) {
      throw new HolidayDateConflictException();
    }
  }

  private parseHolidayDate(value: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new InvalidHolidayDateException();
    }
    return date;
  }

  private toResponse(holiday: HolidayRecord): HolidayResponseDto {
    return {
      id: holiday.id,
      date: holiday.date.toISOString().slice(0, 10),
      description: holiday.description,
      type: holiday.type,
      active: holiday.active,
      createdAt: holiday.createdAt.toISOString(),
    };
  }

  private throwNotFound(): never {
    throw new HolidayNotFoundException();
  }
}
