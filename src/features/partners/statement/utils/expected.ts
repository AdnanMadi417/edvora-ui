// "Expected" commission: what an Advisor's active applications should earn
// once they reach the commission stage. The statement endpoint only lists
// applications already at that stage, so this is built from the Advisor's
// application list plus each application's detail (its `commissions`).
import { stageCodeOf } from "features/applications/stages";
import type { ApplicationCommissionItem } from "features/applications/shared/commissionTypes";

export const COMMISSION_STAGE_CODE = "PARTNER_COMMISSION_INVOICING";

/** The list fields this feature reads (a subset of PartnerApplication). */
export interface ExpectedCandidate {
  id: string;
  stage: string;
  lifecycle_status: string;
}

/** Is this stage (list rows send its name, sometimes its code) the commission stage? */
export function isCommissionStage(stage: string | null | undefined): boolean {
  if (!stage) return false;
  const code = stageCodeOf({ code: /^[A-Z_]+$/.test(stage) ? stage : null, name: stage });
  return code === COMMISSION_STAGE_CODE || /commission/i.test(stage);
}

/** Active applications not yet at the commission stage: their commission is still to come. */
export function isExpectedCandidate(app: ExpectedCandidate): boolean {
  return app.lifecycle_status === "active" && !isCommissionStage(app.stage);
}

/** "MYR" and "rm" read as RM; everything else upper-cased. Missing → RM (the backend default). */
export function normaliseCurrency(currency: string | null | undefined): string {
  const code = (currency || "RM").trim().toUpperCase();
  return code === "MYR" ? "RM" : code;
}

/** Commission rows that no longer count towards what's coming. */
const CLOSED_STATUSES = new Set(["cancelled", "canceled", "void", "voided", "rejected", "reversed"]);

export interface ExpectedAmount {
  /** Null when the amount isn't shared with this viewer (or not agreed yet). */
  amount: number | null;
  currency: string;
}

/**
 * The commission that will be paid on this application: skip cancelled or
 * voided rows, prefer one with an amount, and take the newest of those.
 * Null when the application has no open commission row.
 */
export function pickExpectedCommission(
  commissions: ApplicationCommissionItem[] | null | undefined
): ExpectedAmount | null {
  const open = (commissions ?? []).filter(
    (c) => c && !CLOSED_STATUSES.has(String(c.status ?? "").toLowerCase())
  );
  if (!open.length) return null;
  const newestFirst = [...open].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
  );
  const chosen =
    newestFirst.find((c) => typeof c.amount === "number" && Number.isFinite(c.amount)) ??
    newestFirst[0];
  const amount =
    typeof chosen.amount === "number" && Number.isFinite(chosen.amount) ? chosen.amount : null;
  return { amount, currency: normaliseCurrency(chosen.currency) };
}

export interface CurrencyTotal {
  currency: string;
  amount: number;
  /** How many applications make up this total. */
  count: number;
}

/**
 * One total per currency, never added across currencies. RM first, then the
 * rest alphabetically. Rows without an amount are left out.
 */
export function totalsByCurrency(
  amounts: (ExpectedAmount | null | undefined)[]
): CurrencyTotal[] {
  const totals = new Map<string, CurrencyTotal>();
  for (const item of amounts) {
    if (!item || item.amount == null) continue;
    const currency = normaliseCurrency(item.currency);
    const total = totals.get(currency) ?? { currency, amount: 0, count: 0 };
    total.amount += item.amount;
    total.count += 1;
    totals.set(currency, total);
  }
  return [...totals.values()].sort((a, b) =>
    a.currency === "RM" ? -1 : b.currency === "RM" ? 1 : a.currency.localeCompare(b.currency)
  );
}

/**
 * Runs `worker` over `items` with at most `limit` in flight. Never rejects:
 * each worker handles its own failure.
 */
export async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  let next = 0;
  const lanes = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      try {
        await worker(item);
      } catch {
        /* the worker records its own failure */
      }
    }
  });
  await Promise.all(lanes);
}
