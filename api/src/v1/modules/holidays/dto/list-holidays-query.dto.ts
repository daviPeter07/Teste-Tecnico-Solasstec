import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { parseBooleanQuery } from '@/common/dto/parse-boolean-query';

export class ListHolidaysQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Busca por descrição ou data AAAA-MM-DD',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: '2026-08-01', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-08-31', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ default: true })
  @Type(() => String)
  @Transform(({ value }: { value: unknown }) => parseBooleanQuery(value, true))
  @IsBoolean()
  @IsOptional()
  active: boolean = true;
}
