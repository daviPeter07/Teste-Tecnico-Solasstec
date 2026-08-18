import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty({
    example: '2026-12-25',
    description: 'Data no formato AAAA-MM-DD',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'A data deve estar no formato AAAA-MM-DD.',
  })
  date!: string;

  @ApiProperty({ example: 'Natal' })
  @IsString()
  @MaxLength(150)
  description!: string;

  @ApiPropertyOptional({
    description: '1=NACIONAL, 2=ESTADUAL, 3=MUNICIPAL',
    minimum: 1,
    maximum: 3,
  })
  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  type?: number | null;
}
