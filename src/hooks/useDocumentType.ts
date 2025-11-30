import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

type DocumentType = {
  id: string;
  type: string;
  description: string;
};

export function useDocumentType() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const res = await api.get("/document-types", {
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
  }, []);

  return { documentTypes, loading, error };
}
