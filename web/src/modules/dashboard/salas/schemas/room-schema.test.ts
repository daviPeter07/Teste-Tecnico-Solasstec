import { describe, expect, it } from "vitest";
import { createRoomFormSchema, roomFormSchema } from "./room-schema";

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

describe("createRoomFormSchema", () => {
  it("rejects a name that already exists, case-insensitively", () => {
    const result = createRoomFormSchema(["sala HORIZONTE"]).safeParse(validRoom);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      path: ["name"],
      message: "Já existe uma sala com este nome.",
    });
  });

  it("accepts a name not present in the taken names", () => {
    const result = createRoomFormSchema(["Sala Aurora"]).safeParse(validRoom);

    expect(result.success).toBe(true);
  });

  it("accepts the same name when no taken names are provided", () => {
    expect(createRoomFormSchema([]).safeParse(validRoom).success).toBe(true);
  });
});
