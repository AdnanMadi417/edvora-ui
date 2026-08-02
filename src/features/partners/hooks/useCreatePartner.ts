import { useState } from 'react';
import { partnersApi } from '../services';
import type { CreatePartnerPayload } from '../types';
import { parseApiError } from 'utils/parseApiError';

export function useCreatePartner() {
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);
  const [createPartnerError, setCreatePartnerError] = useState<string | null>(null);

  const createPartner = async (payload: CreatePartnerPayload) => {
    setIsCreatingPartner(true);
    setCreatePartnerError(null);
    try {
      const res = await partnersApi.create(payload);
      return res.data;
    } catch (err: unknown) {
      setCreatePartnerError(parseApiError(err, 'Failed to create partner'));
      throw err;
    } finally {
      setIsCreatingPartner(false);
    }
  };

  return { createPartner, isCreatingPartner, createPartnerError };
}
