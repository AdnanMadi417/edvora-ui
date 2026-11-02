import type React from "react";
import ApplicationFormReupload from "../popups/ApplicationFormReupload";
import ApplicationForm2Reupload from "../popups/ApplicationForm2Reupload";
import HealthDeclarationReupload from "../popups/HealthDeclarationReupload";
import SignedOfferLetterReupload from "../popups/SignedOfferLetterReupload";
import EnglishFormReupload from "../popups/EnglishFormReupload";

/** The five offer-letter-form rejected statuses and the re-upload popup for each. */
export const REJECTED_FORM_CONFIG: Record<string, { label: string; Popup: React.ComponentType<any> }> = {
  APPLICATION_FORM_REJECTED: { label: "application form", Popup: ApplicationFormReupload },
  APPLICATION_FORM_2_REJECTED: { label: "application form 2", Popup: ApplicationForm2Reupload },
  HEALTH_DECLARATION_REJECTED: { label: "health declaration form", Popup: HealthDeclarationReupload },
  SIGNED_OFFER_LETTER_REJECTED: { label: "signed offer letter", Popup: SignedOfferLetterReupload },
  ENGLISH_FORM_REJECTED: { label: "English form", Popup: EnglishFormReupload },
};
