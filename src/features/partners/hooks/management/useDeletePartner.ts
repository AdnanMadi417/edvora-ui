import { useState } from 'react';
import { partnersApi } from '../../services';
import { parseApiError } from 'utils/parseApiError';

export function useDeletePartner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const deletePartner = async (partnerId: string) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await partnersApi.delete(partnerId);
      setSuccess(true);
    } catch (err: unknown) {
      setError(parseApiError(err, 'Failed to delete partner.'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deletePartner, loading, error, success };
}
