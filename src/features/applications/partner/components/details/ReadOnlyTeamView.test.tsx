import React from "react";
import { render, screen } from "@testing-library/react";
import OfferLetterDecision from "./OfferLetter";
import ApplicationFormsSection from "./ApplicationFormsSection";

// An agency admin viewing a member's application gets readOnly: the member
// does the uploads and forms (the backend refuses the agency admin anyway).
jest.mock("../../../../../components/context/ToastContext", () => ({ useToast: () => ({ showToast: jest.fn() }) }));
jest.mock("../../../shared/useHealthDeclarationFormDownload", () => ({
  useHealthDeclarationFormDownload: () => ({ download: jest.fn(), downloading: false }),
}));
jest.mock("../../../shared/DocumentActions", () => () => null);
jest.mock("./VisaTrackingTimeline", () => () => null);
jest.mock("../../../../../services/offerLetterService", () => ({ submitOfferLetterDecision: jest.fn() }));
jest.mock("../../../../../services/documentService", () => ({ getDocumentDownloadUrl: jest.fn() }));
jest.mock("../popups/ApplicationFormReupload", () => () => null);
jest.mock("../popups/ApplicationForm2Reupload", () => () => null);
jest.mock("../popups/HealthDeclarationReupload", () => () => null);
jest.mock("../popups/SignedOfferLetterReupload", () => () => null);
jest.mock("../popups/EnglishFormReupload", () => () => null);

const universityApproved = {
  id: "app-1",
  student: { name: "Student" },
  offer_letter_document: { file_key: "k", file_name: "offer.pdf", created_at: "2026-10-01T00:00:00Z" },
  stage: { statuses: [{ name: "University Approved" }] },
};

describe("read-only team view", () => {
  it.each([
    [false, true],
    [true, false],
  ])("OfferLetterDecision readOnly=%s shows Accept Offer: %s", (readOnly, shown) => {
    render(<OfferLetterDecision application={universityApproved} visaCase={null} readOnly={readOnly} />);
    expect(!!screen.queryByText("Accept Offer")).toBe(shown);
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
