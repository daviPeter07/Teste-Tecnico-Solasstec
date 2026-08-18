import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class InvalidAppointmentStatusTransitionException extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      'INVALID_APPOINTMENT_STATUS_TRANSITION',
      'A mudança de status solicitada não é permitida para este agendamento.',
    );
  }
}
