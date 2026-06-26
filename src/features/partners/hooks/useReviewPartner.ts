import { useState } from 'react';
import { partnersApi } from '../services';

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
    } catch (err: any) {
      const data = err?.response?.data;
      const message =
        (typeof data?.message === 'string' ? data.message : null) ||
        (typeof data?.detail === 'string' ? data.detail : null) ||
        'Failed to submit review';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reviewPartner, loading, error };
}
