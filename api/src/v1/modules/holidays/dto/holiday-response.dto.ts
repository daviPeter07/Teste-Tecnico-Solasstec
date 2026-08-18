import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';

export class HolidayResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ example: '2026-12-25' })
  date!: string;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional({
    nullable: true,
    description: '1=NACIONAL, 2=ESTADUAL, 3=MUNICIPAL',
  })
  type!: number | null;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  createdAt!: string;
}

export class HolidayListResponseDto {
  @ApiProperty({ type: [HolidayResponseDto] })
  data!: HolidayResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
