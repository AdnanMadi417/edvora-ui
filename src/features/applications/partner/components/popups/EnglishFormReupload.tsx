"use client";

import { useEnglishFormDocumentUpload } from "features/applications/hooks/files/useEnglishFormDocumentUpload";
import FormReuploadDialog from "./FormReuploadDialog";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_status_for_english_form_reupload: "This application isn't currently awaiting an English form.",
};

interface EnglishFormReuploadProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  correctionReason?: string | null;
  onRefetch?: () => void;
}

export default function EnglishFormReupload(props: EnglishFormReuploadProps) {
  const { uploadEnglishFormDocument, isUploading } = useEnglishFormDocumentUpload();
  return <FormReuploadDialog {...props} formName="English form" fieldId="english_form" upload={uploadEnglishFormDocument} isUploading={isUploading} errorMessages={ERROR_MESSAGES} />;
}
