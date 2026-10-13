import { useCallback, useEffect, useState } from "react";
import { partnersApi } from "features/partners/services";
import { partnerBankAccountsApi } from "../services";
import type { PartnerBankAccount } from "../types";
import { parseApiError } from "utils/parseApiError";

export interface PartnerBankAccountRow extends PartnerBankAccount {
  partner_name: string;
  partner_email: string;
  partner_type: string;
}

// The API caps page_size at 100 (page_size: 200 gets a 422) — see
// features/chat/components/ApplicationChat.tsx for the same limit noted
// elsewhere. There's also no admin-wide "list every partner's bank account"
// endpoint, only the per-partner GET /partners/{id}/bank-accounts. So: page
// through every partner 100 at a time, then fetch each one's account in
// parallel, keeping only those that have one. N+1 by nature; fine for the
// current partner count, but revisit (ask for a real aggregate endpoint) if
// this ever needs to scale past a few hundred partners.
const PAGE_SIZE = 100;

export function usePartnerBankAccountsList() {
  const [rows, setRows] = useState<PartnerBankAccountRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const firstPage = await partnersApi.list({ page: 1, page_size: PAGE_SIZE });
      const total = firstPage.data?.total ?? firstPage.data?.items?.length ?? 0;
      const remainingPages = Math.max(Math.ceil(total / PAGE_SIZE) - 1, 0);

      const restPages = await Promise.all(
        Array.from({ length: remainingPages }, (_, i) => partnersApi.list({ page: i + 2, page_size: PAGE_SIZE }))
      );

      const partners = [firstPage, ...restPages].flatMap((res) => res.data?.items ?? []);

      const results = await Promise.all(
        partners.map(async (partner: { id: string; name: string; email: string; type: string }) => {
          try {
            const res = await partnerBankAccountsApi.list(partner.id);
            const account = res.data?.[0];
            if (!account) return null;
            const row: PartnerBankAccountRow = {
              ...account,
              partner_name: partner.name,
              partner_email: partner.email,
              partner_type: partner.type,
            };
            return row;
          } catch {
            return null;
          }
        })
      );

      setRows(results.filter((row): row is PartnerBankAccountRow => row !== null));
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to fetch bank accounts"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { rows, loading, error, refetch: fetchAll };
}
