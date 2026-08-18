import { describe, expect, it } from "vitest";
import { visitorFormSchema } from "./visitor-schema";

describe("visitorFormSchema", () => {
  it("accepts valid CPF for visitor registration", () => {
    expect(
      visitorFormSchema.safeParse({
        name: "Maria da Silva",
        documentType: "CPF",
        document: "529.982.247-25",
        birthDate: "1960-01-01",
        hasDisability: false,
        photo: "",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid CPF number", () => {
    expect(
      visitorFormSchema.safeParse({
        name: "Maria da Silva",
        documentType: "CPF",
        document: "111.111.111-11",
        birthDate: "1960-01-01",
        hasDisability: false,
        photo: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing personal data", () => {
    expect(
      visitorFormSchema.safeParse({
        name: "",
        documentType: "CPF",
        document: "",
        birthDate: "",
        hasDisability: false,
        photo: "",
      }).success,
    ).toBe(false);
  });
});
