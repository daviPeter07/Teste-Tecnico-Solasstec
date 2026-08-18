import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class InvalidHolidayDateException extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      'INVALID_HOLIDAY_DATE',
      'Informe uma data de feriado válida no formato AAAA-MM-DD.',
    );
  }
}
