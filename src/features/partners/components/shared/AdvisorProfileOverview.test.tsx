import { render, screen } from "@testing-library/react";
import AdvisorProfileOverview from "./AdvisorProfileOverview";
import type { PartnerDetails } from "features/partners/types";
const partner: PartnerDetails = {
  id: "advisor",
  user_id: "user",
  name: "Primary Contact",
  email: "contact@example.test",
  type: "agency",
  country: "Malaysia",
  nationality: "Malaysia",
  phone: "+60123456789",
  is_active: true,
  is_verified: true,
  assigned_manager_id: "manager",
  assigned_manager_name: "Daniel Tan",
  individual_details: null,
  company_details: {
    company_name: "Study Agency",
    website_url: "https://example.test",
    company_registration_doc_file_key: "registration.pdf",
    company_registration_doc_file_url: "",
    contact_id_document_file_key: "",
    contact_id_document_file_url: "",
    passport_photo_file_key: "photo.jpg",
  },
  created_at: "2026-01-01",
  updated_at: "2026-01-02",
  last_login: null,
  agency_role: "admin",
  agency_membership: null,
};
it("groups company details, documents, contact links and manager controls", () => {
  const renderDocument = jest.fn((label: string) => <p>{label}</p>);
  render(
    <AdvisorProfileOverview
      partner={partner}
      renderDocument={renderDocument}
      managers={<p>Manager controls</p>}
    />
  );
  expect(
    screen.getByRole("heading", { name: "Company information" })
  ).toBeInTheDocument();
  expect(screen.getByText("Study Agency")).toBeInTheDocument();
  expect(renderDocument).toHaveBeenCalledWith(
    "Company registration document",
    "registration.pdf"
  );
  expect(
    screen.getByRole("link", { name: "contact@example.test" })
  ).toHaveAttribute("href", "mailto:contact@example.test");
  expect(screen.getByText("Daniel Tan")).toBeInTheDocument();
  expect(screen.getByText("Manager controls")).toBeInTheDocument();
  expect(screen.getByText("2 available")).toBeInTheDocument();
});
it("preserves individual document visibility and personal details", () => {
  const renderDocument = jest.fn((label: string) => <p>{label}</p>);
  render(
    <AdvisorProfileOverview
      partner={{
        ...partner,
        type: "individual",
        company_details: null,
        individual_details: {
          id_document_file_key: null,
          id_document_file_url: null,
          background: "Education consultant",
          social_media_url: null,
          linkedin_url: "https://example.test/linkedin",
          profile_photo_file_key: "profile.jpg",
          passport_photo_file_key: "passport.jpg",
        },
      }}
      renderDocument={renderDocument}
      showProfilePhoto
    />
  );
  expect(
    screen.getByRole("heading", { name: "Personal information" })
  ).toBeInTheDocument();
  expect(screen.getByText("Education consultant")).toBeInTheDocument();
  expect(renderDocument).toHaveBeenCalledWith("Profile photo", "profile.jpg");
  expect(renderDocument).toHaveBeenCalledWith("Passport photo", "passport.jpg");
  expect(screen.queryByText("Manager controls")).not.toBeInTheDocument();
});
