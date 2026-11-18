import type { ApplicationCommissionItem } from "features/applications/shared/commissionTypes";
import {
  isCommissionStage,
  isExpectedCandidate,
  normaliseCurrency,
  pickExpectedCommission,
  runWithConcurrency,
  totalsByCurrency,
} from "./expected";

const commission = (over: Partial<ApplicationCommissionItem> = {}): ApplicationCommissionItem => ({
  id: "c1",
  status: "pending",
  amount: 3000,
  currency: "RM",
  commission_type_id: null,
  commission_type: null,
  notes: null,
  expected_commission_from: null,
  expected_commission_to: null,
  created_at: "2026-01-01T00:00:00Z",
  ...over,
});

describe("isExpectedCandidate", () => {
  it("keeps active applications before the commission stage", () => {
    expect(isExpectedCandidate({ id: "a", stage: "Visa Processing", lifecycle_status: "active" })).toBe(true);
    expect(isExpectedCandidate({ id: "a", stage: "Application Review", lifecycle_status: "active" })).toBe(true);
  });

  it("leaves out applications at the commission stage, by name or code", () => {
    expect(isCommissionStage("Partner Commission Invoicing")).toBe(true);
    expect(isCommissionStage("PARTNER_COMMISSION_INVOICING")).toBe(true);
    expect(isExpectedCandidate({ id: "a", stage: "Partner Commission Invoicing", lifecycle_status: "active" })).toBe(false);
  });

  it("leaves out applications on hold or cancelled", () => {
    expect(isExpectedCandidate({ id: "a", stage: "Offer Letter", lifecycle_status: "hold" })).toBe(false);
    expect(isExpectedCandidate({ id: "a", stage: "Offer Letter", lifecycle_status: "cancel" })).toBe(false);
  });
});

describe("pickExpectedCommission", () => {
  it("returns null without an open commission", () => {
    expect(pickExpectedCommission([])).toBeNull();
    expect(pickExpectedCommission(undefined)).toBeNull();
    expect(pickExpectedCommission([commission({ status: "cancelled" })])).toBeNull();
  });

  it("skips voided rows and takes the newest with an amount", () => {
    expect(
      pickExpectedCommission([
        commission({ id: "old", amount: 1000, created_at: "2026-01-01" }),
        commission({ id: "void", status: "voided", amount: 9000, created_at: "2026-03-01" }),
        commission({ id: "new", amount: 2500, currency: "usd", created_at: "2026-02-01" }),
      ])
    ).toEqual({ amount: 2500, currency: "USD" });
  });

  it("prefers a row with an amount over a newer redacted one", () => {
    expect(
      pickExpectedCommission([
        commission({ amount: 1500, created_at: "2026-01-01" }),
        commission({ amount: null, created_at: "2026-02-01" }),
      ])
    ).toEqual({ amount: 1500, currency: "RM" });
  });

  it("keeps a redacted amount as null", () => {
    expect(pickExpectedCommission([commission({ amount: null, currency: "MYR" })])).toEqual({ amount: null, currency: "RM" });
  });
});

describe("totalsByCurrency", () => {
  it("never adds different currencies together", () => {
    expect(
      totalsByCurrency([
        { amount: 3000, currency: "USD" },
        { amount: 1500, currency: "RM" },
        { amount: 2000, currency: "MYR" },
        { amount: 500, currency: "usd" },
        { amount: null, currency: "RM" },
        null,
      ])
    ).toEqual([
      { currency: "RM", amount: 3500, count: 2 },
      { currency: "USD", amount: 3500, count: 2 },
    ]);
  });

  it("is empty when nothing has an amount", () => {
    expect(totalsByCurrency([{ amount: null, currency: "RM" }])).toEqual([]);
  });

  it("normalises currency codes", () => {
    expect(normaliseCurrency("myr")).toBe("RM");
    expect(normaliseCurrency(null)).toBe("RM");
    expect(normaliseCurrency(" sgd ")).toBe("SGD");
  });
});

describe("runWithConcurrency", () => {
  it("runs every item with at most the limit in flight, even when some fail", async () => {
    let running = 0;
    let peak = 0;
    const done: number[] = [];
    await runWithConcurrency([1, 2, 3, 4, 5, 6, 7, 8, 9], 4, async (n) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, 1));
      running -= 1;
      if (n === 3) throw new Error("boom");
      done.push(n);
    });
    expect(peak).toBe(4);
    expect(done.sort()).toEqual([1, 2, 4, 5, 6, 7, 8, 9]);
  });
});
