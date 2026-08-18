import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';

export class AppointmentVisitorResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'João Silva' })
  name!: string;

  @ApiProperty({ example: '12345678909' })
  document!: string;

  @ApiProperty({ example: 'Normal' })
  priority!: string;
}

export class AppointmentRoomResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Sala Horizonte' })
  name!: string;

  @ApiProperty({ example: 12 })
  capacity!: number;
}

export class AppointmentResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ type: AppointmentVisitorResponseDto })
  visitor!: AppointmentVisitorResponseDto;

  @ApiProperty({ type: AppointmentRoomResponseDto })
  room!: AppointmentRoomResponseDto;

  @ApiProperty({ example: '2026-08-20' })
  date!: string;

  @ApiProperty({ example: '09:00' })
  startsAt!: string;

  @ApiProperty({ example: '10:00' })
  endsAt!: string;

  @ApiProperty({ example: 1 })
  status!: number;

  @ApiProperty({ example: 'Pendente' })
  statusLabel!: string;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: '2026-08-18T12:00:00.000Z' })
  createdAt!: string;
}

export class AppointmentListResponseDto {
  @ApiProperty({ type: [AppointmentResponseDto] })
  data!: AppointmentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
