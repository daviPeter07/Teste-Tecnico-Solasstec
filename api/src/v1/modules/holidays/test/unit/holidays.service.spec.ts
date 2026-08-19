import { HolidayDateConflictException } from '@/common/exceptions';
import { HolidaysService } from '../../holidays.service';
import {
  HolidayRecord,
  HolidaysRepository,
} from '../../repositories/holidays.repository';

describe('HolidaysService', () => {
  let repository: jest.Mocked<HolidaysRepository>;
  let service: HolidaysService;

  const holiday: HolidayRecord = {
    id: 1,
    date: new Date('2026-12-25T00:00:00.000Z'),
    description: 'Natal',
    type: 1,
    active: true,
    createdAt: new Date('2026-08-18T12:00:00.000Z'),
  };

  beforeEach(() => {
    repository = {
      list: jest.fn(),
      findById: jest.fn(),
      findByDate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
      deleteInactive: jest.fn(),
    };
    service = new HolidaysService(repository);
  });

  it('passes date range filters to the repository', async () => {
    repository.list.mockResolvedValue({ data: [holiday], total: 1 });

    await service.list({
      page: 1,
      limit: 15,
      active: true,
      dateFrom: '2026-12-01',
      dateTo: '2026-12-31',
    });

    expect(repository.list.mock.calls[0]?.[0]).toMatchObject({
      dateFrom: '2026-12-01',
      dateTo: '2026-12-31',
    });
  });

  it('creates a holiday with a UTC-safe date', async () => {
    repository.findByDate.mockResolvedValue(null);
    repository.create.mockResolvedValue(holiday);

    await expect(
      service.create({ date: '2026-12-25', description: ' Natal ', type: 1 }),
    ).resolves.toMatchObject({
      id: 1,
      date: '2026-12-25',
      description: 'Natal',
      type: 1,
    });

    expect(repository.create.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        date: new Date('2026-12-25T00:00:00.000Z'),
        description: 'Natal',
      }),
    );
  });

  it('rejects duplicate holiday dates', async () => {
    repository.findByDate.mockResolvedValue(holiday);

    await expect(
      service.create({ date: '2026-12-25', description: 'Natal', type: 1 }),
    ).rejects.toBeInstanceOf(HolidayDateConflictException);
  });

  it('updates a holiday preserving omitted fields', async () => {
    repository.findById.mockResolvedValue(holiday);
    repository.update.mockResolvedValue({
      ...holiday,
      description: 'Natal Nacional',
    });

    await expect(
      service.update(1, { description: ' Natal Nacional ' }),
    ).resolves.toMatchObject({
      date: '2026-12-25',
      description: 'Natal Nacional',
    });

    expect(repository.update.mock.calls[0]).toEqual([
      1,
      expect.objectContaining({
        date: holiday.date,
        description: 'Natal Nacional',
        type: 1,
      }),
    ]);
  });

  it('deactivates a holiday on remove', async () => {
    repository.findById.mockResolvedValue(holiday);
    repository.deactivate.mockResolvedValue();

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.deactivate.mock.calls[0]).toEqual([1]);
  });
});
