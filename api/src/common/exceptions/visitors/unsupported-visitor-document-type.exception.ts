import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class UnsupportedVisitorDocumentTypeException extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      'UNSUPPORTED_VISITOR_DOCUMENT_TYPE',
      'Este cadastro possui um tipo de documento não suportado pela versão atual.',
    );
  }
}
