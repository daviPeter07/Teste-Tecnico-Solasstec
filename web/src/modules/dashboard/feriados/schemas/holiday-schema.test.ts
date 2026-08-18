import { describe, expect, it } from "vitest";
import { holidayFormSchema } from "./holiday-schema";

describe("holidayFormSchema", () => {
  it("accepts a valid holiday", () => {
    expect(
      holidayFormSchema.parse({
        date: "2026-12-25",
        description: "Natal",
        type: 1,
      }),
    ).toEqual({ date: "2026-12-25", description: "Natal", type: 1 });
  });

  it("rejects invalid calendar dates", () => {
    expect(() =>
      holidayFormSchema.parse({
        date: "2026-02-31",
        description: "Data inválida",
        type: null,
      }),
    ).toThrow();
  });
});
