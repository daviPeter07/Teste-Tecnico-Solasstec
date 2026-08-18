import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class VisitorDocumentConflictException extends AppException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      'VISITOR_DOCUMENT_CONFLICT',
      'Já existe um visitante com este documento.',
    );
  }
}
