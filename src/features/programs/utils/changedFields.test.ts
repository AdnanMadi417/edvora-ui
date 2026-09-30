import { pickChangedFields } from "./changedFields";

describe("pickChangedFields", () => {
  const baseline = {
    name: "BSc Computing",
    tuition_fee: 10000,
    yearly_fees: [{ year: 1, fee: 5000 }],
    commission_amount: 1000,
    commission_currency: "RM",
    commission_notes: "Paid per semester",
  };

  it("returns nothing when nothing changed", () => {
    expect(pickChangedFields({ ...baseline, yearly_fees: [{ year: 1, fee: 5000 }] }, baseline)).toEqual({});
  });

  it("returns only the changed keys", () => {
    expect(pickChangedFields({ ...baseline, name: "BSc Computing (Hons)" }, baseline)).toEqual({
      name: "BSc Computing (Hons)",
    });
  });

  it("compares arrays by value and sends the whole array when one item changes", () => {
    const current = { ...baseline, yearly_fees: [{ year: 1, fee: 5500 }] };
    expect(pickChangedFields(current, baseline)).toEqual({ yearly_fees: [{ year: 1, fee: 5500 }] });
  });

  it("sends a whole group when any key in it changed", () => {
    const current = { ...baseline, commission_notes: "Paid yearly" };
    const groups = [["commission_amount", "commission_currency", "commission_notes"]] as const;
    expect(pickChangedFields(current, baseline, groups)).toEqual({
      commission_amount: 1000,
      commission_currency: "RM",
      commission_notes: "Paid yearly",
    });
  });

  it("leaves an untouched group out entirely", () => {
    const current = { ...baseline, tuition_fee: 12000 };
    const groups = [["commission_amount", "commission_currency", "commission_notes"]] as const;
    expect(pickChangedFields(current, baseline, groups)).toEqual({ tuition_fee: 12000 });
  });
});
