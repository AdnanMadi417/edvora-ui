import { useState } from 'react';
import { partnersApi } from '../services';
import type { UpdatePartnerProfilePayload } from '../types';

export function useUpdatePartnerProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (payload: UpdatePartnerProfilePayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await partnersApi.updateProfile(payload);
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Failed to update profile';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
}
