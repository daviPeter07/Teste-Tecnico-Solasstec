import { NotFoundException } from '../not-found.exception';

export class VisitorNotFoundException extends NotFoundException {
  constructor() {
    super('VISITOR_NOT_FOUND', 'Visitante não encontrado.');
  }
}
