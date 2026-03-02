import { useState } from "react"
import Cookies from "js-cookie"
import api from "lib/useApi"

interface EmergencyContact {
  name: string
  relation: string
  phone: string
  email: string
}

interface EnglishProficiency {
  test_type: string
  score: string
  test_date: string
}

interface PreviousEducation {
  institution_name: string
  qualification: string
  start_date: string
  end_date: string
  grade: string
}

interface StudentPayload {
  name: string
  birthday: string
  nationality: string
  passport_number: string
  email: string
  phone: string
  current_address: string
  gender: boolean
  emergency_contacts: EmergencyContact[]
  english_proficiencies: EnglishProficiency[]
  previous_educations: PreviousEducation[]
}

interface ApplicationDocument {
  document_type_id: string
  file_key: string
  file_url: string
}

export interface CreatePartnerApplicationPayload {
  program_id: string
  university_id: string
  intake_date: string
  student_id?: string
  student?: StudentPayload
  documents: ApplicationDocument[]
  is_draft: boolean
}

export function useCreatePartnerApplication(partnerId: string) {
  const [loadingCreatePartnerApplication, setLoading] = useState(false)
  const [errorCreatePartnerApplication, setError] = useState<string | null>(null)

  const createPartnerApplication = async (
    payload: CreatePartnerApplicationPayload
  ) => {
    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get("token")

      const res = await api.post(
        `/partners/${partnerId}/applications`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      return res.data
    } catch (err: unknown) {
      console.error(err)
      setError("Failed to create partner application")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createPartnerApplication,
    loadingCreatePartnerApplication,
    errorCreatePartnerApplication,
  }
}