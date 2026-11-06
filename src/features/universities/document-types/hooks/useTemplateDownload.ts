import { useState } from "react";
import { getDocumentDownloadUrl } from "services/documentService";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
export function useTemplateDownload() {
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();
  const download = async (key: string | null) => {
    if (!key || downloading) return;
    setDownloading(true);
    try {
      const url = await getDocumentDownloadUrl(key);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      showToast(parseApiError(error, "Unable to open template."), "error");
    } finally {
      setDownloading(false);
    }
  };
  return { downloading, download };
}
