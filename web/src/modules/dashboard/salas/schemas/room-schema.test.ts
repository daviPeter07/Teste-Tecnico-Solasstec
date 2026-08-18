import { describe, expect, it } from "vitest";
import { roomFormSchema } from "./room-schema";

const validRoom = {
  name: "Sala Horizonte",
  capacity: 12,
  responsibleName: "Ana Souza",
  availability: [{ dayOfWeek: 1, opensAt: "08:00", closesAt: "18:00" }],
};

describe("roomFormSchema", () => {
  it("accepts a valid room", () => {
    expect(roomFormSchema.safeParse(validRoom).success).toBe(true);
  });

  it("rejects zero capacity and overlapping periods", () => {
    const result = roomFormSchema.safeParse({
      ...validRoom,
      capacity: 0,
      availability: [
        { dayOfWeek: 1, opensAt: "08:00", closesAt: "12:00" },
        { dayOfWeek: 1, opensAt: "11:00", closesAt: "18:00" },
      ],
    });

    expect(result.success).toBe(false);
  });
});
