import { useState } from "react";
import { agencyInvitationsApi } from "../services";
import type { SubmitAgencyMemberProfilePayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useSubmitAgencyMemberProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitProfile = async (payload: SubmitAgencyMemberProfilePayload) => {
    setLoading(true);
    setError("");
    try {
      const res = await agencyInvitationsApi.submit(payload);
      return res.data;
    } catch (err) {
      const msg = parseApiError(err, "Failed to submit your profile. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitProfile, loading, error };
}
