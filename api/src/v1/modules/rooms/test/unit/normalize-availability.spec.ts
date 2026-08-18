import { normalizeAvailability } from '../../utils/normalize-availability';

describe('normalizeAvailability', () => {
  it('sorts weekdays and opening times', () => {
    expect(
      normalizeAvailability([
        { dayOfWeek: 2, opensAt: '13:00', closesAt: '18:00' },
        { dayOfWeek: 1, opensAt: '08:00', closesAt: '12:00' },
        { dayOfWeek: 2, opensAt: '08:00', closesAt: '12:00' },
      ]),
    ).toEqual([
      { dayOfWeek: 1, opensAt: '08:00', closesAt: '12:00' },
      { dayOfWeek: 2, opensAt: '08:00', closesAt: '12:00' },
      { dayOfWeek: 2, opensAt: '13:00', closesAt: '18:00' },
    ]);
  });

  it('rejects closing before opening', () => {
    expect(() =>
      normalizeAvailability([
        { dayOfWeek: 1, opensAt: '18:00', closesAt: '08:00' },
      ]),
    ).toThrow();
  });

  it('rejects overlapping periods on the same weekday', () => {
    expect(() =>
      normalizeAvailability([
        { dayOfWeek: 1, opensAt: '08:00', closesAt: '12:00' },
        { dayOfWeek: 1, opensAt: '11:00', closesAt: '18:00' },
      ]),
    ).toThrow();
  });
});
