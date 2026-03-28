import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type AmountVisaCase = {
  amount: string;
};

export function useVisaCase() {
  const [amount, setAmount] = useState<AmountVisaCase | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    const fetchVisaCase = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const res = await api.get(`/admin/settings/default-visa-fee`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setAmount(res.data);
      } catch (err) {
        setError("Failed to fetch visa case");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisaCase();
  }, []);

  return { amount, loading, error };
}
