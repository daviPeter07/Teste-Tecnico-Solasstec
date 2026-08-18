import { ConfigService } from '@nestjs/config';
import { VisitorPriorityService } from '../../visitor-priority.service';

describe('VisitorPriorityService', () => {
  const service = new VisitorPriorityService({
    getOrThrow: jest.fn().mockReturnValue('America/Manaus'),
  } as unknown as ConfigService);
  const today = new Date('2026-08-15T12:00:00.000Z');

  it.each([
    ['1990-01-01', false, 0],
    ['1966-08-15', false, 1],
    ['1990-01-01', true, 2],
    ['1960-01-01', true, 3],
  ])(
    'calculates the expected level for birthDate=%s disability=%s',
    (birthDate, hasDisability, expectedLevel) => {
      expect(service.calculateLevel(birthDate, hasDisability, today)).toBe(
        expectedLevel,
      );
    },
  );

  it('does not grant age priority one day before the 60th birthday', () => {
    expect(service.calculateLevel('1966-08-16', false, today)).toBe(0);
  });

  it('uses the business date instead of UTC at the birthday boundary', () => {
    const beforeMidnightInManaus = new Date('2026-08-15T03:00:00.000Z');
    expect(
      service.calculateLevel('1966-08-15', false, beforeMidnightInManaus),
    ).toBe(0);
  });

  it('rejects invalid and future dates', () => {
    expect(() => service.calculateLevel('2026-02-30', false, today)).toThrow();
    expect(() => service.calculateLevel('2026-08-16', false, today)).toThrow();
  });
});
