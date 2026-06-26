import { useState } from 'react';
import { partnersApi } from '../services';
import { parseApiError } from 'utils/parseApiError';

export function useReviewPartner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviewPartner = async (
    partnerId: string,
    decision: "approved" | "rejected",
    rejectionReason?: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await partnersApi.review(partnerId, {
        decision,
        ...(rejectionReason ? { rejection_reason: rejectionReason } : {}),
      });
      return res.data;
    } catch (err: unknown) {
      const message = parseApiError(err, 'Failed to submit review');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reviewPartner, loading, error };
}
