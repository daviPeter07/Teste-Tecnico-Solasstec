import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const priorityTypes = [
  {
    description: 'Visitante sem critério de prioridade.',
    priorityLevel: 0,
  },
  {
    description: 'Visitante com idade igual ou superior a 60 anos.',
    priorityLevel: 1,
  },
  {
    description: 'Visitante que informou possuir deficiência.',
    priorityLevel: 2,
  },
  {
    description: 'Visitante que atende aos dois critérios de prioridade.',
    priorityLevel: 3,
  },
] as const;

type SeedTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

const seedRooms = [
  {
    name: 'Sala 01',
    capacity: 6,
    responsibleName: 'Responsavel Sala 01',
    availability: [
      { dayOfWeek: 1, opensAt: '08:00', closesAt: '12:00' },
      { dayOfWeek: 2, opensAt: '09:00', closesAt: '17:00' },
      { dayOfWeek: 3, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 4, opensAt: '08:00', closesAt: '12:00' },
      { dayOfWeek: 5, opensAt: '10:00', closesAt: '16:00' },
    ],
  },
  {
    name: 'Sala 02',
    capacity: 8,
    responsibleName: 'Responsavel Sala 02',
    availability: [
      { dayOfWeek: 1, opensAt: '10:00', closesAt: '16:00' },
      { dayOfWeek: 2, opensAt: '08:00', closesAt: '12:00' },
      { dayOfWeek: 2, opensAt: '13:00', closesAt: '18:00' },
      { dayOfWeek: 3, opensAt: '09:00', closesAt: '18:00' },
      { dayOfWeek: 4, opensAt: '08:00', closesAt: '18:00' },
      { dayOfWeek: 5, opensAt: '08:00', closesAt: '15:00' },
    ],
  },
  {
    name: 'Sala 03',
    capacity: 10,
    responsibleName: 'Responsavel Sala 03',
    availability: [
      { dayOfWeek: 1, opensAt: '09:00', closesAt: '13:00' },
      { dayOfWeek: 3, opensAt: '13:00', closesAt: '18:00' },
      { dayOfWeek: 4, opensAt: '12:00', closesAt: '17:00' },
      { dayOfWeek: 5, opensAt: '09:00', closesAt: '12:00' },
    ],
  },
  {
    name: 'Sala 04',
    capacity: 12,
    responsibleName: 'Responsavel Sala 04',
    availability: [
      { dayOfWeek: 1, opensAt: '07:00', closesAt: '15:00' },
      { dayOfWeek: 2, opensAt: '12:00', closesAt: '18:00' },
      { dayOfWeek: 4, opensAt: '08:00', closesAt: '14:00' },
      { dayOfWeek: 5, opensAt: '08:00', closesAt: '12:00' },
      { dayOfWeek: 6, opensAt: '09:00', closesAt: '12:00' },
    ],
  },
] as const;

const seedHolidays = [
  { date: '2026-09-07', description: 'Independencia do Brasil', type: 1 },
  { date: '2026-10-12', description: 'Nossa Senhora Aparecida', type: 1 },
  { date: '2026-11-02', description: 'Finados', type: 1 },
  { date: '2026-11-20', description: 'Consciencia Negra', type: 1 },
  { date: '2026-12-25', description: 'Natal', type: 1 },
] as const;

const seedVisitorProfiles = [
  { birthDate: '1992-01-10', hasDisability: false },
  { birthDate: '1988-02-11', hasDisability: false },
  { birthDate: '1995-03-12', hasDisability: true },
  { birthDate: '1958-04-13', hasDisability: false },
  { birthDate: '1962-05-14', hasDisability: false },
  { birthDate: '1985-06-15', hasDisability: true },
  { birthDate: '1990-07-16', hasDisability: false },
  { birthDate: '1955-08-17', hasDisability: true },
  { birthDate: '1999-09-18', hasDisability: true },
  { birthDate: '1978-10-19', hasDisability: false },
] as const;

const seedRgVisitorProfiles = [
  {
    name: 'Visitante RG 01',
    document: 'RG100001X',
    birthDate: '1993-11-20',
    hasDisability: false,
  },
  {
    name: 'Visitante RG 02',
    document: 'RG100002X',
    birthDate: '1961-12-21',
    hasDisability: false,
  },
  {
    name: 'Visitante RG 03',
    document: 'RG100003X',
    birthDate: '1989-01-22',
    hasDisability: true,
  },
  {
    name: 'Visitante RG 04',
    document: 'RG100004X',
    birthDate: '1959-02-23',
    hasDisability: true,
  },
] as const;

