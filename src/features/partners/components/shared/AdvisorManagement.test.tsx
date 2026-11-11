import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdvisorDirectoryToolbar from "./AdvisorDirectoryToolbar";
import AdvisorProfileHeader from "./AdvisorProfileHeader";
import ResendApprovalEmailConfirmation from "../admin/ResendApprovalEmailConfirmation";
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("components/ub/data/media/PresignedImage", () => ({
  __esModule: true,
  default: ({ fallback }: any) => fallback,
}));
beforeEach(() => {
  jest.clearAllMocks();
});
it("applies filter drafts only after confirmation", async () => {
  const apply = jest.fn();
  const user = userEvent.setup();
  render(
    <AdvisorDirectoryToolbar
      search=""
      onSearch={jest.fn()}
      total={5}
      managers={[{ value: "manager", label: "Daniel" }]}
      onApply={apply}
      onClear={jest.fn()}
    />
  );
  await user.click(screen.getByRole("button", { name: "Filters" }));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Account manager" }),
    "manager"
  );
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Advisor category" }),
    "active"
  );
  expect(apply).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  expect(apply).toHaveBeenCalledWith("manager", "active");
});
it("hides edit controls for read-only profiles", () => {
  const partner = {
    id: "advisor",
    name: "Test Advisor",
    email: "advisor@example.test",
    type: "individual",
    country: "Malaysia",
    is_active: true,
    company_details: null,
    individual_details: null,
  };
  const view = render(
    <AdvisorProfileHeader
      partner={partner}
      basePath="/account-manager/advisors"
    />
  );
  expect(
    screen.queryByRole("link", { name: "Edit advisor details" })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Advisors" })
  ).toHaveAttribute("href", "/account-manager/advisors");
  view.rerender(
    <AdvisorProfileHeader
      partner={partner}
      basePath="/reviewer/advisors"
      editable
    />
  );
  expect(
    screen.getByRole("link", { name: "Edit advisor details" })
  ).toHaveAttribute("href", "/reviewer/advisors/advisor/edit");
});
it("blocks email resend during cooldown", () => {
  render(
    <ResendApprovalEmailConfirmation
      isOpen
      onClose={jest.fn()}
      onConfirm={jest.fn()}
      isSending={false}
      partnerName="Test Advisor"
      cooldownSeconds={30}
    />
  );
  expect(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Retry in 30s",
    })
  ).toBeDisabled();
});
