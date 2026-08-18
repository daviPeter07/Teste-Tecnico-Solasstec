import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export interface AppointmentSuggestion {
  startsAt: string;
  endsAt: string;
}

export class AppointmentUnavailableException extends AppException {
  constructor(message: string, suggestion: AppointmentSuggestion | null) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, 'APPOINTMENT_UNAVAILABLE', message, {
      suggestion,
    });
  }
}
