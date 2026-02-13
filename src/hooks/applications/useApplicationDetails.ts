import { useEffect, useState, useCallback } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";


export interface AvailableAction {
  status: string;
  next_action: string;
}

export interface DocumentType {
  id: string;
  type: string;
  code: string;
  description: string;
}

export interface StageStatus {
  id: string;
  name: string;
  is_requires_reason: boolean;
  is_requires_document_selection: boolean;
  is_triggers_stage_advance: boolean;
}

export interface PartnerAction {
  target_status_id: string;
  target_status_code: string;
  label: string;
  is_requires_reason: boolean;
  is_requires_document_selection: boolean;
}

export interface ApplicationDetails {
  id: string;
  stage: string;
  status: string;
  status_code: string;
  is_draft: boolean;
  correction_reason: string | null;
  next_action: string;
  available_actions: AvailableAction[];
  document_types: DocumentType[];
  stage_statuses: StageStatus[];
  partner_actions: PartnerAction[];
}

const useApplicationDetails = (applicationId?: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = Cookies.get("token");

  const fetchApplicationDetails = useCallback(async () => {
    if (!applicationId) return;

    console.log("Fetching application with ID:", applicationId);
    console.log("Token:", token);

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/applications/${applicationId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log("API response:", response.data);
      setData(response.data);
    } catch (err) {
      console.error("API error:", err);
      setError(err?.response?.data?.message || "Failed to fetch application details");
    } finally {
      setLoading(false);
    }
  }, [applicationId, token]);

  useEffect(() => {
    fetchApplicationDetails();
  }, [fetchApplicationDetails]);

  return {
    applications: data,
    loading,
    error,
    refetch: fetchApplicationDetails,
  };
};

export default useApplicationDetails;

