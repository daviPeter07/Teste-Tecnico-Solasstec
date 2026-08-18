import type { DocumentType } from '../dto/create-visitor.dto';

export interface VisitorPriorityRecord {
  id: number;
  description: string;
  priorityLevel: number;
}

export interface VisitorRecord {
  id: number;
  name: string;
  documentType: string;
  document: string;
  birthDate: Date;
  hasDisability: boolean;
  photo: string | null;
  active: boolean;
  createdAt: Date;
  priorityType: VisitorPriorityRecord;
}

export interface ListVisitorsInput {
  page: number;
  limit: number;
  search?: string;
  active?: boolean;
}

export interface CreateVisitorInput {
  name: string;
  documentType: DocumentType;
  document: string;
  birthDate: Date;
  hasDisability: boolean;
  photo?: string;
  priorityTypeId: number;
}

export abstract class VisitorsRepository {
  abstract list(
    input: ListVisitorsInput,
  ): Promise<{ data: VisitorRecord[]; total: number }>;
  abstract findById(id: number): Promise<VisitorRecord | null>;
  abstract findByDocument(document: string): Promise<VisitorRecord | null>;
  abstract findPriorityByLevel(
    level: number,
  ): Promise<VisitorPriorityRecord | null>;
  abstract findPriorities(): Promise<VisitorPriorityRecord[]>;
  abstract updatePriority(
    visitorId: number,
    priorityTypeId: number,
  ): Promise<void>;
  abstract create(input: CreateVisitorInput): Promise<VisitorRecord>;
  abstract update(
    id: number,
    input: CreateVisitorInput,
  ): Promise<VisitorRecord>;
  abstract deactivate(id: number): Promise<void>;
}
