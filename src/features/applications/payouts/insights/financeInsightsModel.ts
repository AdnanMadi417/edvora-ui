/**
 * Pure calculations for the Finance insights on the Finance Queue. The only
 * finance-wide source is the commission queue (GET /admin/finance/commissions):
 * one row per application commission with its amounts, its state, and its
 * latest event. Every number here is counted from those rows, one currency at
 * a time (amounts in different currencies are never added together).
 */
import { WAITING_ON_LABEL, type CommissionQueueItem, type WaitingOn } from "../types";

export interface Slice {
  key: string;
  label: string;
  value: number;
}

const norm = (currency: string | null | undefined) => (currency || "").trim().toUpperCase();

/** Currencies on the queue, most common first (MYR first when tied). */
export function currencies(items: CommissionQueueItem[]): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const c of [item.commission_currency, item.received_currency, item.paid_currency]) {
      if (norm(c)) counts.set(norm(c), (counts.get(norm(c)) ?? 0) + 1);
    }
  }
  return [...counts].sort((a, b) => b[1] - a[1] || (a[0] === "MYR" ? -1 : b[0] === "MYR" ? 1 : a[0].localeCompare(b[0]))).map(([c]) => c);
}

/**
 * The four headline totals in one currency:
 * received from universities, paid to Advisors, owed to Advisors (received,
 * not yet paid: "waiting on us"), and still with universities.
 */
export function totals(items: CommissionQueueItem[], currency: string) {
  const sum = (pick: (item: CommissionQueueItem) => number | null, cur: (item: CommissionQueueItem) => string | null, keep: (item: CommissionQueueItem) => boolean = () => true) =>
    items.reduce((total, item) => (keep(item) && norm(cur(item) ?? item.commission_currency) === currency ? total + (pick(item) ?? 0) : total), 0);
  return {
    received: sum((i) => i.received_amount, (i) => i.received_currency),
    paid: sum((i) => i.paid_amount, (i) => i.paid_currency),
    owed: sum((i) => i.commission_amount, (i) => i.commission_currency, (i) => i.waiting_on === "us"),
    withUniversities: sum((i) => i.commission_amount, (i) => i.commission_currency, (i) => i.waiting_on === "university"),
    disputed: items.filter((i) => i.waiting_on === "disputed").length,
  };
}

const ORDER: WaitingOn[] = ["university", "us", "disputed", "nobody"];

/** Agreed commission by state, in workflow order (with the university → waiting on us → disputed → settled). */
export function byState(items: CommissionQueueItem[], currency: string): Slice[] {
  return ORDER.map((state) => ({
    key: state,
    label: WAITING_ON_LABEL[state],
    value: items
      .filter((i) => i.waiting_on === state && norm(i.commission_currency) === currency)
      .reduce((total, i) => total + (i.commission_amount ?? 0), 0),
  })).filter((slice) => slice.value > 0);
}

/**
 * Paid to Advisors per month (12) or quarter (8), oldest first. A row counts
 * when its latest event is the payout: that date is the payout date. (Pay-in
 * dates are only kept until the payout, so there is no "received" history.)
 */
export function paidOverTime(items: CommissionQueueItem[], currency: string, grain: "monthly" | "quarterly", now = new Date()): Slice[] {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const buckets =
    grain === "monthly"
      ? Array.from({ length: 12 }, (_, i) => {
          const t = Date.UTC(y, m - 11 + i, 1);
          return { t, label: new Date(t).toLocaleString("en-GB", { month: "short", timeZone: "UTC" }) };
        })
      : Array.from({ length: 8 }, (_, i) => {
          const t = Date.UTC(y, (Math.floor(m / 3) - 7 + i) * 3, 1);
          const d = new Date(t);
          return { t, label: `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${String(d.getUTCFullYear()).slice(2)}` };
        });
  const series = buckets.map(({ t, label }) => ({ key: new Date(t).toISOString().slice(0, 10), label, value: 0, t }));
  for (const item of items) {
    if (item.last_fact_type !== "payout" || !item.last_fact_date || item.paid_amount == null) continue;
    if (norm(item.paid_currency ?? item.commission_currency) !== currency) continue;
    const at = new Date(item.last_fact_date).getTime();
    let hit = -1;
    series.forEach((bucket, i) => {
      if (at >= bucket.t) hit = i;
    });
    // Older than the window: not shown.
    if (hit >= 0) series[hit].value += item.paid_amount;
  }
  return series.map(({ key, label, value }) => ({ key, label, value }));
}

/** Agreed commission by university, most first (one currency). */
export function byUniversity(items: CommissionQueueItem[], currency: string): Slice[] {
  const sums = new Map<string, number>();
  for (const item of items) {
    if (norm(item.commission_currency) !== currency || !item.commission_amount) continue;
    sums.set(item.university_name, (sums.get(item.university_name) ?? 0) + item.commission_amount);
  }
  return [...sums].map(([label, value]) => ({ key: label, label, value })).sort((a, b) => b.value - a.value);
}

export interface ActivityRow {
  id: string;
  kind: "pay_in" | "payout" | "dispute" | "arrival";
  at: string;
  reference: string;
  student: string;
  university: string;
  advisor: string | null;
  amount: number | null;
  currency: string;
  applicationId: string;
}

/** The latest event on each application, newest first: pay-ins, payouts, disputes, arrivals. */
export function latestActivity(items: CommissionQueueItem[], limit = 6): ActivityRow[] {
  return items
    .filter((item) => item.last_fact_type && item.last_fact_date)
    .map((item) => {
      const kind = item.last_fact_type!;
      const amount = kind === "payout" ? item.paid_amount : kind === "pay_in" ? item.received_amount : item.commission_amount;
      const currency = kind === "payout" ? item.paid_currency : kind === "pay_in" ? item.received_currency : null;
      return {
        id: item.application_commission_id,
        kind,
        at: item.last_fact_date!,
        reference: item.reference,
        student: item.student_name,
        university: item.university_name,
        advisor: item.partner_name,
        amount,
        currency: norm(currency ?? item.commission_currency),
        applicationId: item.application_id,
      };
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}
