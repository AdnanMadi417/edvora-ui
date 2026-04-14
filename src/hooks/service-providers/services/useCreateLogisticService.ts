import { useState } from "react"
import Cookies from "js-cookie"
import api from "../../../lib/useApi"

export interface CreateLogisticServicePayload {
  name: string
}

export function useCreateLogisticService() {
  const [loadingCreateLogisticService, setLoading] = useState(false)
  const [errorCreateLogisticService, setError] = useState<string | null>(null)

  const createLogisticService = async (
    payload: CreateLogisticServicePayload
  ) => {
    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get("token")

      const res = await api.post(
        `/admin/logistic-services`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      return res.data
    } catch (err) {
      console.error(err)
      setError("Failed to create logistic service")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createLogisticService,
    loadingCreateLogisticService,
    errorCreateLogisticService,
  }
}
