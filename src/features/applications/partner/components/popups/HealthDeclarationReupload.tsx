"use client";

import { useHealthDeclarationDocumentUpload } from "features/applications/hooks/files/useHealthDeclarationDocumentUpload";
import FormReuploadDialog from "./FormReuploadDialog";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_status_for_health_declaration_reupload: "This application isn't currently awaiting a health declaration form.",
};

interface HealthDeclarationReuploadProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  correctionReason?: string | null;
  onRefetch?: () => void;
}

export default function HealthDeclarationReupload(props: HealthDeclarationReuploadProps) {
  const { uploadHealthDeclarationDocument, isUploading } = useHealthDeclarationDocumentUpload();
  return <FormReuploadDialog {...props} formName="health declaration form" fieldId="health_declaration_form" upload={uploadHealthDeclarationDocument} isUploading={isUploading} errorMessages={ERROR_MESSAGES} />;
}
