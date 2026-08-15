import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '@/common/decorators/api-error-responses.decorator';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check database connection' })
  @ApiOkResponse({ type: HealthResponseDto })
  @ApiErrorResponses(HttpStatus.SERVICE_UNAVAILABLE)
  check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}
