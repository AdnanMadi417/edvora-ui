import { useState, useEffect } from "react";
import api from "lib/useApi";

interface User {
  id: string;
  partner_id: string;
  name: string;
  email: string;
  role: string;
}

export function useMe() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/auth/me");
        setUser(response.data); // store fetched user
      } catch (err: any) {
        setError(err.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
