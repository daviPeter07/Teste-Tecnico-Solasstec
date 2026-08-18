import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class InvalidVisitorDocumentException extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      'INVALID_VISITOR_DOCUMENT',
      'O documento informado é inválido.',
    );
  }
}
