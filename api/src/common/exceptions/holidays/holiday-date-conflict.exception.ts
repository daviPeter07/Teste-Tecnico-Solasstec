import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class HolidayDateConflictException extends AppException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      'HOLIDAY_DATE_CONFLICT',
      'Já existe um feriado cadastrado para esta data.',
    );
  }
}
