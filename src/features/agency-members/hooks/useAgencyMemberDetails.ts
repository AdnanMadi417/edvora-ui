import { useState, useEffect } from "react";
import { agencyMembersApi } from "../services";
import type { AgencyMemberDetails } from "../types";

export function useAgencyMemberDetails(memberPartnerId?: string) {
  const [member, setMember] = useState<AgencyMemberDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = () => setRefetchCounter((c) => c + 1);

  useEffect(() => {
    if (!memberPartnerId) return;

    setLoading(true);
    setError(null);

    agencyMembersApi
      .getMember(memberPartnerId)
      .then((res) => setMember(res.data))
      .catch(() => setError("Failed to fetch member details"))
      .finally(() => setLoading(false));
  }, [memberPartnerId, refetchCounter]);

  return { member, loading, error, refetch };
}
