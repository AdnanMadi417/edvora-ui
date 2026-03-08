import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export interface PartnerDetails {
  id: string;
  user_id: string;
  name: string;
  email: string;
  type: string;
  country: string;
  phone: string;
  is_active: boolean;
  is_verified: boolean;
  assigned_manager_id: string;
  assigned_manager_name: string;
}

export function usePartnerProfile() {
  const [partner, setPartner] = useState<PartnerDetails | null>(null);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        setIsPartnerLoading(true);
        setPartnerError(null);

        const token = Cookies.get("token");

        const res = await api.get<PartnerDetails>("/partners/profile", {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });

        setPartner(res.data);
      } catch (err: any) {
        setPartnerError(
          err?.response?.data?.detail || "Failed to fetch partner"
        );
      } finally {
        setIsPartnerLoading(false);
      }
    };

    fetchPartner();
  }, []);

  return {
    partner,
    isPartnerLoading,
    partnerError,
  };
}