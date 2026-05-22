import { useEffect, useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type AvailableAction = {
  status: string;
  next_action: string;
};

export type DocumentType = {
  id: string;
  type: string;
  code: string;
  description: string;
  is_init_app_doc: boolean;
  is_required_init_app_doc: boolean;
  is_required_for_current_upload: boolean;
};

export type StageStatus = {
  id: string;
  name: string;
  is_requires_reason: boolean;
  is_requires_document_selection: boolean;
  is_triggers_stage_advance: boolean;
};

export type PartnerAction = {
  target_status_id: string;
  target_status_code: string;
  label: string;
  is_requires_reason: boolean;
  is_requires_document_selection: boolean;
};

export type ApplicationActionsResponse = {
  id: string;
  stage: string;
  status: string;
  status_code: string;
  is_draft: boolean;
  correction_reason: string | null;
  next_action: string;

  available_actions: AvailableAction[];
  document_types: DocumentType[];
  manager_allowed_next_statuses: StageStatus[];
  partner_actions: PartnerAction[];
};

type HookReturn = {
  actions: ApplicationActionsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useApplicationActions = (
  applicationId?: string
): HookReturn => {
  const [actions, setActions] =
    useState<ApplicationActionsResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchActions = async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get("token");

      const res = await api.get(
        `/applications/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActions(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [applicationId]);

  return {
    actions,
    loading,
    error,
    refetch: fetchActions,
  };
};