import { useDocumentType } from "hooks/useDocumentType";

// Official "Lampiran B" Health Declaration Form — fallback used until an
// admin uploads a static template for the health_declaration_form document
// type (see src/app/admin/document-types). A static government PDF, not an
// app-hosted document, so it's used directly rather than going through
// getDocumentDownloadUrl.
const HEALTH_DECLARATION_FORM_FALLBACK_URL =
  "https://visa.educationmalaysia.gov.my/media/cms_upload/Lampiran_B_-_Health_Declaration_Form_For_ApplicantV2.pdf";

export function useHealthDeclarationFormUrl(): string {
  const { documentTypes } = useDocumentType();
  const template = documentTypes.find((dt) => dt.code === "health_declaration_form");
  return template?.static_template_file_url || HEALTH_DECLARATION_FORM_FALLBACK_URL;
}
