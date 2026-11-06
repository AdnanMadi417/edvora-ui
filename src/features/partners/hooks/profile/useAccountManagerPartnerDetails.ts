import { useState, useEffect } from "react";
import { parseApiError } from "utils/parseApiError";
import { partnersApi } from "../../services";
import type { AccountManagerPartnerDetails } from "../../types";

export function useAccountManagerPartnerDetails(partnerId: string) {
  const [partner, setPartner] = useState<AccountManagerPartnerDetails | null>(
    null
  );
  const [isPartnerLoading, setIsPartnerLoading] = useState(true);
  const [partnerError, setPartnerError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    let current = true;
    setIsPartnerLoading(Boolean(partnerId));
    setPartnerError(null);
    if (!partnerId) return;
    partnersApi
      .getForAccountManager(partnerId)
      .then((res) => {
        if (current) setPartner(res.data);
      })
      .catch((error) => {
        if (current) {
          setPartner(null);
          setPartnerError(
            parseApiError(error, "Failed to load advisor details.")
          );
        }
      })
      .finally(() => {
        if (current) setIsPartnerLoading(false);
      });
    return () => {
      current = false;
    };
  }, [partnerId, refetchCounter]);

  return { partner, isPartnerLoading, partnerError, refetch };
}
