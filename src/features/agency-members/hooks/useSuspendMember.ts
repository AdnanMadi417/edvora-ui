import { useState } from "react";
import { agencyMembersApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useSuspendMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suspendMember = async (memberPartnerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await agencyMembersApi.suspend(memberPartnerId);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to suspend member"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { suspendMember, loading, error };
}
