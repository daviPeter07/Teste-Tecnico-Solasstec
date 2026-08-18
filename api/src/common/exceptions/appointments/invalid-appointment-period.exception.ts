import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class InvalidAppointmentPeriodException extends AppException {
  constructor(message = 'O período do agendamento é inválido.') {
    super(HttpStatus.BAD_REQUEST, 'INVALID_APPOINTMENT_PERIOD', message);
  }
}
