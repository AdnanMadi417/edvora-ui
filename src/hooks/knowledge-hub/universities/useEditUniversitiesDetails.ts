import { useState } from "react";
import api from "../../../lib/useApi";

interface UpdateBranchPayload {
  id?: string;
  name: string;
  location: string;
  state_id: string;
}

interface UpdateUniversityPayload {
  name: string;
  country: string;
  is_active: boolean;
  description?: string;

  logo_file_key: string;
  logo_file_url: string;

  intake_months?: string[];
  university_type_id: string;
  branches: UpdateBranchPayload[];
}

export function useUpdateUniversity(universityId: string) {
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateUniversity = async (payload: UpdateUniversityPayload) => {
    if (!universityId) return;

    setUpdateLoading(true);
    setUpdateError(null);

    try {
      const res = await api.put(
        `/knowledge-hub/universities/${universityId}`,
        payload
      );

      return res.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail || "Update university failed";

      setUpdateError(errorMessage);
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  };

  return {
    updateUniversity,
    updateLoading,
    updateError,
  };
}