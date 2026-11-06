import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PartnerProfile from "./PartnerProfile";
const basePartner = {
  id: "self",
  user_id: "user",
  name: "My Adviser",
  email: "me@example.test",
  type: "individual",
  country: "Malaysia",
  nationality: "Malaysia",
  phone: "+60123456789",
  is_active: true,
  is_verified: true,
  assigned_manager_id: null,
  assigned_manager_name: null,
  individual_details: {
    background: "Education adviser",
    date_of_birth: null,
    passport_number: "P123",
    passport_photo_file_key: null,
  },
  company_details: null,
  created_at: null,
  updated_at: null,
  last_login: null,
  agency_role: null,
  agency_membership: null,
};
let mockPartner: any = basePartner;
jest.mock("features/partners", () => ({
  usePartnerProfile: () => ({
    partner: mockPartner,
    isPartnerLoading: false,
    partnerError: null,
    refetch: jest.fn(),
  }),
  useUpdatePartnerProfile: () => ({ updateProfile: jest.fn() }),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("components/ub/data/media/PresignedImage", () => ({
  __esModule: true,
  default: ({ fallback }: any) => fallback,
}));
jest.mock("features/partners/bank-accounts", () => ({
  PartnerBankAccountSection: ({ viewer }: any) => (
    <p>Bank accounts: {viewer}</p>
  ),
}));
jest.mock("./ChangePasswordPopup", () => ({
  __esModule: true,
  default: ({ isOpen }: any) =>
    isOpen ? (
      <div role="dialog" aria-label="Change password">
        Password form
      </div>
    ) : null,
}));
beforeEach(() => {
  mockPartner = basePartner;
});
it("shows self-service actions and the redesigned personal profile", () => {
  render(<PartnerProfile id="user" />);
  expect(
    screen.getByRole("heading", { name: "Personal information" })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Edit profile" })).toHaveAttribute(
    "href",
    "/partner/profile/edit"
  );
  expect(
    screen.getByRole("button", { name: "Change profile photo" })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Back to advisors" })
  ).not.toBeInTheDocument();
});
it("opens password controls and the self-service bank tab", async () => {
  const user = userEvent.setup();
  render(<PartnerProfile id="user" />);
  await user.click(screen.getByRole("button", { name: "Change password" }));
  expect(
    screen.getByRole("dialog", { name: "Change password" })
  ).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Bank Account" }));
  expect(screen.getByText("Bank accounts: self")).toBeInTheDocument();
});
it("keeps agency members' bank tab hidden", () => {
  mockPartner = { ...basePartner, agency_role: "member" };
  render(<PartnerProfile id="user" />);
  expect(
    screen.queryByRole("tab", { name: "Bank Account" })
  ).not.toBeInTheDocument();
});
it("keeps company team management available", async () => {
  mockPartner = {
    ...basePartner,
    type: "agency",
    agency_role: "admin",
    company_details: {
      company_name: "My Agency",
      website_url: "",
      company_registration_doc_file_key: null,
    },
    agency_members: [],
  };
  const user = userEvent.setup();
  render(<PartnerProfile id="user" />);
  expect(
    screen.getByRole("heading", { name: "Company information" })
  ).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Team" }));
  expect(screen.getByRole("link", { name: "Manage team" })).toHaveAttribute(
    "href",
    "/partner/team-members"
  );
});
