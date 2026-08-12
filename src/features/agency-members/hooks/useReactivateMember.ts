import { useState } from "react";
import { agencyMembersApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useReactivateMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reactivateMember = async (memberPartnerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await agencyMembersApi.reactivate(memberPartnerId);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to reactivate member"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reactivateMember, loading, error };
}
