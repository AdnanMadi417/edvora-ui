import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import api from "lib/useApi"

export interface LogisticUniversity {
  id: string
  name: string
  country: string
}

export type LogisticUniversities = LogisticUniversity[]

export function useLogisticUniversities() {
  const [
    logisticUniversities,
    setLogisticUniversities,
  ] = useState<LogisticUniversities>([])

  const [loadingLogisticUniversity, setLoading] = useState(true)
  const [errorLogisticUniversity, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogisticUniversities = async () => {
      try {
        const token = Cookies.get("token")

        const res = await api.get("/logistic-universities", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        setLogisticUniversities(res.data)
      } catch (err: unknown) {
        setError("Failed to fetch logistic service locations")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogisticUniversities()
  }, [])

  return {
    logisticUniversities,
    loadingLogisticUniversity,
    errorLogisticUniversity,
  }
}
