import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

export function ApiErrorResponses(...statuses: HttpStatus[]): MethodDecorator {
  return applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({
        status,
        description: HttpStatus[status],
        type: ErrorResponseDto,
      }),
    ),
  );
}
