import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { parseBooleanQuery } from '@/common/dto/parse-boolean-query';

export class ListRoomsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Busca por sala ou responsável' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: true })
  @Type(() => String)
  @Transform(({ value }: { value: unknown }) => parseBooleanQuery(value, true))
  @IsBoolean()
  @IsOptional()
  active: boolean = true;
}
