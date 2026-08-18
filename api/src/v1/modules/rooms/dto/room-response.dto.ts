import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';
import { RoomAvailabilityDto } from './room-availability.dto';

export class RoomResponsibleResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Ana Souza' })
  name!: string;

  @ApiProperty({ example: '2026-08-15T12:00:00.000Z' })
  validFrom!: string;
}

export class RoomResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Sala Horizonte' })
  name!: string;

  @ApiProperty({ example: 12 })
  capacity!: number;

  @ApiProperty({ type: [RoomAvailabilityDto] })
  availability!: RoomAvailabilityDto[];

  @ApiPropertyOptional({ type: RoomResponsibleResponseDto, nullable: true })
  currentResponsible!: RoomResponsibleResponseDto | null;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: '2026-08-15T12:00:00.000Z' })
  createdAt!: string;
}

export class RoomListResponseDto {
  @ApiProperty({ type: [RoomResponseDto] })
  data!: RoomResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class RoomResponsibleHistoryDto extends RoomResponsibleResponseDto {
  @ApiPropertyOptional({ nullable: true })
  validUntil!: string | null;

  @ApiProperty()
  active!: boolean;
}

export class RoomAvailabilityHistoryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ type: [RoomAvailabilityDto] })
  availability!: RoomAvailabilityDto[];

  @ApiProperty()
  validFrom!: string;

  @ApiPropertyOptional({ nullable: true })
  validUntil!: string | null;

  @ApiProperty()
  active!: boolean;
}

export class RoomHistoryResponseDto {
  @ApiProperty({ example: 1 })
  roomId!: number;

  @ApiProperty({ type: [RoomResponsibleHistoryDto] })
  responsibles!: RoomResponsibleHistoryDto[];

  @ApiProperty({ type: [RoomAvailabilityHistoryDto] })
  availability!: RoomAvailabilityHistoryDto[];
}
