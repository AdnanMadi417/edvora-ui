import { useState, useEffect } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export type CommissionTypes = {
  id: string;
  name: string;
  code: string;
  description: string;
  is_default: boolean;
};

export function useCommissionTypes() {
  const [commissionTypes, setCommissionTypes] = useState<CommissionTypes[]>([]);
  const [commissionTypesLoading, setLoading] = useState<boolean>(false);
  const [commissionTypesError, setError] = useState<string>("");

  useEffect(() => {
    const fetchCommissionTypes = async () => {
      setLoading(true);
      setError("");

      try {
        const token = Cookies.get("token");

        const res = await api.get("/knowledge-hub/commission-types", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setCommissionTypes(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch commission types");
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionTypes();
  }, []);

  return {
    commissionTypes,
    commissionTypesLoading,
    commissionTypesError,
  };
}
