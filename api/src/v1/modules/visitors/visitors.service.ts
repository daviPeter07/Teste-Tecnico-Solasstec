import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { DeleteInactiveRecordsDto } from '@/common/dto/delete-inactive-records.dto';
import {
  InvalidVisitorDocumentException,
  PriorityTypeNotConfiguredException,
  UnsupportedVisitorDocumentTypeException,
  VisitorDocumentConflictException,
  VisitorNotFoundException,
} from '@/common/exceptions';
import { CreateVisitorDto, type DocumentType } from './dto/create-visitor.dto';
import { ListVisitorsQueryDto } from './dto/list-visitors-query.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { VisitorResponseDto } from './dto/visitor-response.dto';
import {
  VisitorRecord,
  VisitorsRepository,
} from './repositories/visitors.repository';
import { isValidDocument, normalizeDocument } from './utils/normalize-document';
import { VisitorPriorityService } from './visitor-priority.service';

function formatDateToYYYYMMDD(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function parseBirthDate(birthDateStr: string): Date {
  const [year, month, day] = birthDateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

@Injectable()
export class VisitorsService {
  constructor(
    private readonly visitorsRepository: VisitorsRepository,
    private readonly priorityService: VisitorPriorityService,
  ) {}

  async list(
    queryOrSearch?: ListVisitorsQueryDto | string,
    pageParam = 1,
    limitParam = 10,
  ): Promise<{
    data: VisitorResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    let search: string | undefined;
    let page = pageParam;
    let limit = limitParam;
    let active = true;

    if (typeof queryOrSearch === 'object' && queryOrSearch !== null) {
      search = queryOrSearch.search;
      page = queryOrSearch.page ?? 1;
      limit = queryOrSearch.limit ?? 10;
      active = queryOrSearch.active ?? true;
    } else if (typeof queryOrSearch === 'string') {
      search = queryOrSearch;
    }

    const { data: rawVisitors, total } = await this.visitorsRepository.list({
      search,
      page,
      limit,
      active,
    });

    const priorities = await this.visitorsRepository.findPriorities();
    const updatedVisitors = await Promise.all(
      rawVisitors.map((visitor: VisitorRecord) =>
        this.refreshPriority(visitor, priorities),
      ),
    );

    return {
      data: updatedVisitors.map((visitor: VisitorRecord) =>
        this.toResponse(visitor),
      ),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<VisitorResponseDto> {
    const visitor = await this.visitorsRepository.findById(id);
    if (!visitor) this.throwNotFound();
    return this.toResponse(await this.refreshPriority(visitor));
  }

  async findById(id: number): Promise<VisitorResponseDto> {
    return this.findOne(id);
  }

  async findByDocument(document: string): Promise<VisitorResponseDto> {
    const normalized = document.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const visitor = await this.visitorsRepository.findByDocument(normalized);
    if (!visitor) this.throwNotFound();
    return this.toResponse(await this.refreshPriority(visitor));
  }

  async create(input: CreateVisitorDto): Promise<VisitorResponseDto> {
    return this.persistVisitor(input);
  }

  async update(
    id: number,
    input: UpdateVisitorDto,
  ): Promise<VisitorResponseDto> {
    const existing = await this.visitorsRepository.findById(id);
    if (!existing) this.throwNotFound();
    const documentType = input.documentType ?? existing.documentType;
    if (!this.isSupportedDocumentType(documentType)) {
      throw new UnsupportedVisitorDocumentTypeException();
    }

    const payload: CreateVisitorDto = {
      name: input.name ?? existing.name,
      documentType,
      document: input.document ?? existing.document,
      birthDate: input.birthDate ?? formatDateToYYYYMMDD(existing.birthDate),
      hasDisability: input.hasDisability ?? existing.hasDisability,
      photo: input.photo ?? existing.photo ?? undefined,
    };

    const document = normalizeDocument(payload.documentType, payload.document);
    const duplicatedVisitor =
      await this.visitorsRepository.findByDocument(document);
    if (duplicatedVisitor && duplicatedVisitor.id !== id) {
      throw new VisitorDocumentConflictException();
    }

    return this.persistVisitor(payload, id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.visitorsRepository.findById(id);
    if (!existing) this.throwNotFound();
    await this.visitorsRepository.deactivate(id);
  }

  async deleteInactive(input?: DeleteInactiveRecordsDto): Promise<void> {
    try {
      await this.visitorsRepository.deleteInactive(input?.ids);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Não foi possível excluir definitivamente visitantes com histórico vinculado.',
        );
      }
      throw error;
    }
  }

  private async persistVisitor(
    input: CreateVisitorDto,
    visitorId?: number,
  ): Promise<VisitorResponseDto> {
    const document = normalizeDocument(input.documentType, input.document);
    if (!isValidDocument(input.documentType, document)) {
      throw new InvalidVisitorDocumentException();
    }

    if (
      !visitorId &&
      (await this.visitorsRepository.findByDocument(document))
    ) {
      throw new VisitorDocumentConflictException();
    }

    const priorityLevel = this.priorityService.calculateLevel(
      input.birthDate,
      input.hasDisability,
    );
    const priorityType =
      await this.visitorsRepository.findPriorityByLevel(priorityLevel);

    if (!priorityType) {
      throw new PriorityTypeNotConfiguredException();
    }

    let visitor: VisitorRecord;
    try {
      const payload = {
        name: input.name.trim(),
        documentType: input.documentType,
        document,
        birthDate: parseBirthDate(input.birthDate),
        hasDisability: input.hasDisability,
        photo: input.photo,
        priorityTypeId: priorityType.id,
      };
      visitor = visitorId
        ? await this.visitorsRepository.update(visitorId, payload)
        : await this.visitorsRepository.create(payload);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new VisitorDocumentConflictException();
      }
      throw error;
    }

    return this.toResponse(visitor);
  }

  private toResponse(visitor: VisitorRecord): VisitorResponseDto {
    return {
      id: visitor.id,
      name: visitor.name,
      documentType: visitor.documentType,
      document: visitor.document,
      birthDate: formatDateToYYYYMMDD(visitor.birthDate),
      hasDisability: visitor.hasDisability,
      photo: visitor.photo,
      active: visitor.active,
      isPriority: visitor.priorityType.priorityLevel > 0,
      priorityType: {
        id: visitor.priorityType.id,
        description: visitor.priorityType.description,
        priorityLevel: visitor.priorityType.priorityLevel,
      },
      createdAt: visitor.createdAt.toISOString(),
    };
  }

  private async refreshPriority(
    visitor: VisitorRecord,
    priorities?: VisitorRecord['priorityType'][],
  ): Promise<VisitorRecord> {
    const level = this.priorityService.calculateLevel(
      formatDateToYYYYMMDD(visitor.birthDate),
      visitor.hasDisability,
    );

    if (visitor.priorityType.priorityLevel === level) return visitor;

    const priorityType =
      priorities?.find((priority) => priority.priorityLevel === level) ??
      (await this.visitorsRepository.findPriorityByLevel(level));

    if (!priorityType) {
      throw new PriorityTypeNotConfiguredException();
    }

    await this.visitorsRepository.updatePriority(visitor.id, priorityType.id);
    return { ...visitor, priorityType };
  }

  private throwNotFound(): never {
    throw new VisitorNotFoundException();
  }

  private isSupportedDocumentType(value: string): value is DocumentType {
    return value === 'CPF' || value === 'RG';
  }
}
