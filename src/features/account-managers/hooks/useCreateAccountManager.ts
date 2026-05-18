import { useState } from "react";
import { accountManagersApi } from "../services";
import type { CreateAccountManagerPayload } from "../types";

export function useCreateAccountManager() {
  const [loadingCreateAccountManager, setLoading] = useState(false);
  const [errorCreateAccountManager, setError] = useState<string | null>(null);

  const createAccountManager = async (payload: CreateAccountManagerPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountManagersApi.create(payload);
      return res.data;
    } catch (err) {
      setError("Failed to create account manager");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createAccountManager, loadingCreateAccountManager, errorCreateAccountManager };
}
