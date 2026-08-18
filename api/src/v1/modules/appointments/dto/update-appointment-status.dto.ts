import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @ApiProperty({ example: 2, minimum: 1, maximum: 4 })
  @IsInt()
  @Min(1)
  @Max(4)
  status!: number;
}
