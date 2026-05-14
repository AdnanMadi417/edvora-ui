import { useState } from 'react';
import { partnersApi } from '../services';
import type { CreatePartnerPayload } from '../types';

export function useCreatePartner() {
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);
  const [createPartnerError, setCreatePartnerError] = useState<string | null>(null);

  const createPartner = async (payload: CreatePartnerPayload) => {
    setIsCreatingPartner(true);
    setCreatePartnerError(null);
    try {
      const res = await partnersApi.create(payload);
      return res.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail?.[0]?.msg || 'Failed to create partner';
      setCreatePartnerError(message);
      throw err;
    } finally {
      setIsCreatingPartner(false);
    }
  };

  return { createPartner, isCreatingPartner, createPartnerError };
}
