import { useState } from "react";
import { agencyMembersApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useResendMemberWelcomeEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resendMemberWelcomeEmail = async (memberPartnerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await agencyMembersApi.resendWelcomeEmail(memberPartnerId);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to resend the welcome email"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resendMemberWelcomeEmail, loading, error };
}
