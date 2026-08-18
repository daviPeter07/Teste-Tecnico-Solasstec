import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class InvalidBirthDateException extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      'INVALID_BIRTH_DATE',
      'A data de nascimento é inválida.',
    );
  }
}
