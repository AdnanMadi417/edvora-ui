import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import api from "lib/useApi"

export interface LogisticLanguage {
  id: string
  name: string
}

export type LogisticLanguages = LogisticLanguage[]

export function useLogisticLanguages() {
  const [
    logisticLanguages,
    setLogisticLanguages,
  ] = useState<LogisticLanguages>([])

  const [loadingLogisticLanguage, setLoading] = useState(true)
  const [errorLogisticLanguage, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogisticLanguages = async () => {
      try {
        const token = Cookies.get("token")

        const res = await api.get("/logistic-languages", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        setLogisticLanguages(res.data)
      } catch (err: unknown) {
        setError("Failed to fetch logistic service locations")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogisticLanguages()
  }, [])

  return {
    logisticLanguages,
    loadingLogisticLanguage,
    errorLogisticLanguage,
  }
}
