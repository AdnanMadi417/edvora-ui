import { useState } from "react"
import Cookies from "js-cookie"
import api from "lib/useApi"

export interface EditLogisticServicePayload {
  name: string
}

export function useEditLogisticService() {
  const [loadingEditLogisticService, setLoading] = useState(false)
  const [errorEditLogisticService, setError] = useState<string | null>(null)

  const editLogisticService = async (
    serviceId: string,
    payload: EditLogisticServicePayload
  ) => {
    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get("token")

      const res = await api.put(
        `/admin/logistic-services/${serviceId}`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      return res.data
    } catch (err) {
      console.error(err)
      setError("Failed to update logistic service")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    editLogisticService,
    loadingEditLogisticService,
    errorEditLogisticService,
  }
}
