import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class VisitorNotFoundException extends AppException {
  constructor() {
    super(
      HttpStatus.NOT_FOUND,
      'VISITOR_NOT_FOUND',
      'Visitante não encontrado.',
    );
  }
}
