import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class ListRoomsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Busca por sala ou responsável' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  search?: string;

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
}
