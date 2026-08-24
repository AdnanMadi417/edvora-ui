import { useState } from "react";
import { partnersApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useUpdateAgencyMemberStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAgencyMemberStatus = async (memberPartnerId: string, isActive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await partnersApi.updateAgencyMemberStatus(memberPartnerId, isActive);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, isActive ? "Failed to reactivate member" : "Failed to suspend member"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateAgencyMemberStatus, loading, error };
}
