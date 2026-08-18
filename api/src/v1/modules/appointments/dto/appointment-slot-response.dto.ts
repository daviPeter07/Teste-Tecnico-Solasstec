import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppointmentSlotResponseDto {
  @ApiProperty({ example: '09:00' })
  startsAt!: string;

  @ApiProperty({ example: '10:00' })
  endsAt!: string;

  @ApiProperty({ example: true })
  available!: boolean;

  @ApiProperty({ example: 0 })
  occupancy!: number;

  @ApiProperty({ example: 12 })
  capacity!: number;

  @ApiPropertyOptional({ example: 'Horário ocupado.' })
  reason?: string;
}

export class AppointmentSlotSuggestionResponseDto {
  @ApiProperty({ example: '2026-08-21' })
  date!: string;

  @ApiProperty({ example: '08:00' })
  opensAt!: string;

  @ApiProperty({ example: '17:00' })
  closesAt!: string;

  @ApiProperty({ example: '09:00' })
  startsAt!: string;

  @ApiProperty({ example: '10:00' })
  endsAt!: string;
}

export class AppointmentSlotsResponseDto {
  @ApiProperty({ example: '2026-08-20' })
  date!: string;

  @ApiProperty({ type: [AppointmentSlotResponseDto] })
  slots!: AppointmentSlotResponseDto[];

  @ApiPropertyOptional({ type: AppointmentSlotSuggestionResponseDto })
  suggestion?: AppointmentSlotSuggestionResponseDto | null;
}
