import { normalizeAccountNumber, validateAccountNumber } from "./accountNumberRules";

describe("normalizeAccountNumber", () => {
  it("strips spaces and dashes and uppercases letters", () => {
    expect(normalizeAccountNumber(" 1234-5678 90 ")).toBe("1234567890");
    expect(normalizeAccountNumber("ab12 cd34")).toBe("AB12CD34");
  });
});

describe("validateAccountNumber", () => {
  it("requires a value", () => {
    expect(validateAccountNumber("  - ").error).toBe("Account number is required");
  });

  describe("international / unlisted banks", () => {
    it("accepts letters, separators and up to 34 characters", () => {
      expect(validateAccountNumber("GB29-NWBK-6016-1331-9268-19")).toEqual({ error: null, warning: null });
      expect(validateAccountNumber("A".repeat(34)).error).toBeNull();
    });

    it("rejects other symbols and out-of-range lengths", () => {
      expect(validateAccountNumber("1234/5678").error).toMatch(/letters and digits/);
      expect(validateAccountNumber("123").error).toMatch(/4–34/);
      expect(validateAccountNumber("1".repeat(35)).error).toMatch(/4–34/);
    });
  });

  describe("Malaysian banks", () => {
    it("accepts the usual length, even typed with dashes", () => {
      expect(validateAccountNumber("1234-5678-9012", "MBB0228")).toEqual({ error: null, warning: null });
    });

    it("warns, without blocking, on an unusual length", () => {
      const check = validateAccountNumber("12345678901", "MBB0228");
      expect(check.error).toBeNull();
      expect(check.warning).toMatch(/usually have 12 digits — this one has 11/);
    });

    it("still requires digits only", () => {
      expect(validateAccountNumber("12345678901A", "MBB0228").error).toMatch(/digits only/);
    });
  });
});
