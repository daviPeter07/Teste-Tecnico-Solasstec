export interface FormattedScheduleGroup {
  daysLabel: string;
  timeLabel: string;
}

const DAY_NAMES: Record<number, string> = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
  0: "Dom",
};

const NATURAL_ORDER = [1, 2, 3, 4, 5, 6, 0];

/**
 * Formata uma sequência de números de dias da semana em rótulo amigável.
 * Ex: [1,2,3,4,5] -> "Seg a Sex", [1,3,5] -> "Seg, Qua e Sex", [6,0] -> "Sáb e Dom"
 */
export function formatDaySequence(days: number[]): string {
  if (!days || days.length === 0) return "";

  const sorted = days.slice().sort((a, b) => {
    return NATURAL_ORDER.indexOf(Number(a)) - NATURAL_ORDER.indexOf(Number(b));
  });

  if (sorted.length === 7) return "Todos os dias";
  if (sorted.length === 5 && sorted.every((d, i) => d === i + 1)) return "Seg a Sex";
  if (sorted.length === 2 && sorted.includes(6) && sorted.includes(0)) return "Sáb e Dom";
  if (sorted.length === 1) return DAY_NAMES[sorted[0]] ?? "";

  const indices = sorted.map((d) => NATURAL_ORDER.indexOf(d));
  let isContiguous = true;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) {
      isContiguous = false;
      break;
    }
  }

  if (isContiguous && sorted.length >= 3) {
    const first = DAY_NAMES[sorted[0]];
    const last = DAY_NAMES[sorted[sorted.length - 1]];
    return `${first} a ${last}`;
  }

  const names = sorted.map((d) => DAY_NAMES[d]);
  if (names.length === 2) {
    return `${names[0]} e ${names[1]}`;
  }

  const last = names.pop();
  return `${names.join(", ")} e ${last}`;
}

/**
 * Agrupa os horários de uma sala com base nos mesmos horários de abertura e fechamento
 * e retorna rótulos formatados com dias em destaque.
 */
export function formatRoomSchedule(
  availability?: { dayOfWeek: unknown; opensAt: string; closesAt: string }[] | null,
): FormattedScheduleGroup[] {
  if (!availability || availability.length === 0) {
    return [{ daysLabel: "Sem expediente", timeLabel: "" }];
  }

  const map = new Map<
    string,
    { days: number[]; opensAt: string; closesAt: string }
  >();

  for (const item of availability) {
    const dayNumber = Number(item.dayOfWeek);
    const key = `${item.opensAt}-${item.closesAt}`;
    if (!map.has(key)) {
      map.set(key, {
        days: [dayNumber],
        opensAt: item.opensAt,
        closesAt: item.closesAt,
      });
    } else {
      map.get(key)!.days.push(dayNumber);
    }
  }

  return Array.from(map.values()).map((g) => ({
    daysLabel: formatDaySequence(g.days),
    timeLabel: `${g.opensAt} - ${g.closesAt}`,
  }));
}

export const normalize = {
  /**
   * Remove todos os caracteres não numéricos.
   */
  onlyDigits: (value: string): string => {
    return value ? value.replace(/\D/g, "") : "";
  },

  /**
   * Aplica máscara de CPF (000.000.000-00).
   */
  cpf: (value: string): string => {
    const digits = value ? value.replace(/\D/g, "").slice(0, 11) : "";
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  },

  /**
   * Converte qualquer texto de status para LETRAS MAIÚSCULAS.
   */
  status: (value: string): string => {
    return value ? String(value).trim().toUpperCase() : "";
  },

  /**
   * Converte qualquer texto para LETRAS MAIÚSCULAS.
   */
  uppercase: (value: string): string => {
    return value ? String(value).toUpperCase() : "";
  },
};
