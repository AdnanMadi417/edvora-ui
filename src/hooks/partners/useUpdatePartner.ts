import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export interface UpdatePartnerPayload {
  name: string;
  email: string;
  password?: string;
  is_active: boolean;

  type: string;
  country: string;
  phone: string;
  is_verified: boolean;
  assigned_manager_id: string;
}

export function useUpdatePartner() {
  const [isUpdatingPartner, setIsUpdatingPartner] = useState(false);
  const [updatePartnerError, setUpdatePartnerError] = useState<string | null>(null);

  const updatePartner = async (
    partnerId: string,
    payload: UpdatePartnerPayload
  ) => {
    try {
      setIsUpdatingPartner(true);
      setUpdatePartnerError(null);

      const token = Cookies.get("token");

      const res = await api.put(
        `/admin/partners/${partnerId}`,
        {
          ...payload,
          name: payload.name.trim(),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      return res.data;
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to update partner";

      setUpdatePartnerError(message);

      throw err;
    } finally {
      setIsUpdatingPartner(false);
    }
  };

  return {
    updatePartner,
    isUpdatingPartner,
    updatePartnerError,
  };
}