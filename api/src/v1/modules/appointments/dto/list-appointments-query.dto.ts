import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class ListAppointmentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Busca por visitante, documento ou sala',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  visitorId?: number;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  roomId?: number;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 4 })
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ default: true })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return true;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  active: boolean = true;

  @ApiPropertyOptional({ default: false })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return false;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  includeInactive: boolean = false;
}
