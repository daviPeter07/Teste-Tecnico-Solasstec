import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class RoomNotFoundException extends AppException {
  constructor() {
    super(HttpStatus.NOT_FOUND, 'ROOM_NOT_FOUND', 'Sala não encontrada.');
  }
}
