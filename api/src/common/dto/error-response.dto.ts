import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 503 })
  statusCode!: number;

  @ApiProperty({ example: 'DATABASE_UNAVAILABLE' })
  code!: string;

  @ApiProperty({ example: 'Database is unavailable.' })
  message!: string;

  @ApiProperty({ example: '2026-08-14T17:30:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/api/v1/health' })
  path!: string;

  @ApiPropertyOptional({ description: 'Additional error context.' })
  details?: unknown;
}