const seedAppointments = [
  {
    visitorIndex: 0,
    roomIndex: 0,
    date: '2026-08-20',
    startsAt: '08:00',
    status: 2,
    active: true,
  },
  {
    visitorIndex: 1,
    roomIndex: 0,
    date: '2026-08-20',
    startsAt: '08:00',
    status: 1,
    active: true,
  },
  {
    visitorIndex: 2,
    roomIndex: 1,
    date: '2026-08-20',
    startsAt: '09:00',
    status: 2,
    active: true,
  },
  {
    visitorIndex: 3,
    roomIndex: 2,
    date: '2026-08-21',
    startsAt: '10:00',
    status: 1,
    active: true,
  },
  {
    visitorIndex: 4,
    roomIndex: 0,
    date: '2026-08-21',
    startsAt: '11:00',
    status: 2,
    active: true,
  },
  {
    visitorIndex: 5,
    roomIndex: 3,
    date: '2026-08-25',
    startsAt: '14:00',
    status: 2,
    active: true,
  },
  {
    visitorIndex: 6,
    roomIndex: 1,
    date: '2026-08-26',
    startsAt: '15:00',
    status: 1,
    active: true,
  },
  {
    visitorIndex: 7,
    roomIndex: 2,
    date: '2026-08-27',
    startsAt: '16:00',
    status: 2,
    active: true,
  },
  {
    visitorIndex: 8,
    roomIndex: 3,
    date: '2026-08-28',
    startsAt: '08:00',
    status: 3,
    active: false,
  },
  {
    visitorIndex: 9,
    roomIndex: 1,
    date: '2026-08-28',
    startsAt: '13:00',
    status: 4,
    active: true,
  },
] as const;

function dateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function businessDateTime(value: string, time: string) {
  return new Date(`${value}T${time}:00.000-04:00`);
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function calculateCpfDigit(digits: string) {
  const sum = digits
    .split('')
    .reduce(
      (total, digit, index) =>
        total + Number(digit) * (digits.length + 1 - index),
      0,
    );
  const digit = (sum * 10) % 11;
  return digit === 10 ? 0 : digit;
}

function generateCpf(index: number) {
  const base = String(100000000 + index).padStart(9, '0');
  const firstDigit = calculateCpfDigit(base);
  const secondDigit = calculateCpfDigit(`${base}${firstDigit}`);
  return `${base}${firstDigit}${secondDigit}`;
}

function getPriorityLevel(birthDate: string, hasDisability: boolean) {
  const today = new Date();
  const seniorLimit = Date.UTC(
    today.getUTCFullYear() - 60,
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const isSenior = dateOnly(birthDate).getTime() <= seniorLimit;
  if (isSenior && hasDisability) return 3;
  if (hasDisability) return 2;
  if (isSenior) return 1;
  return 0;
}

async function upsertRoom(
  transaction: SeedTransaction,
  input: (typeof seedRooms)[number],
) {
  const now = new Date();
  const availability = input.availability as unknown as Prisma.InputJsonValue;
  const existingRoom = await transaction.room.findFirst({
    where: { name: input.name },
    include: {
      responsibleHistory: {
        where: { active: true, validUntil: null },
        orderBy: { validFrom: 'desc' },
        take: 1,
      },
      availabilityHistory: {
        where: { active: true, validUntil: null },
        orderBy: { validFrom: 'desc' },
        take: 1,
      },
    },
  });

  if (!existingRoom) {
    return transaction.room.create({
      data: {
        name: input.name,
        capacity: input.capacity,
        availability,
        active: true,
        responsibleHistory: {
          create: { name: input.responsibleName, validFrom: now },
        },
        availabilityHistory: {
          create: { availability, validFrom: now },
        },
      },
    });
  }

  const room = await transaction.room.update({
    where: { id: existingRoom.id },
    data: {
      name: input.name,
      capacity: input.capacity,
      availability,
      active: true,
    },
  });

  const currentResponsible = existingRoom.responsibleHistory[0];
  if (currentResponsible?.name !== input.responsibleName) {
    if (currentResponsible) {
      await transaction.roomResponsible.update({
        where: { id: currentResponsible.id },
        data: { active: false, validUntil: now },
      });
    }

    await transaction.roomResponsible.create({
      data: {
        roomId: existingRoom.id,
        name: input.responsibleName,
        validFrom: now,
      },
    });
  }

  const currentAvailability = existingRoom.availabilityHistory[0];
  if (
    JSON.stringify(existingRoom.availability) !==
    JSON.stringify(input.availability)
  ) {
    if (currentAvailability) {
      await transaction.roomAvailabilityHistory.update({
        where: { id: currentAvailability.id },
        data: { active: false, validUntil: now },
      });
    }

    await transaction.roomAvailabilityHistory.create({
      data: {
        roomId: existingRoom.id,
        availability,
        validFrom: now,
      },
    });
  }

  return room;
}

async function upsertAppointment(
  transaction: SeedTransaction,
  input: {
    visitorId: number;
    roomId: number;
    date: string;
    startsAt: string;
    status: number;
    active: boolean;
  },
) {
  const startsAt = businessDateTime(input.date, input.startsAt);
  const endsAt = addHours(startsAt, 1);
  const existingAppointment = await transaction.appointment.findFirst({
    where: {
      visitorId: input.visitorId,
      roomId: input.roomId,
      startsAt,
    },
  });

  const data = {
    visitorId: input.visitorId,
    roomId: input.roomId,
    startsAt,
    endsAt,
    status: input.status,
    active: input.active,
  };

  if (existingAppointment) {
    return transaction.appointment.update({
      where: { id: existingAppointment.id },
      data,
    });
  }

  return transaction.appointment.create({ data });
}

async function seed() {
  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(191923, 1)`;

    for (const priorityType of priorityTypes) {
      const existingPriorityType = await transaction.priorityType.findFirst({
        where: { description: priorityType.description },
        select: { id: true },
      });

      if (existingPriorityType) {
        await transaction.priorityType.update({
          where: { id: existingPriorityType.id },
          data: priorityType,
        });
      } else {
        await transaction.priorityType.create({ data: priorityType });
      }
    }

    const priorityTypesByLevel = await transaction.priorityType.findMany({
      select: { id: true, priorityLevel: true },
    });

    const priorityTypeIdByLevel = new Map(
      priorityTypesByLevel.map((priorityType) => [
        priorityType.priorityLevel,
        priorityType.id,
      ]),
    );

    const cpfVisitors = await Promise.all(
      seedVisitorProfiles.map((profile, index) => {
        const visitorNumber = String(index + 1).padStart(2, '0');
        const priorityLevel = getPriorityLevel(
          profile.birthDate,
          profile.hasDisability,
        );
        const priorityTypeId = priorityTypeIdByLevel.get(priorityLevel);

        if (!priorityTypeId) {
          throw new Error(
            `Priority type level ${priorityLevel} was not seeded.`,
          );
        }

        return transaction.visitor.upsert({
          where: { document: generateCpf(index + 1) },
          update: {
            name: `Visitante ${visitorNumber}`,
            documentType: 'CPF',
            birthDate: dateOnly(profile.birthDate),
            hasDisability: profile.hasDisability,
            priorityTypeId,
            photo: null,
            active: true,
          },
          create: {
            name: `Visitante ${visitorNumber}`,
            documentType: 'CPF',
            document: generateCpf(index + 1),
            birthDate: dateOnly(profile.birthDate),
            hasDisability: profile.hasDisability,
            priorityTypeId,
          },
        });
      }),
    );

    const rgVisitors = await Promise.all(
      seedRgVisitorProfiles.map((profile) => {
        const priorityLevel = getPriorityLevel(
          profile.birthDate,
          profile.hasDisability,
        );
        const priorityTypeId = priorityTypeIdByLevel.get(priorityLevel);

        if (!priorityTypeId) {
          throw new Error(
            `Priority type level ${priorityLevel} was not seeded.`,
          );
        }

        return transaction.visitor.upsert({
          where: { document: profile.document },
          update: {
            name: profile.name,
            documentType: 'RG',
            birthDate: dateOnly(profile.birthDate),
            hasDisability: profile.hasDisability,
            priorityTypeId,
            photo: null,
            active: true,
          },
          create: {
            name: profile.name,
            documentType: 'RG',
            document: profile.document,
            birthDate: dateOnly(profile.birthDate),
            hasDisability: profile.hasDisability,
            priorityTypeId,
          },
        });
      }),
    );

    const visitors = [...cpfVisitors, ...rgVisitors];

    const rooms = [];
    for (const room of seedRooms) {
      rooms.push(await upsertRoom(transaction, room));
    }

    await Promise.all(
      seedHolidays.map((holiday) =>
        transaction.holiday.upsert({
          where: { date: dateOnly(holiday.date) },
          update: {
            description: holiday.description,
            type: holiday.type,
            active: true,
          },
          create: {
            date: dateOnly(holiday.date),
            description: holiday.description,
            type: holiday.type,
          },
        }),
      ),
    );

    for (const appointment of seedAppointments) {
      await upsertAppointment(transaction, {
        visitorId: visitors[appointment.visitorIndex].id,
        roomId: rooms[appointment.roomIndex].id,
        date: appointment.date,
        startsAt: appointment.startsAt,
        status: appointment.status,
        active: appointment.active,
      });
    }
  });
}

seed()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
