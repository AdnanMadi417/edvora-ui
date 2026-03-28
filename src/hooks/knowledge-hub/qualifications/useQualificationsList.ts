import { useState, useEffect } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export type QualificationType = {
  id: string;
  name: string;
};

export function useAllQualifications() {
  const [qualifications, setQualifications] = useState<QualificationType[]>([]);
  const [qualificationsLoading, setLoading] = useState<boolean>(false);
  const [qualificationsError, setError] = useState<string>("");

  useEffect(() => {
    const fetchQualifications = async () => {
      setLoading(true);
      setError("");

      try {
        const token = Cookies.get("token");

        const res = await api.get("/knowledge-hub/qualifications", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setQualifications(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch qualifications of study");
      } finally {
        setLoading(false);
      }
    };

    fetchQualifications();
  }, []);

  return {
    qualifications,
    qualificationsLoading,
    qualificationsError,
  };
}
