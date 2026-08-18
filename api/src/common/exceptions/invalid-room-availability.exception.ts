import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class InvalidRoomAvailabilityException extends AppException {
  constructor(message: string) {
    super(HttpStatus.BAD_REQUEST, 'INVALID_ROOM_AVAILABILITY', message);
  }
}
