import { describe, expect, it } from "vitest";
import { isValidCpf, zodCpfSchema } from "./validators";

describe("validators", () => {
  describe("isValidCpf", () => {
    it("should validate a correct CPF", () => {
      expect(isValidCpf("52998224725")).toBe(true);
      expect(isValidCpf("529.982.247-25")).toBe(true);
    });

    it("should reject an invalid CPF checksum", () => {
      expect(isValidCpf("52998224700")).toBe(false);
    });

    it("should reject CPF with all identical digits", () => {
      expect(isValidCpf("11111111111")).toBe(false);
      expect(isValidCpf("00000000000")).toBe(false);
    });

    it("should reject CPF with wrong digit count", () => {
      expect(isValidCpf("123456")).toBe(false);
    });
  });

  describe("zod schemas", () => {
    it("should validate CPF schema", () => {
      expect(zodCpfSchema.safeParse("52998224725").success).toBe(true);
      expect(zodCpfSchema.safeParse("11111111111").success).toBe(false);
    });
  });
});
