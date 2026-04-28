import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

type DocumentType = {
  id: string;
  type: string;
  code: string;
  description: string;
  is_init_app_doc: boolean;
  is_required_init_app_doc: boolean;
  is_required_for_current_upload?: boolean;
};

type DocumentTypeParams = {
  initOnly?: boolean;
  programId?: string;
  qualificationId?: string;
  applicationStageId?: string;
  nationality?: string;
};

export function useDocumentType(params?: DocumentTypeParams) {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    initOnly,
    programId,
    qualificationId,
    applicationStageId,
    nationality,
  } = params ?? {};

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");

        const queryParams: Record<string, any> = {};
        if (initOnly !== undefined) queryParams.init_only = initOnly;
        if (programId) queryParams.program_id = programId;
        if (qualificationId) queryParams.qualification_id = qualificationId;
        if (applicationStageId) queryParams.application_stage_id = applicationStageId;
        if (nationality) queryParams.nationality = nationality;

        const res = await api.get("/document-types", {
          params: queryParams,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setDocumentTypes(res.data || []);
      } catch (err) {
        setError("Failed to fetch document types");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentTypes();
  }, [initOnly, programId, qualificationId, applicationStageId, nationality]);

  return { documentTypes, loading, error };
}
