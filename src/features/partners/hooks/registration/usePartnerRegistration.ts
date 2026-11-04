import { useState } from "react";
import { partnersApi } from "../../services";
import { parseApiError } from "utils/parseApiError";

export function usePartnerRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initiateRegistration = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError("");
    try {
      await partnersApi.registerInitiate(payload);
    } catch (err) {
      const msg = parseApiError(err, "Submission failed. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { initiateRegistration, loading, error };
}
