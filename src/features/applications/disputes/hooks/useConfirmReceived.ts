import { useState } from "react";
import { disputesApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useConfirmReceived() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmReceived = async (applicationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await disputesApi.confirmReceived(applicationId);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to confirm receipt"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { confirmReceived, loading, error };
}
