import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import api from "lib/useApi"

export interface LogisticServiceLocation {
  id: string
  name: string
}

export type LogisticServiceLocations = LogisticServiceLocation[]

export function useLogisticServiceLocations() {
  const [
    logisticServiceLocations,
    setLogisticServiceLocations,
  ] = useState<LogisticServiceLocations>([])

  const [loadingServiceLocations, setLoading] = useState(true)
  const [errorServiceLocations, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogisticServiceLocations = async () => {
      try {
        const token = Cookies.get("token")

        const res = await api.get("/logistic-service-locations", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        setLogisticServiceLocations(res.data)
      } catch (err: unknown) {
        setError("Failed to fetch logistic service locations")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogisticServiceLocations()
  }, [])

  return {
    logisticServiceLocations,
    loadingServiceLocations,
    errorServiceLocations,
  }
}
