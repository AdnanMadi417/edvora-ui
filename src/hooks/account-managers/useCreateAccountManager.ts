import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export interface CreateAccountManagerPayload {
  name: string
  email: string
  password: string
  is_active: boolean
}

export function useCreateAccountManager() {
  const [loadingCreateAccountManager, setLoading] = useState(false)
  const [errorCreateAccountManager, setError] = useState<string | null>(null)

  const createAccountManager = async (payload: CreateAccountManagerPayload) => {
    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get("token")

      const res = await api.post(
        "/admin/account-managers",
        payload,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )

      return res.data
    } catch (err: unknown) {
      console.error(err)
      setError("Failed to create account manager")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createAccountManager,
    loadingCreateAccountManager,
    errorCreateAccountManager
  }
}
