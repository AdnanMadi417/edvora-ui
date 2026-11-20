import type { CommissionQueueItem } from "../types";
import { byState, byUniversity, currencies, latestActivity, paidOverTime, totals } from "./financeInsightsModel";

const row = (over: Partial<CommissionQueueItem>): CommissionQueueItem => ({
  application_commission_id: "c",
  application_id: "a",
  reference: "UBX-1",
  student_name: "Student",
  partner_id: "p",
  partner_name: "Global Pathways",
  university_name: "SEGi University",
  program_name: "Diploma",
  commission_amount: 1000,
  commission_currency: "MYR",
  received_amount: null,
  received_currency: null,
  paid_amount: null,
  paid_currency: null,
  waiting_on: "university",
  days_waiting: 10,
  typical_days_from: 7,
  typical_days_to: 30,
  last_fact_type: null,
  last_fact_date: null,
  last_fact_reference: null,
  ...over,
});

const rows = [
  row({ application_commission_id: "1", waiting_on: "university", commission_amount: 2000 }),
  row({ application_commission_id: "2", waiting_on: "us", commission_amount: 1500, received_amount: 1800, received_currency: "MYR", last_fact_type: "pay_in", last_fact_date: "2026-11-02T00:00:00Z" }),
  row({ application_commission_id: "3", waiting_on: "nobody", commission_amount: 1000, received_amount: 1200, received_currency: "MYR", paid_amount: 1000, paid_currency: "MYR", last_fact_type: "payout", last_fact_date: "2026-10-15T00:00:00Z", university_name: "UCSI University" }),
  row({ application_commission_id: "4", waiting_on: "disputed", commission_amount: 500, commission_currency: "USD" }),
];

it("lists currencies, most common first", () => {
  expect(currencies(rows)).toEqual(["MYR", "USD"]);
});

it("adds amounts in one currency only", () => {
  expect(totals(rows, "MYR")).toEqual({ received: 3000, paid: 1000, owed: 1500, withUniversities: 2000, disputed: 1 });
  expect(totals(rows, "USD").withUniversities).toBe(0);
});

it("splits agreed commission by status in workflow order, and by university", () => {
  expect(byState(rows, "MYR").map((s) => `${s.key}:${s.value}`)).toEqual(["university:2000", "us:1500", "nobody:1000"]);
  expect(byUniversity(rows, "MYR")[0]).toEqual({ key: "SEGi University", label: "SEGi University", value: 3500 });
});

it("counts payouts by the month they were made", () => {
  const months = paidOverTime(rows, "MYR", "monthly", new Date("2026-11-20T00:00:00Z"));
  expect(months).toHaveLength(12);
  expect(months.slice(-2).map((m) => m.value)).toEqual([1000, 0]);
});

it("shows the latest event on each application, newest first", () => {
  expect(latestActivity(rows).map((a) => `${a.kind}:${a.amount}`)).toEqual(["pay_in:1800", "payout:1000"]);
});
