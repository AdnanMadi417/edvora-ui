import { useState } from "react";
import { agencyMembersApi } from "../services";
import type { UpdateMemberCommissionPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useUpdateMemberCommission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMemberCommission = async (memberPartnerId: string, payload: UpdateMemberCommissionPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await agencyMembersApi.updateCommission(memberPartnerId, payload);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to update commission settings"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateMemberCommission, loading, error };
}
