import { formatCurrency, formatDisplayDate, formatNumber, formatPercent, formatSmartDate, formatTime } from "./format";

describe("format (brief §8)", () => {
  it("formats numbers with grouping and Western numerals", () => {
    expect(formatNumber(3500)).toBe("3,500");
    expect(formatNumber(1234.5)).toBe("1,234.50");
    expect(formatNumber(1234.5, { decimals: 0 })).toBe("1,235");
  });

  it("writes RM with no space and other currencies with a space", () => {
    expect(formatCurrency(4200)).toBe("RM4,200");
    expect(formatCurrency(4200, { currency: "MYR" })).toBe("RM4,200");
    expect(formatCurrency(3000, { currency: "SGD" })).toBe("SGD 3,000");
    expect(formatCurrency(18500.8, { decimals: 2 })).toBe("RM18,500.80");
  });

  it("puts the sign before the currency", () => {
    expect(formatCurrency(-150)).toBe("-RM150");
    expect(formatCurrency(150, { signed: true })).toBe("+RM150");
    expect(formatCurrency(0, { signed: true })).toBe("RM0");
  });

  it("formats percentages from fractions or whole values", () => {
    expect(formatPercent(0.124)).toBe("12.4%");
    expect(formatPercent(20, { isFraction: false, decimals: 0 })).toBe("20%");
  });

  it("formats dates as D MMM YYYY and times as h:mm am/pm", () => {
    const date = new Date(2026, 5, 12, 14, 30);
    expect(formatDisplayDate(date)).toBe("12 Jun 2026");
    expect(formatTime(date)).toBe("2:30 pm");
    expect(formatTime(new Date(2026, 5, 12, 0, 5))).toBe("12:05 am");
    expect(formatDisplayDate(null)).toBe("—");
    expect(formatDisplayDate("not a date", "n/a")).toBe("n/a");
  });

  it("uses relative time under 7 days, then the full date", () => {
    const now = new Date(2026, 9, 31, 12, 0);
    expect(formatSmartDate(new Date(2026, 9, 1), now)).toBe("1 Oct 2026");
    expect(formatSmartDate(new Date(2026, 9, 31, 10, 0), now)).not.toBe("31 Oct 2026");
  });
});
