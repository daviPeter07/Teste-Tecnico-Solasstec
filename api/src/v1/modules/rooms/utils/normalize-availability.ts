import { InvalidRoomAvailabilityException } from '@/common/exceptions';
import { RoomAvailabilityDto } from '../dto/room-availability.dto';

export function normalizeAvailability(
  input: RoomAvailabilityDto[],
): RoomAvailabilityDto[] {
  const availability = input
    .map((period) => ({ ...period }))
    .sort(
      (left, right) =>
        left.dayOfWeek - right.dayOfWeek ||
        left.opensAt.localeCompare(right.opensAt),
    );

  for (let index = 0; index < availability.length; index += 1) {
    const current = availability[index];
    if (current.opensAt >= current.closesAt) {
      throwInvalidAvailability(
        'O horário de abertura deve ser anterior ao fechamento.',
      );
    }

    const previous = availability[index - 1];
    if (
      previous &&
      previous.dayOfWeek === current.dayOfWeek &&
      previous.closesAt > current.opensAt
    ) {
      throwInvalidAvailability(
        'Os horários de funcionamento não podem se sobrepor.',
      );
    }
  }

  return availability;
}

function throwInvalidAvailability(message: string): never {
  throw new InvalidRoomAvailabilityException(message);
}
