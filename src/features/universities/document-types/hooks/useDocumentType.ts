import { useState, useEffect } from "react";

import type { DocumentType, DocumentTypeParams } from "../types";
import { documentTypesApi } from "../services/documentTypesApi";

export function useDocumentType(params?: DocumentTypeParams) {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [revision, setRevision] = useState(0);

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
      setError(null);
      try {
        const queryParams: Record<string, any> = {};
        if (initOnly !== undefined) queryParams.init_only = initOnly;
        if (programId) queryParams.program_id = programId;
        if (qualificationId) queryParams.qualification_id = qualificationId;
        if (applicationStageId)
          queryParams.application_stage_id = applicationStageId;
        if (nationality) queryParams.nationality = nationality;

        const res = await documentTypesApi.list(queryParams);

        setDocumentTypes(res.data || []);
      } catch (err) {
        setError("Failed to fetch document types");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentTypes();
  }, [
    initOnly,
    programId,
    qualificationId,
    applicationStageId,
    nationality,
    revision,
  ]);

  return {
    documentTypes,
    loading,
    error,
    refetch: () => setRevision((value) => value + 1),
  };
}
