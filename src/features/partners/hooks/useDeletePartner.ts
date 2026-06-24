import { useState } from 'react';
import { partnersApi } from '../services';

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
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || 'Failed to delete partner.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deletePartner, loading, error, success };
}
