import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Matches, Min } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  visitorId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  roomId!: number;

  @ApiProperty({ example: '2026-08-20' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @ApiProperty({ example: '09:00' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startsAt!: string;

  @ApiProperty({ example: '10:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endsAt?: string;
}
