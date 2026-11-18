import type { CommissionQueueItem } from "features/applications/payouts/types";
import type { PartnerStatementItem } from "features/partners/statement/types";
export interface CommissionRecord {
  id: string;
  applicationId: string;
  student: string;
  reference: string;
  status: string;
  amount: number | null;
}
export interface CommissionBucket {
  amount: number;
  unknown: number;
  records: CommissionRecord[];
}
export interface UniversityCommission {
  key: string;
  name: string;
  currency: string;
  expected: CommissionBucket;
  ready: CommissionBucket;
  paid: CommissionBucket;
  disputed: number;
}
const bucket = (): CommissionBucket => ({ amount: 0, unknown: 0, records: [] });
/** Never merge currencies or substitute zero for a redacted/missing amount. */
export function groupUniversityCommission(
  items: (CommissionQueueItem | PartnerStatementItem)[],
  admin: boolean
): UniversityCommission[] {
  const groups = new Map<string, UniversityCommission>();
  for (const item of items) {
    const paid = item.waiting_on === "nobody";
    const actual = admin && paid && "paid_amount" in item;
    const currency =
      (actual ? item.paid_currency : item.commission_currency)
        ?.trim()
        .toUpperCase() || "Unspecified";
    const name = item.university_name?.trim() || "University unavailable";
    const key = JSON.stringify([name, currency]);
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        name,
        currency,
        expected: bucket(),
        ready: bucket(),
        paid: bucket(),
        disputed: 0,
      };
      groups.set(key, group);
    }
    if (item.waiting_on === "disputed") {
      group.disputed++;
      continue;
    }
    const target =
      item.waiting_on === "university"
        ? group.expected
        : item.waiting_on === "us"
        ? group.ready
        : paid
        ? group.paid
        : null;
    if (!target) continue;
    const amount = actual ? item.paid_amount : item.commission_amount;
    const value =
      typeof amount === "number" && Number.isFinite(amount) ? amount : null;
    target.records.push({
      id: item.application_commission_id,
      applicationId: item.application_id,
      student: item.student_name,
      reference: item.reference,
      status: item.waiting_on,
      amount: value,
    });
    if (value === null) target.unknown++;
    else target.amount += value;
  }
  return [...groups.values()].sort(
    (a, b) =>
      b.ready.records.length - a.ready.records.length ||
      b.expected.records.length - a.expected.records.length ||
      a.name.localeCompare(b.name) ||
      a.currency.localeCompare(b.currency)
  );
}
export interface PaidMonth {
  /** yyyy-mm */
  month: string;
  currency: string;
  amount: number;
}
/**
 * Paid commission per month and currency, from the settled records' last fact
 * date (the payout). Months between the first and last are filled with 0 so
 * the line is continuous; at most the last 12 months. Currencies stay apart.
 */
export function groupPaidByMonth(items: (CommissionQueueItem | PartnerStatementItem)[], admin: boolean): PaidMonth[] {
  const sums = new Map<string, number>();
  const months = new Map<string, Set<string>>();
  for (const item of items) {
    if (item.waiting_on !== "nobody") continue;
    const actual = admin && "paid_amount" in item;
    const amount = actual ? (item as CommissionQueueItem).paid_amount : item.commission_amount;
    if (typeof amount !== "number" || !Number.isFinite(amount)) continue;
    const currency = ((actual ? (item as CommissionQueueItem).paid_currency : item.commission_currency) ?? "").trim().toUpperCase() || "Unspecified";
    const date = ("since_date" in item && item.since_date) || ("last_fact_date" in item && item.last_fact_date) || ("created_at" in item && item.created_at);
    const month = typeof date === "string" ? date.slice(0, 7) : "";
    if (!/^\d{4}-\d{2}$/.test(month)) continue;
    sums.set(`${currency}|${month}`, (sums.get(`${currency}|${month}`) ?? 0) + amount);
    if (!months.has(currency)) months.set(currency, new Set());
    months.get(currency)!.add(month);
  }
  const out: PaidMonth[] = [];
  for (const [currency, set] of months) {
    const sorted = [...set].sort();
    let [y, m] = sorted[0].split("-").map(Number);
    const [ly, lm] = sorted[sorted.length - 1].split("-").map(Number);
    const series: PaidMonth[] = [];
    while (y < ly || (y === ly && m <= lm)) {
      const month = `${y}-${String(m).padStart(2, "0")}`;
      series.push({ month, currency, amount: sums.get(`${currency}|${month}`) ?? 0 });
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    out.push(...series.slice(-12));
  }
  return out;
}
/** Fetch all pages before calculating totals. A failed or inconsistent page cannot become a partial total. */
export async function completeCollection(
  load: (page: number) => Promise<{ data: any }>
): Promise<any[]> {
  const rows: any[] = [];
  let total: number | undefined;
  const seen = new Set<string>();
  for (let page = 1; page <= 200; page++) {
    const { data } = await load(page);
    if (Array.isArray(data)) {
      if (page !== 1) throw Error("Inconsistent collection response");
      return data;
    }
    if (
      !data ||
      !Array.isArray(data.items) ||
      !Number.isInteger(data.total) ||
      data.total < 0
    )
      throw Error("Incomplete dashboard data");
    if (total === undefined) total = data.total;
    else if (total !== data.total)
      throw Error("Records changed while loading. Try again.");
    if (!data.items.length && rows.length < total)
      throw Error("Incomplete dashboard page");
    for (const item of data.items) {
      const id = item.id ?? item.application_commission_id;
      if (id != null) {
        const key = String(id);
        if (seen.has(key)) throw Error("Repeated dashboard page. Try again.");
        seen.add(key);
      }
    }
    rows.push(...data.items);
    if (rows.length === total) return rows;
    if (rows.length > total) throw Error("Inconsistent dashboard total");
  }
  throw Error("Dashboard dataset requires a server summary.");
}
