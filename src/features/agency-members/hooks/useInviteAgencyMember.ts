import { useState } from "react";
import { agencyMembersApi } from "../services";
import type { InviteAgencyMemberPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useInviteAgencyMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteMember = async (payload: InviteAgencyMemberPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await agencyMembersApi.inviteMember(payload);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to send invitation"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { inviteMember, loading, error };
}
