import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export interface CreatePartnerPayload {
  name: string;
  email: string;
  password: string;
  is_active: boolean;
  type: string;
}

export function useCreatePartner() {
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);
  const [createPartnerError, setCreatePartnerError] = useState<string | null>(null);

  const createPartner = async (payload: CreatePartnerPayload) => {
    try {
      setIsCreatingPartner(true);
      setCreatePartnerError(null);

      const token = Cookies.get("token");

      const res = await api.post(
        "/admin/partners",
        {
          user: {
            name: payload.name.trim(),
            email: payload.email,
            password: payload.password,
            is_active: payload.is_active,
          },
          type: payload.type,
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
        "Failed to create partner";

      setCreatePartnerError(message);

      throw err;
    } finally {
      setIsCreatingPartner(false);
    }
  };

  return {
    createPartner,
    isCreatingPartner,
    createPartnerError,
  };
}