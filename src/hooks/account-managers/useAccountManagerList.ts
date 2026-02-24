import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type AccountManager = {
  id: string;
  name: string;
  email: string;
  assigned_partners_count: string;
  is_active: boolean;
};

export function useAccountManagerList() {
  const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountManagers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = Cookies.get("token");

        const res = await api.get("/admin/account-managers", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setAccountManagers(res.data);
      } catch (err) {
        setError("Failed to fetch account managers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountManagers();
  }, []);

  return { accountManagers, loading, error };
}