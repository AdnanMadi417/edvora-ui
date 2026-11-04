import { useState } from 'react';
import { partnersApi } from '../../services';
import type { UpdatePartnerPayload } from '../../types';
import { parseApiError } from 'utils/parseApiError';

export function useUpdatePartner() {
  const [isUpdatingPartner, setIsUpdatingPartner] = useState(false);
  const [updatePartnerError, setUpdatePartnerError] = useState<string | null>(null);

  const updatePartner = async (partnerId: string, payload: Partial<UpdatePartnerPayload>) => {
    setIsUpdatingPartner(true);
    setUpdatePartnerError(null);
    try {
      const res = await partnersApi.update(partnerId, payload);
      return res.data;
    } catch (err: unknown) {
      setUpdatePartnerError(parseApiError(err, 'Failed to update partner'));
      throw err;
    } finally {
      setIsUpdatingPartner(false);
    }
  };

  return { updatePartner, isUpdatingPartner, updatePartnerError };
}
