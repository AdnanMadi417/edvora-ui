import { useState } from 'react';
import { partnersApi } from '../services';
import { parseApiError } from 'utils/parseApiError';

export function useResendApprovalEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resendApprovalEmail = async (partnerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await partnersApi.resendApprovalEmail(partnerId);
      return res.data;
    } catch (err: unknown) {
      const message = parseApiError(err, 'Failed to resend approval email');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resendApprovalEmail, loading, error };
}
