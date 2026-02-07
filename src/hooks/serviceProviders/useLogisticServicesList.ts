import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import api from "lib/useApi"

export interface LogisticService {
  id: string
  name: string
}

export type LogisticServices = LogisticService[]

export function useLogisticServices() {
  const [logisticServices, setLogisticServicesList] =
    useState<LogisticServices>([])
  const [loadingLogisticServices, setLoading] = useState(true)
  const [errorLogisticServices, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogisticServices = async () => {
      try {
        const token = Cookies.get("token")

        const res = await api.get("/logistic-services", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        setLogisticServicesList(res.data)
      } catch (err: unknown) {
        setError("Failed to fetch logistic services")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogisticServices()
  }, [])

  return { logisticServices, loadingLogisticServices, errorLogisticServices }
}
