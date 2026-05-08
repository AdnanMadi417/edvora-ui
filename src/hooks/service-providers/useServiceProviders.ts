import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import api from "lib/useApi"

export interface PackageOffered {
  name: string
  description: string
  price: number
  includes: string[]
}

export interface PriceRange {
  min_price: number
  max_price: number
}

export interface ServicesOffered {
  id: string
  name: string
  price: number
}

export interface ServiceProvider {
  id: string
  name: string

  picture_file_key:string
  picture_file_url:string

  nationality: string
  main_location: string
  universities_served: string[]
  service_locations: string[]
  languages: string[]
  services_offered: ServicesOffered[]
  packages_offered: PackageOffered[]
  price_range: PriceRange
  services_price_range: PriceRange | null
  packages_price_range: PriceRange | null
  phone_number: string
  whatsapp: string
  is_active: boolean
}

export type ServiceProviders = ServiceProvider[]

export function useServiceProviders() {
  const [serviceProviders, setServiceProviders] = useState<ServiceProviders>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServiceProviders = async () => {
      try {
        const token = Cookies.get("token")

        const res = await api.get("/logistic-providers", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        setServiceProviders(res.data)

      } catch (err) {
        setError("Failed to fetch service providers")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceProviders()
  }, [])
  return { serviceProviders, loading, error }
}
