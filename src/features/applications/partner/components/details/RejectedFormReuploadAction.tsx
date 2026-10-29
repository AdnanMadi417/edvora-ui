"use client";

import React, { useState } from "react";
import { FileUp } from "lucide-react";
import Button from "components/ub/core/Button";
import ApplicationFormReupload from "../popups/ApplicationFormReupload";
import ApplicationForm2Reupload from "../popups/ApplicationForm2Reupload";
import HealthDeclarationReupload from "../popups/HealthDeclarationReupload";
import SignedOfferLetterReupload from "../popups/SignedOfferLetterReupload";
import EnglishFormReupload from "../popups/EnglishFormReupload";

const REJECTED_FORM_CONFIG: Record<string, { label: string; Popup: React.ComponentType<any> }> = {
  APPLICATION_FORM_REJECTED: { label: "Application Form", Popup: ApplicationFormReupload },
  APPLICATION_FORM_2_REJECTED: { label: "Application Form 2", Popup: ApplicationForm2Reupload },
  HEALTH_DECLARATION_REJECTED: { label: "Health Declaration Form", Popup: HealthDeclarationReupload },
  SIGNED_OFFER_LETTER_REJECTED: { label: "Signed Offer Letter", Popup: SignedOfferLetterReupload },
  ENGLISH_FORM_REJECTED: { label: "English Form", Popup: EnglishFormReupload },
};

interface RejectedFormReuploadActionProps {
  statusCode?: string | null;
  applicationId: string;
  correctionReason?: string | null;
  readOnly?: boolean;
  onRefetch?: () => void;
}

/**
 * Surfaces the matching "Re-upload X" button + popup directly on the
 * Overview tab whenever the application is sitting in one of the five
 * offer-letter-form rejected statuses, mirroring the per-row button already
 * shown in the Documents tab (ApplicationFormsSection).
 */
export default function RejectedFormReuploadAction({
  statusCode,
  applicationId,
  correctionReason,
  readOnly = false,
  onRefetch,
}: RejectedFormReuploadActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = statusCode ? REJECTED_FORM_CONFIG[statusCode] : undefined;

  if (!config || readOnly) return null;

  const { label, Popup } = config;

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        icon={<FileUp className="h-4 w-4" />}
        text={`Re-upload ${label}`}
        bgColor="bg-red-50"
        textColor="text-red-700"
        borderColor="border-red-600"
        hoverTextColor="hover:text-red-800"
        hoverBorderColor="hover:border-red-700"
        className="w-full hover:bg-red-100"
      />
      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        applicationId={applicationId}
        correctionReason={correctionReason}
        onRefetch={() => {
          setIsOpen(false);
          onRefetch?.();
        }}
      />
    </>
  );
}
