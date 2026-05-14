import { useState } from 'react';
import { partnersApi } from '../services';
import type { UpdatePartnerPayload } from '../types';

export function useUpdatePartner() {
  const [isUpdatingPartner, setIsUpdatingPartner] = useState(false);
  const [updatePartnerError, setUpdatePartnerError] = useState<string | null>(null);

  const updatePartner = async (partnerId: string, payload: UpdatePartnerPayload) => {
    setIsUpdatingPartner(true);
    setUpdatePartnerError(null);
    try {
      const res = await partnersApi.update(partnerId, payload);
      return res.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail?.[0]?.msg || 'Failed to update partner';
      setUpdatePartnerError(message);
      throw err;
    } finally {
      setIsUpdatingPartner(false);
    }
  };

  return { updatePartner, isUpdatingPartner, updatePartnerError };
}
