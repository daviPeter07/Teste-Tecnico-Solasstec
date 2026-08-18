import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';

export class PriorityTypeResponseDto {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: 'Visitante com idade igual ou superior a 60 anos.' })
  description!: string;

  @ApiProperty({ example: 1, minimum: 0, maximum: 3 })
  priorityLevel!: number;
}

export class VisitorResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Maria da Silva' })
  name!: string;

  @ApiProperty({ enum: ['CPF'], example: 'CPF' })
  documentType!: string;

  @ApiProperty({ example: '12345678909' })
  document!: string;

  @ApiProperty({ example: '1960-05-20' })
  birthDate!: string;

  @ApiProperty({ example: false })
  hasDisability!: boolean;

  @ApiPropertyOptional({ nullable: true })
  photo!: string | null;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: true })
  isPriority!: boolean;

  @ApiProperty({ type: PriorityTypeResponseDto })
  priorityType!: PriorityTypeResponseDto;

  @ApiProperty({ example: '2026-08-15T12:00:00.000Z' })
  createdAt!: string;
}

export class VisitorListResponseDto {
  @ApiProperty({ type: [VisitorResponseDto] })
  data!: VisitorResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
