import { useState } from "react";
import { disputesApi } from "../services";
import type { ResolveNoIssuePayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useResolveNoIssue() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveNoIssue = async (disputeId: string, payload: ResolveNoIssuePayload) => {
    setLoading(true);
    setError(null);
    try {
      await disputesApi.resolveNoIssue(disputeId, payload);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to resolve dispute"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resolveNoIssue, loading, error };
}
