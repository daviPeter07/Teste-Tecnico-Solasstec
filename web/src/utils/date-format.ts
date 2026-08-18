export function formatDateOnly(
  date: string,
  dateStyle: Intl.DateTimeFormatOptions["dateStyle"] = "medium",
) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle,
    timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T00:00:00.000Z`));
}

export function formatDateTimeInManaus(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Manaus",
  }).format(new Date(value));
}

export function getDateOnlyInTimeZone(
  date = new Date(),
  timeZone = "America/Manaus",
) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function daysBetweenDateOnly(startDate: string, endDate: string) {
  const start = new Date(`${startDate.slice(0, 10)}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate.slice(0, 10)}T00:00:00.000Z`).getTime();
  return Math.max(0, Math.round((end - start) / 86400000));
}

export function isValidDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
