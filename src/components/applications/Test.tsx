'use client'

import { useEffect } from 'react'
import api from 'lib/useApi'
import Cookies from 'js-cookie'

export default function PartnerApplications() {
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = Cookies.get('token')
        const partnerId = localStorage.getItem('partnerId') // stored after login

        if (!token || !partnerId) {
          console.error('Missing token or partnerId')
          return
        }

        const res = await api.get(`/partners/${partnerId}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log('Partner Applications:', res.data)
      } catch (err: any) {
        console.error('Error fetching partner applications:', err)
      }
    }

    fetchApplications()
  }, [])

  return <div>Check console for partner applications data.</div>
}
