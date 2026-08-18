import { describe, expect, it } from "vitest";
import { appointmentFormSchema, appointmentSlotsSchema } from "./appointment-schema";

describe("appointmentFormSchema", () => {
  it("accepts a valid appointment period", () => {
    expect(
      appointmentFormSchema.safeParse({
        visitorId: 1,
        roomId: 1,
        date: "2026-08-20",
        startsAt: "09:00",
      }).success,
    ).toBe(true);
  });

  it("rejects missing visitor and room", () => {
    const result = appointmentFormSchema.safeParse({
      visitorId: 0,
      roomId: 0,
      date: "2026-08-20",
      startsAt: "09:00",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing appointment time", () => {
    const result = appointmentFormSchema.safeParse({
      visitorId: 1,
      roomId: 1,
      date: "2026-08-20",
      startsAt: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts an optional slot suggestion", () => {
    expect(
      appointmentSlotsSchema.safeParse({
        date: "2026-08-20",
        slots: [],
        suggestion: {
          date: "2026-08-21",
          opensAt: "08:00",
          closesAt: "17:00",
          startsAt: "08:00",
          endsAt: "09:00",
        },
      }).success,
    ).toBe(true);
  });
});
