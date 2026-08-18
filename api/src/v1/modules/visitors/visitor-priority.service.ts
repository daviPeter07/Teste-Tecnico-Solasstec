import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvalidBirthDateException } from '@/common/exceptions';

@Injectable()
export class VisitorPriorityService {
  constructor(private readonly configService: ConfigService) {}

  calculateLevel(
    birthDate: string,
    hasDisability: boolean,
    today = new Date(),
  ): number {
    const [year, month, day] = birthDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    const businessDate = this.getBusinessDate(today);

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day ||
      year > businessDate.year ||
      (year === businessDate.year && month > businessDate.month) ||
      (year === businessDate.year &&
        month === businessDate.month &&
        day > businessDate.day)
    ) {
      throw new InvalidBirthDateException();
    }

    let age = businessDate.year - year;
    const birthdayHasPassed =
      businessDate.month > month ||
      (businessDate.month === month && businessDate.day >= day);

    if (!birthdayHasPassed) age -= 1;

    const isSenior = age >= 60;
    if (isSenior && hasDisability) return 3;
    if (hasDisability) return 2;
    if (isSenior) return 1;
    return 0;
  }

  private getBusinessDate(date: Date) {
    const timeZone = this.configService.getOrThrow<string>(
      'app.businessTimeZone',
    );
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(date);

    const readPart = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value);

    return {
      year: readPart('year'),
      month: readPart('month'),
      day: readPart('day'),
    };
  }
}
