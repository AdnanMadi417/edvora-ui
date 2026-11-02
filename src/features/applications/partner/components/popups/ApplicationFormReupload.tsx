"use client";

import { useApplicationFormDocumentUpload } from "features/applications/hooks/files/useApplicationFormDocumentUpload";
import FormReuploadDialog from "./FormReuploadDialog";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_status_for_application_form_reupload: "This application isn't currently awaiting an application form.",
};

interface ApplicationFormReuploadProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  correctionReason?: string | null;
  onRefetch?: () => void;
}

export default function ApplicationFormReupload(props: ApplicationFormReuploadProps) {
  const { uploadApplicationFormDocument, isUploading } = useApplicationFormDocumentUpload();
  return <FormReuploadDialog {...props} formName="application form" fieldId="application_form" upload={uploadApplicationFormDocument} isUploading={isUploading} errorMessages={ERROR_MESSAGES} />;
}
