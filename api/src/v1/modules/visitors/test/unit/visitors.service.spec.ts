import { ConfigService } from '@nestjs/config';
import { VisitorDocumentConflictException } from '@/common/exceptions';
import { VisitorPriorityService } from '../../visitor-priority.service';
import { VisitorsService } from '../../visitors.service';
import {
  VisitorRecord,
  VisitorsRepository,
} from '../../repositories/visitors.repository';

describe('VisitorsService', () => {
  let repository: jest.Mocked<VisitorsRepository>;
  let service: VisitorsService;

  const visitor: VisitorRecord = {
    id: 1,
    name: 'Maria da Silva',
    documentType: 'CPF',
    document: '52998224725',
    birthDate: new Date('1960-01-01T00:00:00.000Z'),
    hasDisability: false,
    photo: null,
    active: true,
    createdAt: new Date('2026-08-15T12:00:00.000Z'),
    priorityType: {
      id: 2,
      description: 'Visitante com idade igual ou superior a 60 anos.',
      priorityLevel: 1,
    },
  };

  beforeEach(() => {
    repository = {
      list: jest.fn(),
      findById: jest.fn(),
      findByDocument: jest.fn(),
      findPriorityByLevel: jest.fn(),
      findPriorities: jest.fn(),
      updatePriority: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
    };
    service = new VisitorsService(
      repository,
      new VisitorPriorityService({
        getOrThrow: jest.fn().mockReturnValue('America/Manaus'),
      } as unknown as ConfigService),
    );
  });

  it('normalizes the document and persists the calculated priority', async () => {
    repository.findByDocument.mockResolvedValue(null);
    repository.findPriorityByLevel.mockResolvedValue(visitor.priorityType);
    repository.create.mockResolvedValue(visitor);

    await expect(
      service.create({
        name: ' Maria da Silva ',
        documentType: 'CPF',
        document: '529.982.247-25',
        birthDate: '1960-01-01',
        hasDisability: false,
      }),
    ).resolves.toMatchObject({ id: 1, isPriority: true });

    expect(repository.create.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        name: 'Maria da Silva',
        document: '52998224725',
        birthDate: new Date('1960-01-01T00:00:00.000Z'),
        priorityTypeId: 2,
      }),
    );
  });

  it('rejects a duplicate normalized document', async () => {
    repository.findByDocument.mockResolvedValue(visitor);

    await expect(
      service.create({
        name: 'Outra Pessoa',
        documentType: 'CPF',
        document: '529.982.247-25',
        birthDate: '1990-01-01',
        hasDisability: false,
      }),
    ).rejects.toBeInstanceOf(VisitorDocumentConflictException);
  });

  it('refreshes age priority when the visitor has turned 60', async () => {
    const staleVisitor: VisitorRecord = {
      ...visitor,
      priorityType: {
        id: 1,
        description: 'Visitante sem critério de prioridade.',
        priorityLevel: 0,
      },
    };
    repository.findById.mockResolvedValue(staleVisitor);
    repository.findPriorityByLevel.mockResolvedValue(visitor.priorityType);
    repository.updatePriority.mockResolvedValue();

    await expect(service.findOne(1)).resolves.toMatchObject({
      isPriority: true,
      priorityType: { priorityLevel: 1 },
    });
    expect(repository.updatePriority.mock.calls[0]).toEqual([1, 2]);
  });

  it('updates a visitor and recalculates the priority', async () => {
    const updatedVisitor: VisitorRecord = {
      ...visitor,
      name: 'Maria Souza',
      birthDate: new Date('1990-01-01T00:00:00.000Z'),
      priorityType: {
        id: 1,
        description: 'Visitante sem critério de prioridade.',
        priorityLevel: 0,
      },
    };
    repository.findById.mockResolvedValue(visitor);
    repository.findByDocument.mockResolvedValue(null);
    repository.findPriorityByLevel.mockResolvedValue(
      updatedVisitor.priorityType,
    );
    repository.update.mockResolvedValue(updatedVisitor);

    await expect(
      service.update(1, {
        name: ' Maria Souza ',
        documentType: 'CPF',
        document: '529.982.247-25',
        birthDate: '1990-01-01',
        hasDisability: false,
      }),
    ).resolves.toMatchObject({
      id: 1,
      name: 'Maria Souza',
      isPriority: false,
    });

    expect(repository.update.mock.calls[0]).toEqual([
      1,
      expect.objectContaining({
        name: 'Maria Souza',
        birthDate: new Date('1990-01-01T00:00:00.000Z'),
        priorityTypeId: 1,
      }),
    ]);
  });

  it('deactivates a visitor on remove', async () => {
    repository.findById.mockResolvedValue(visitor);
    repository.deactivate.mockResolvedValue();

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.deactivate.mock.calls[0]).toEqual([1]);
  });
});
