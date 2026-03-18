import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import api from "lib/useApi"

export interface Package {
  name: string
  description: string
  price: number
  includes: string[]
}

export interface PriceRange {
  min_price: number
  max_price: number
}

export interface LogisticService {
  id: string
  name: string
  nationality: string
  main_location: string
  universities_served: string[]
  service_locations: string[]
  languages: string[]
  services_offered: string[]
  packages_offered: Package[]
  price_range: PriceRange
  phone_number: string
  whatsapp: string
  is_active: boolean
}

export function useLogisticServiceDetails(logisticId: string) {
  const [service, setLogisticServiceList] =
    useState<LogisticService | null>(null)
  const [loadingService, setLoading] = useState(true)
  const [errorService, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!logisticId) return

    const fetchLogisticService = async () => {
      try {
        const token = Cookies.get("token")

        const res = await api.get(`/logistic-providers/${logisticId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        setLogisticServiceList(res.data)
      } catch (err: unknown) {
        setError("Failed to fetch logistic services")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogisticService()
  }, [logisticId])

  return { service, loadingService, errorService }
}