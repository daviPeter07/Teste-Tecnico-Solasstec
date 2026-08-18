export interface HolidayRecord {
  id: number;
  date: Date;
  description: string;
  type: number | null;
  active: boolean;
  createdAt: Date;
}

export interface ListHolidaysInput {
  page: number;
  limit: number;
  search?: string;
  active: boolean;
}

export interface SaveHolidayInput {
  date: Date;
  description: string;
  type?: number | null;
}

export abstract class HolidaysRepository {
  abstract list(
    input: ListHolidaysInput,
  ): Promise<{ data: HolidayRecord[]; total: number }>;
  abstract findById(id: number): Promise<HolidayRecord | null>;
  abstract findByDate(date: Date): Promise<HolidayRecord | null>;
  abstract create(input: SaveHolidayInput): Promise<HolidayRecord>;
  abstract update(id: number, input: SaveHolidayInput): Promise<HolidayRecord>;
  abstract deactivate(id: number): Promise<void>;
  abstract deleteInactive(ids?: number[]): Promise<number>;
}
