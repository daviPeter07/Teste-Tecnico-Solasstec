import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class SystemUnavailableException extends AppException {
  constructor() {
    super(
      HttpStatus.SERVICE_UNAVAILABLE,
      'SYSTEM_UNAVAILABLE',
      'Sistema indisponível temporariamente.',
    );
  }
}
