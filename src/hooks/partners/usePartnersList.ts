import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type Partner = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  type: string;
  country: string;
  phone: string;
  is_verified: boolean;
  is_active: boolean;
  assigned_manager_id: string;
  assigned_manager_name: string;
};

export function useAllPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setLoading] = useState<boolean>(false);
  const [partnersError, setError] = useState<string>("");

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      setError("");

      try {
        const token = Cookies.get("token");

        const res = await api.get("/admin/partners", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setPartners(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch partners");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return {
    partners,
    partnersLoading,
    partnersError,
  };
}