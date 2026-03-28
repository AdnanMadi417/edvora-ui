import { useState } from "react"
import Cookies from "js-cookie"
import api from "lib/useApi"

interface PackageOffered {
  name: string
  description: string
  price: number
  includes: string[]
}

export interface CreateLogisticsProviderPayload {
  name: string
  nationality: string
  main_location: string
  phone_number: string
  whatsapp: string
  is_active: boolean
  packages_offered: PackageOffered[]
  university_ids: string[]
  service_location_ids: string[]
  service_ids: string[]
  language_ids: string[]
}

export function useCreateLogisticsProvider() {
  const [loadingCreateLogisticsProvider, setLoading] = useState(false)
  const [errorCreateLogisticsProvider, setError] = useState<string | null>(null)

  const createLogisticsProvider = async (
    payload: CreateLogisticsProviderPayload
  ) => {
    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get("token")

      const res = await api.post(
        "/logistic-providers",
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      return res.data
    } catch (err: unknown) {
      console.error(err)
      setError("Failed to create logistics provider")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createLogisticsProvider,
    loadingCreateLogisticsProvider,
    errorCreateLogisticsProvider,
  }
}
