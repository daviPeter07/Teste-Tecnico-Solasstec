import { RoomsService } from '../../rooms.service';
import {
  RoomRecord,
  RoomsRepository,
} from '../../repositories/rooms.repository';

describe('RoomsService', () => {
  let repository: jest.Mocked<RoomsRepository>;
  let service: RoomsService;

  const room: RoomRecord = {
    id: 1,
    name: 'Sala Horizonte',
    capacity: 12,
    availability: [{ dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' }],
    active: true,
    createdAt: new Date('2026-08-15T12:00:00.000Z'),
    responsibleHistory: [
      {
        id: 1,
        name: 'Ana Souza',
        validFrom: new Date('2026-08-15T12:00:00.000Z'),
        validUntil: null,
        active: true,
      },
    ],
  };

  beforeEach(() => {
    repository = {
      list: jest.fn(),
      findById: jest.fn(),
      findHistory: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
    };
    service = new RoomsService(repository);
  });

  it('creates a room with normalized availability', async () => {
    repository.create.mockResolvedValue(room);

    await expect(
      service.create({
        name: ' Sala Horizonte ',
        capacity: 12,
        responsibleName: ' Ana Souza ',
        availability: [
          { dayOfWeek: 2, opensAt: '08:00', closesAt: '18:00' },
          { dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' },
        ],
      }),
    ).resolves.toMatchObject({
      id: 1,
      currentResponsible: { name: 'Ana Souza' },
    });

    expect(repository.create.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        name: 'Sala Horizonte',
        responsibleName: 'Ana Souza',
        availability: [
          { dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' },
          { dayOfWeek: 2, opensAt: '08:00', closesAt: '18:00' },
        ],
      }),
    );
  });

  it('updates a room with normalized availability', async () => {
    repository.findById.mockResolvedValue(room);
    repository.update.mockResolvedValue({
      ...room,
      name: 'Sala Aurora',
      capacity: 20,
    });

    await expect(
      service.update(1, {
        name: ' Sala Aurora ',
        capacity: 20,
        responsibleName: ' Ana Souza ',
        availability: [
          { dayOfWeek: 2, opensAt: '08:00', closesAt: '18:00' },
          { dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' },
        ],
      }),
    ).resolves.toMatchObject({
      id: 1,
      name: 'Sala Aurora',
      capacity: 20,
    });

    expect(repository.update.mock.calls[0]).toEqual([
      1,
      expect.objectContaining({
        name: 'Sala Aurora',
        responsibleName: 'Ana Souza',
        availability: [
          { dayOfWeek: 1, opensAt: '08:00', closesAt: '18:00' },
          { dayOfWeek: 2, opensAt: '08:00', closesAt: '18:00' },
        ],
      }),
    ]);
  });

  it('deactivates a room on remove', async () => {
    repository.findById.mockResolvedValue(room);
    repository.deactivate.mockResolvedValue();

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.deactivate.mock.calls[0]).toEqual([1]);
  });
});
