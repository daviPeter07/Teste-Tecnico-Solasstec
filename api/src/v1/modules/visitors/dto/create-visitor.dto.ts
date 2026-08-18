import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export const DOCUMENT_TYPES = ['CPF', 'RG'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export class CreateVisitorDto {
  @ApiProperty({ example: 'Maria da Silva', maxLength: 100 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ enum: DOCUMENT_TYPES, example: 'CPF' })
  @IsIn(DOCUMENT_TYPES)
  documentType!: DocumentType;

  @ApiProperty({ example: '123.456.789-09', maxLength: 20 })
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  document!: string;

  @ApiProperty({ example: '1960-05-20', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'birthDate must use the YYYY-MM-DD format',
  })
  birthDate!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  hasDisability!: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/visitor.jpg' })
  @IsUrl({ require_protocol: true })
  @MaxLength(255)
  @IsOptional()
  photo?: string;
}
