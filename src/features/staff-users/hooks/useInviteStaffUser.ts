import { useState } from "react";
import { staffInvitationsApi } from "../services";
import type { InviteStaffUserPayload } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useInviteStaffUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteStaffUser = async (payload: InviteStaffUserPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffInvitationsApi.invite(payload);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to send invitation"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { inviteStaffUser, loading, error };
}
