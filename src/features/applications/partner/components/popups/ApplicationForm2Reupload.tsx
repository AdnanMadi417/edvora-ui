"use client";

import { useApplicationForm2DocumentUpload } from "features/applications/hooks/files/useApplicationForm2DocumentUpload";
import FormReuploadDialog from "./FormReuploadDialog";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_status_for_application_form_2_reupload: "This application isn't currently awaiting a second application form.",
};

interface ApplicationForm2ReuploadProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  correctionReason?: string | null;
  onRefetch?: () => void;
}

export default function ApplicationForm2Reupload(props: ApplicationForm2ReuploadProps) {
  const { uploadApplicationForm2Document, isUploading } = useApplicationForm2DocumentUpload();
  return <FormReuploadDialog {...props} formName="second application form" fieldId="application_form_2" upload={uploadApplicationForm2Document} isUploading={isUploading} errorMessages={ERROR_MESSAGES} />;
}
