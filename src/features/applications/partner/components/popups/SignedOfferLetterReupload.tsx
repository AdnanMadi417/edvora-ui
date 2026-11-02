"use client";

import { useSignedOfferLetterDocumentUpload } from "features/applications/hooks/files/useSignedOfferLetterDocumentUpload";
import FormReuploadDialog from "./FormReuploadDialog";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_status_for_signed_offer_letter_reupload: "This application isn't currently awaiting a signed offer letter.",
};

interface SignedOfferLetterReuploadProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  correctionReason?: string | null;
  onRefetch?: () => void;
}

export default function SignedOfferLetterReupload(props: SignedOfferLetterReuploadProps) {
  const { uploadSignedOfferLetterDocument, isUploading } = useSignedOfferLetterDocumentUpload();
  return <FormReuploadDialog {...props} formName="signed offer letter" fieldId="signed_offer_letter" upload={uploadSignedOfferLetterDocument} isUploading={isUploading} errorMessages={ERROR_MESSAGES} />;
}
