import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { partnerAgreementApi } from "../services";
import type { PartnerAgreement } from "../types";
import { parseApiError } from "utils/parseApiError";

// 404 agreement_not_found means "no agreement started yet", not an error --
// it's the expected state before the first POST, same as
// usePartnerBankAccount treating an empty list as "0 or 1" rather than
// erroring.
export function usePartnerAgreement(partnerId: string) {
  const [agreement, setAgreement] = useState<PartnerAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgreement = useCallback(() => {
    if (!partnerId) return Promise.resolve();
    setLoading(true);
    setError(null);
    return partnerAgreementApi
      .get(partnerId)
      .then((res) => setAgreement(res.data))
      .catch((err: unknown) => {
        if (isAxiosError(err) && err.response?.status === 404) {
          setAgreement(null);
          return;
        }
        setError(parseApiError(err, "Failed to fetch partner agreement"));
      })
      .finally(() => setLoading(false));
  }, [partnerId]);

  useEffect(() => {
    fetchAgreement();
  }, [fetchAgreement]);

  return { agreement, loading, error, refetch: fetchAgreement };
}
