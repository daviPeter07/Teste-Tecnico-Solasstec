import { NotFoundException } from '../not-found.exception';

export class RoomNotFoundException extends NotFoundException {
  constructor() {
    super('ROOM_NOT_FOUND', 'Sala não encontrada.');
  }
}
