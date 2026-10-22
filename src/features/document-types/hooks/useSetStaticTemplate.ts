import { useState } from "react";
import { documentTypesApi, SetStaticTemplatePayload } from "../services/documentTypesApi";

export function useSetStaticTemplate() {
  const [loading, setLoading] = useState(false);

  const setTemplate = async (documentTypeId: string, payload: SetStaticTemplatePayload) => {
    setLoading(true);
    try {
      await documentTypesApi.setStaticTemplate(documentTypeId, payload);
    } finally {
      setLoading(false);
    }
  };

  return { setTemplate, loading };
}
