import { DEFAULT_COMMISSION_CURRENCY, normalizeCommissionCurrency } from "./commissionCurrency";

describe("normalizeCommissionCurrency", () => {
  it("upper-cases the legacy lower-case codes older builds wrote", () => {
    expect(normalizeCommissionCurrency("rm")).toBe("RM");
    expect(normalizeCommissionCurrency("usd")).toBe("USD");
  });

  it("leaves canonical codes alone and trims whitespace", () => {
    expect(normalizeCommissionCurrency("RM")).toBe("RM");
    expect(normalizeCommissionCurrency("USD")).toBe("USD");
    expect(normalizeCommissionCurrency(" usd ")).toBe("USD");
  });

  it("folds the ISO ringgit spelling into the commission spelling", () => {
    expect(normalizeCommissionCurrency("MYR")).toBe("RM");
    expect(normalizeCommissionCurrency("myr")).toBe("RM");
  });

  it("falls back to the API default when nothing is stored", () => {
    expect(normalizeCommissionCurrency(null)).toBe(DEFAULT_COMMISSION_CURRENCY);
    expect(normalizeCommissionCurrency(undefined)).toBe(DEFAULT_COMMISSION_CURRENCY);
    expect(normalizeCommissionCurrency("")).toBe(DEFAULT_COMMISSION_CURRENCY);
    expect(normalizeCommissionCurrency("   ")).toBe(DEFAULT_COMMISSION_CURRENCY);
  });

  it("passes unknown codes through so the select can surface them", () => {
    expect(normalizeCommissionCurrency("eur")).toBe("EUR");
  });
});
