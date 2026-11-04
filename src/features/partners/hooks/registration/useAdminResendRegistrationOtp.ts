import { useState } from 'react';
import { partnersApi } from '../../services';
import { parseApiError } from 'utils/parseApiError';

export function useAdminResendRegistrationOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resendRegistrationOtp = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await partnersApi.adminResendRegistrationOtp(email);
      return res.data;
    } catch (err: unknown) {
      const message = parseApiError(err, 'Failed to resend verification code');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resendRegistrationOtp, loading, error };
}
