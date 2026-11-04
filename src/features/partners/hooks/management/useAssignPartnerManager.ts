import { useState } from 'react';
import { partnersApi } from '../../services';
import type { AssignManagerPayload } from '../../types';
import { parseApiError } from 'utils/parseApiError';

export function useAssignPartnerManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const assignManager = async (partnerId: string, payload: AssignManagerPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await partnersApi.assignManager(partnerId, payload);
      setSuccess(true);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, 'Failed to assign manager'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { assignManager, loading, error, success };
}
