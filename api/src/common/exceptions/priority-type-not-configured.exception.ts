import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class PriorityTypeNotConfiguredException extends AppException {
  constructor() {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'PRIORITY_TYPE_NOT_CONFIGURED',
      'A classificação de prioridade não está configurada.',
    );
  }
}
