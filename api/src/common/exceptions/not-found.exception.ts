import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  constructor(code: string, message: string) {
    super(HttpStatus.NOT_FOUND, code, message);
  }
}
