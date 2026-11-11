import { useEffect, useState } from "react";
import { statementApi } from "../services";
import type { WaitingOn } from "../types";

export type StatementCounts = Record<WaitingOn, number>;

const STATES: WaitingOn[] = ["us", "university", "nobody", "disputed"];

/**
 * How many commissions sit in each state, from the API's totals (one item
 * per request), so the counts stay right however many pages there are.
 * null while loading or if any request fails.
 */
export function useStatementCounts({ member_partner_id }: { member_partner_id?: string } = {}) {
  const [counts, setCounts] = useState<StatementCounts | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCounts(null);
    Promise.all(
      STATES.map((waiting_on) =>
        statementApi.list({ page: 1, page_size: 1, waiting_on, member_partner_id }).then((res) => [waiting_on, res.data.total] as const)
      )
    )
      .then((entries) => {
        if (!cancelled) setCounts(Object.fromEntries(entries) as StatementCounts);
      })
      .catch(() => {
        if (!cancelled) setCounts(null);
      });
    return () => {
      cancelled = true;
    };
  }, [member_partner_id]);

  return counts;
}
