"use client";

import { useState } from "react";
import { HolidayCalendar } from "./holiday-calendar";
import type { Holiday } from "../schemas/holiday-schema";

export interface HolidayListProps {
  onEditHoliday?: (holiday: Holiday) => void;
  onCreateHoliday?: (date?: string) => void;
  onDeleteHoliday?: (holiday: Holiday) => void;
}

export function HolidayList({
  onEditHoliday,
  onCreateHoliday,
  onDeleteHoliday,
}: HolidayListProps) {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  return (
    <section className="space-y-5">
      <HolidayCalendar
        month={calendarMonth}
        selectedDate={selectedCalendarDate}
        onMonthChange={setCalendarMonth}
        onCreateHoliday={(date) => onCreateHoliday?.(date)}
        onFocusHolidayDate={(date) => setSelectedCalendarDate(date)}
        onEditHoliday={onEditHoliday}
        onDeleteHoliday={onDeleteHoliday}
      />

      {/* Lista detalhada desativada temporariamente.
          A tela agora fica só com o calendário. Se quiser voltar,
          restaure aqui o bloco de busca, tabela desktop, cards mobile e paginação. */}
    </section>
  );
}
