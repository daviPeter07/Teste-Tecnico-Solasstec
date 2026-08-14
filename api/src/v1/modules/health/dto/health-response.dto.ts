import { ApiProperty } from '@nestjs/swagger';

export class DependencyHealthDto {
  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  status!: 'up' | 'down';

  @ApiProperty({ example: 12 })
  latencyMs!: number;
}

export class HealthChecksDto {
  @ApiProperty({ type: DependencyHealthDto })
  database!: DependencyHealthDto;
}

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  status!: 'ok';

  @ApiProperty({ example: 'solasstec-portaria-api' })
  service!: string;

  @ApiProperty({ example: '2026-08-14T17:30:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: 120.45 })
  uptimeSeconds!: number;

  @ApiProperty({ type: HealthChecksDto })
  checks!: HealthChecksDto;
}
