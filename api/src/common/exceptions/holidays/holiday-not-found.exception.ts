import { NotFoundException } from '../not-found.exception';

export class HolidayNotFoundException extends NotFoundException {
  constructor() {
    super('HOLIDAY_NOT_FOUND', 'Feriado não encontrado.');
  }
}
