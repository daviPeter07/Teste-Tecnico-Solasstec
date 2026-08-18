import { AppointmentUnavailableException } from '@/common/exceptions';
import { AppointmentsService } from '../../appointments.service';
import {
  AppointmentRecord,
  AppointmentRoomRecord,
  AppointmentsRepository,
  AppointmentVisitorRecord,
} from '../../repositories/appointments.repository';

describe('AppointmentsService', () => {
  let repository: jest.Mocked<AppointmentsRepository>;
  let service: AppointmentsService;

  const visitor: AppointmentVisitorRecord = {
    id: 1,
    name: 'João Silva',
    document: '12345678909',
    active: true,
    priorityType: { description: 'Normal' },
  };

  const room: AppointmentRoomRecord = {
    id: 1,
    name: 'Sala Horizonte',
    capacity: 1,
    active: true,
    availability: [
      { dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 2, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 3, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 4, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 5, opensAt: '08:00', closesAt: '18:00' },
    ],
  };

  const appointment: AppointmentRecord = {
    id: 1,
    visitorId: 1,
    roomId: 1,
    startsAt: new Date('2026-08-20T13:00:00.000Z'),
    endsAt: new Date('2026-08-20T14:00:00.000Z'),
    status: 1,
    active: true,
    createdAt: new Date('2026-08-18T12:00:00.000Z'),
    visitor,
    room,
  };

  beforeEach(() => {
    repository = {
      runWithAppointmentRecordLock: jest.fn(async (_id, callback) =>
        callback(),
      ),
      runWithAppointmentLocks: jest.fn(async (_input, callback) => callback()),
      list: jest.fn(),
      findById: jest.fn(),
      findVisitorById: jest.fn(),
      findRoomById: jest.fn(),
      hasActiveHoliday: jest.fn(),
      countRoomOverlaps: jest.fn(),
      hasVisitorOverlap: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      deactivate: jest.fn(),
    };

    repository.findVisitorById.mockResolvedValue(visitor);
    repository.findRoomById.mockResolvedValue(room);
    repository.hasActiveHoliday.mockResolvedValue(false);
    repository.hasVisitorOverlap.mockResolvedValue(false);
    repository.countRoomOverlaps.mockResolvedValue(0);
    repository.findById.mockResolvedValue(appointment);
    repository.create.mockResolvedValue(appointment);
    repository.updateStatus.mockResolvedValue({ ...appointment, status: 2 });
    service = new AppointmentsService(repository);
  });

  it('creates an appointment with business time converted to UTC', async () => {
    await expect(
      service.create({
        visitorId: 1,
        roomId: 1,
        date: '2026-08-20',
        startsAt: '09:00',
      }),
    ).resolves.toMatchObject({
      id: 1,
      date: '2026-08-20',
      startsAt: '09:00',
      endsAt: '10:00',
    });

    expect(repository.create.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        startsAt: new Date('2026-08-20T13:00:00.000Z'),
        endsAt: new Date('2026-08-20T14:00:00.000Z'),
      }),
    );
  });

  it('rejects a holiday and returns the next available suggestion', async () => {
    repository.hasActiveHoliday.mockImplementation((date) =>
      Promise.resolve(date.toISOString().slice(0, 10) === '2026-08-20'),
    );

    await expect(
      service.create({
        visitorId: 1,
        roomId: 1,
        date: '2026-08-20',
        startsAt: '09:00',
      }),
    ).rejects.toMatchObject({
      message: 'A data selecionada é um feriado.',
    });
  });

  it('suggests the next available date when listing slots for a holiday', async () => {
    repository.hasActiveHoliday.mockImplementation((date) =>
      Promise.resolve(date.toISOString().slice(0, 10) === '2026-08-20'),
    );

    await expect(
      service.slots({ roomId: 1, date: '2026-08-20', visitorId: 1 }),
    ).resolves.toMatchObject({
      suggestion: {
        date: '2026-08-21',
        opensAt: '08:00',
        closesAt: '18:00',
        startsAt: '08:00',
        endsAt: '09:00',
      },
    });
  });

  it('rejects visitor schedule conflicts', async () => {
    repository.hasVisitorOverlap.mockResolvedValue(true);

    await expect(
      service.create({
        visitorId: 1,
        roomId: 1,
        date: '2026-08-20',
        startsAt: '09:00',
      }),
    ).rejects.toBeInstanceOf(AppointmentUnavailableException);
  });

  it('rejects room capacity conflicts', async () => {
    repository.countRoomOverlaps.mockResolvedValue(1);

    await expect(
      service.create({
        visitorId: 1,
        roomId: 1,
        date: '2026-08-20',
        startsAt: '09:00',
      }),
    ).rejects.toBeInstanceOf(AppointmentUnavailableException);
  });

  it('ignores the current appointment when listing edit slots', async () => {
    await service.slots({
      roomId: 1,
      date: '2026-08-20',
      visitorId: 1,
      appointmentId: 1,
    });

    expect(
      repository.countRoomOverlaps.mock.calls.some(
        ([input]) => input.ignoredId === 1,
      ),
    ).toBe(true);
    expect(
      repository.hasVisitorOverlap.mock.calls.some(
        ([input]) => input.ignoredId === 1,
      ),
    ).toBe(true);
  });

  it('validates availability before moving an appointment to a blocking status', async () => {
    repository.countRoomOverlaps.mockResolvedValue(1);

    await expect(service.updateStatus(1, { status: 2 })).rejects.toBeInstanceOf(
      AppointmentUnavailableException,
    );

    expect(repository.updateStatus.mock.calls).toHaveLength(0);
    expect(repository.runWithAppointmentRecordLock.mock.calls[0]?.[0]).toBe(1);
    expect(
      repository.countRoomOverlaps.mock.calls.some(
        ([input]) => input.ignoredId === 1,
      ),
    ).toBe(true);
  });
});
