import { useState } from "react";
import { agencyMembersApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useResendSubmissionLink() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resendSubmissionLink = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await agencyMembersApi.resendSubmissionLink(email);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to resend the submission link"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resendSubmissionLink, loading, error };
}
