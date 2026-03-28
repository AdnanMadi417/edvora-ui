import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export interface AssignedPartners {
  id: string;
  name: string;
}

export type AccountManager = {
  id: string;
  name: string;
  email: string;
  assigned_partners_count: string;
  assigned_partners: AssignedPartners[];
  is_active: boolean;
};

export function useAccountManagerDetails(managerId: string) {
  const [manager, setManager] = useState<AccountManager | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!managerId) return;

    const fetchManager = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = Cookies.get("token");

        const res = await api.get(
          `/admin/account-managers/${managerId}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );

        setManager(res.data);
      } catch (err) {
        setError("Failed to fetch manager");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, [managerId]);

  return { manager, loading, error };
}