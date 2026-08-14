import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'Banco de dados conectado.' })
  message!: string;
}
