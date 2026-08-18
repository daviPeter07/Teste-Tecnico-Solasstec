import { NotFoundException } from '../not-found.exception';

export class AppointmentNotFoundException extends NotFoundException {
  constructor() {
    super('APPOINTMENT_NOT_FOUND', 'Agendamento não encontrado.');
  }
}
