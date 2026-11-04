import React from "react";
import { render, screen } from "@testing-library/react";
import { partnerNextAction } from "./partnerNextAction";
import ApplicationFormsSection from "./ApplicationFormsSection";

// An agency admin viewing a member's application gets readOnly: the member
// does the uploads and forms (the backend refuses the agency admin anyway).
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({ useToast: () => ({ showToast: jest.fn() }) }));
jest.mock("../../../shared/useHealthDeclarationFormDownload", () => ({
  useHealthDeclarationFormDownload: () => ({ download: jest.fn(), downloading: false }),
}));
jest.mock("../../../shared/DocumentActions", () => () => null);
jest.mock("../../../../../services/offerLetterService", () => ({ submitOfferLetterDecision: jest.fn() }));
jest.mock("../../../../../services/documentService", () => ({ getDocumentDownloadUrl: jest.fn() }));
jest.mock("../popups/ApplicationFormReupload", () => () => null);
jest.mock("../popups/ApplicationForm2Reupload", () => () => null);
jest.mock("../popups/HealthDeclarationReupload", () => () => null);
jest.mock("../popups/SignedOfferLetterReupload", () => () => null);
jest.mock("../popups/EnglishFormReupload", () => () => null);

describe("read-only team view", () => {
  it.each([
    [false, true],
    [true, false],
  ])("University Approved, readOnly=%s offers Accept offer as the Primary action: %s", (readOnly, shown) => {
    const key = partnerNextAction({
      statusCode: "UNIVERSITY_APPROVED",
      readOnly,
      hasActions: true,
      hasRequiredDocs: false,
      hasDocumentTypes: false,
      hasOfferLetter: true,
      isRejectedForm: false,
    });
    expect(key === "accept-offer").toBe(shown);
  });

  it.each([
    [false, true],
    [true, false],
  ])("ApplicationFormsSection readOnly=%s shows Re-upload on a rejected form: %s", (readOnly, shown) => {
    render(
      <ApplicationFormsSection
        application={{ id: "app-1", documents: [] }}
        actions={{ status_code: "APPLICATION_FORM_REJECTED", is_application_form_required: true } as any}
        readOnly={readOnly}
      />
    );
    expect(!!screen.queryByText("Re-upload")).toBe(shown);
  });
});
