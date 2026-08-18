import { describe, expect, it } from "vitest";
import { formatDaySequence, formatRoomSchedule, normalize } from "./normalize";

describe("normalize", () => {
  describe("onlyDigits", () => {
    it("should remove non-numeric characters", () => {
      expect(normalize.onlyDigits("123.456.789-00")).toBe("12345678900");
      expect(normalize.onlyDigits("abc-123")).toBe("123");
      expect(normalize.onlyDigits("")).toBe("");
    });
  });

  describe("cpf", () => {
    it("should format valid CPF numbers with mask", () => {
      expect(normalize.cpf("12345678901")).toBe("123.456.789-01");
      expect(normalize.cpf("123456")).toBe("123.456");
      expect(normalize.cpf("1234")).toBe("123.4");
      expect(normalize.cpf("")).toBe("");
    });

    it("should limit CPF input to 11 digits", () => {
      expect(normalize.cpf("12345678901999")).toBe("123.456.789-01");
    });
  });

  describe("status and uppercase", () => {
    it("should convert status to uppercase", () => {
      expect(normalize.status("ativa")).toBe("ATIVA");
      expect(normalize.status("  disponivel  ")).toBe("DISPONIVEL");
      expect(normalize.status("")).toBe("");
    });

    it("should convert string to uppercase", () => {
      expect(normalize.uppercase("prioritário")).toBe("PRIORITÁRIO");
    });
  });

  describe("formatDaySequence", () => {
    it("should format weekdays sequence", () => {
      expect(formatDaySequence([1, 2, 3, 4, 5])).toBe("Seg a Sex");
    });

    it("should format weekend sequence", () => {
      expect(formatDaySequence([6, 0])).toBe("Sáb e Dom");
    });

    it("should format all days sequence", () => {
      expect(formatDaySequence([1, 2, 3, 4, 5, 6, 0])).toBe("Todos os dias");
    });

    it("should format non-contiguous day list", () => {
      expect(formatDaySequence([1, 3, 5])).toBe("Seg, Qua e Sex");
    });
  });

  describe("formatRoomSchedule", () => {
    it("should group days with identical schedule times", () => {
      const availability = [
        { dayOfWeek: 1, opensAt: "08:00", closesAt: "18:00" },
        { dayOfWeek: 2, opensAt: "08:00", closesAt: "18:00" },
        { dayOfWeek: 3, opensAt: "08:00", closesAt: "18:00" },
        { dayOfWeek: 4, opensAt: "08:00", closesAt: "18:00" },
        { dayOfWeek: 5, opensAt: "08:00", closesAt: "18:00" },
      ];

      const groups = formatRoomSchedule(availability);
      expect(groups).toEqual([
        { daysLabel: "Seg a Sex", timeLabel: "08:00 - 18:00" },
      ]);
    });
  });
});
