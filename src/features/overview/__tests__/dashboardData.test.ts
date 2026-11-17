import {
  completeCollection,
  groupUniversityCommission,
} from "../model/dashboardData";
const row = (patch: any = {}) => ({
  application_commission_id: "c1",
  application_id: "a1",
  university_name: "Example University",
  student_name: "Student",
  reference: "REF1",
  waiting_on: "university",
  commission_amount: 100,
  commission_currency: "MYR",
  paid_amount: null,
  paid_currency: null,
  ...patch,
});
it("keeps universities and currencies separate and uses actual paid amounts for admins", () => {
  const result = groupUniversityCommission(
    [
      row(),
      row({
        application_commission_id: "c2",
        application_id: "a2",
        waiting_on: "us",
        commission_amount: 200,
      }),
      row({
        application_commission_id: "c3",
        application_id: "a3",
        waiting_on: "nobody",
        commission_amount: 500,
        paid_amount: 430,
        paid_currency: "MYR",
      }),
      row({
        application_commission_id: "c4",
        application_id: "a4",
        commission_currency: "USD",
        commission_amount: 25,
      }),
      row({
        application_commission_id: "c5",
        application_id: "a5",
        university_name: "Other University",
        commission_amount: 70,
      }),
    ],
    true
  );
  expect(result).toHaveLength(3);
  const myr = result.find(
    (item) => item.name === "Example University" && item.currency === "MYR"
  )!;
  expect(myr.expected.amount).toBe(100);
  expect(myr.ready.amount).toBe(200);
  expect(myr.paid.amount).toBe(430);
  expect(result.find((item) => item.currency === "USD")!.expected.amount).toBe(
    25
  );
});
it("preserves undisclosed amounts and separates disputes from ready/paid totals", () => {
  const [result] = groupUniversityCommission(
    [
      row({ commission_amount: null, waiting_on: "us" }),
      row({
        application_commission_id: "c2",
        waiting_on: "disputed",
        commission_amount: 1000,
      }),
    ],
    false
  );
  expect(result.ready.unknown).toBe(1);
  expect(result.ready.records[0].amount).toBeNull();
  expect(result.disputed).toBe(1);
  expect(result.paid.records).toHaveLength(0);
  expect(result.ready.amount).toBe(0);
});
it("uses the partner statement's current amount without assuming an original agreed amount", () => {
  const [result] = groupUniversityCommission(
    [row({ waiting_on: "nobody", commission_amount: 325, paid_amount: 999 })],
    false
  );
  expect(result.paid.amount).toBe(325);
});
it("loads every page before calculating a collection", async () => {
  const load = jest
    .fn()
    .mockResolvedValueOnce({
      data: { total: 3, items: [{ id: "1" }, { id: "2" }] },
    })
    .mockResolvedValueOnce({ data: { total: 3, items: [{ id: "3" }] } });
  expect(await completeCollection(load)).toHaveLength(3);
  expect(load).toHaveBeenLastCalledWith(2);
});
it("rejects incomplete, duplicate and changing pages instead of returning partial totals", async () => {
  await expect(
    completeCollection(async () => ({ data: { total: 2, items: [] } }))
  ).rejects.toThrow("Incomplete");
  await expect(
    completeCollection(async () => ({
      data: { total: 2, items: [{ id: "1" }] },
    }))
  ).rejects.toThrow("Repeated");
  const load = jest
    .fn()
    .mockResolvedValueOnce({ data: { total: 2, items: [{ id: "1" }] } })
    .mockResolvedValueOnce({ data: { total: 3, items: [{ id: "2" }] } });
  await expect(completeCollection(load)).rejects.toThrow("changed");
});
