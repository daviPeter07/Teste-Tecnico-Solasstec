import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class RoomNameConflictException extends AppException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      'ROOM_NAME_CONFLICT',
      'Já existe uma sala com este nome.',
    );
  }
}
