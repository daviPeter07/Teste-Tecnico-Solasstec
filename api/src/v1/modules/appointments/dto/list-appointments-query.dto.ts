import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { parseBooleanQuery } from '@/common/dto/parse-boolean-query';

export class ListAppointmentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Busca por visitante, CPF, RG ou sala',
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

  @ApiPropertyOptional({ example: '2026-08-20', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsOptional()
  startsFrom?: string;

  @ApiPropertyOptional({ example: '2026-08-27', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsOptional()
  startsTo?: string;

  @ApiPropertyOptional({ default: true })
  @Type(() => String)
  @Transform(({ value }: { value: unknown }) => parseBooleanQuery(value, true))
  @IsBoolean()
  @IsOptional()
  active: boolean = true;

  @ApiPropertyOptional({ default: false })
  @Type(() => String)
  @Transform(({ value }: { value: unknown }) => parseBooleanQuery(value, false))
  @IsBoolean()
  @IsOptional()
  includeInactive: boolean = false;
}
