import { useState } from "react";
import { useDocumentType } from "hooks/useDocumentType";
import { getDocumentDownloadUrl } from "services/documentService";
import { useToast } from "components/context/ToastContext";

// Official "Lampiran B" Health Declaration Form — fallback used until an
// admin uploads a static template for the health_declaration_form document
// type (see src/app/admin/document-types). A static government PDF, not an
// app-hosted document, so it's opened directly rather than presigned.
const HEALTH_DECLARATION_FORM_FALLBACK_URL =
  "https://visa.educationmalaysia.gov.my/media/cms_upload/Lampiran_B_-_Health_Declaration_Form_For_ApplicantV2.pdf";

export function useHealthDeclarationFormDownload() {
  const { documentTypes } = useDocumentType();
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const fileKey = documentTypes.find((dt) => dt.code === "health_declaration_form")?.static_template_file_key || null;

  const download = async () => {
    if (!fileKey) {
      window.open(HEALTH_DECLARATION_FORM_FALLBACK_URL, "_blank", "noopener,noreferrer");
      return;
    }
    if (downloading) return;
    try {
      setDownloading(true);
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      showToast("Failed to download Health Declaration Form", "error");
    } finally {
      setDownloading(false);
    }
  };

  return { download, downloading };
}
