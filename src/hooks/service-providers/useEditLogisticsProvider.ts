import { useState } from "react"
import Cookies from "js-cookie"
import api from "lib/useApi"

interface PackageOffered {
  name: string
  description: string
  price: number
  includes: string[]
}

export type EditLogisticsProviderPayload = Partial<{
  name: string
  nationality: string
  phone_number: string
  whatsapp: string
  is_active: boolean
  packages_offered: PackageOffered[]
  university_ids: string[]
  service_location_ids: string[]
  service_ids: string[]
  language_ids: string[]
}>

export function useEditLogisticsProvider() {
  const [loadingEditLogisticsProvider, setLoading] = useState(false)
  const [errorEditLogisticsProvider, setError] = useState<string | null>(null)

  const editLogisticsProvider = async (
    providerId: string,
    payload: EditLogisticsProviderPayload
  ) => {
    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get("token")

      const res = await api.put(
        `/logistic-providers/${providerId}`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      return res.data
    } catch (err) {
      console.error(err)
      setError("Failed to update logistics provider")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    editLogisticsProvider,
    loadingEditLogisticsProvider,
    errorEditLogisticsProvider,
  }
}
