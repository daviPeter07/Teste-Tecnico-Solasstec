import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'Sistema operando normalmente.' })
  message!: string;
}
