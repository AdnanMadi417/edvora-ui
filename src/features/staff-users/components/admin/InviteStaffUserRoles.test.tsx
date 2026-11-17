import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionContext, type SessionContextValue } from "components/context/SessionContext";
import InviteStaffUserModal from "./InviteStaffUserModal";

// Default build: the Language Centre Admin feature is hidden from every user.
jest.mock("config/featureFlags", () => ({
  FEATURES: { ...jest.requireActual("config/featureFlags").FEATURES, languageCentreAdmins: false },
}));
jest.mock("../../hooks", () => ({ useInviteStaffUser: () => ({ inviteStaffUser: jest.fn(), loading: false }) }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({ useToast: () => ({ showToast: jest.fn() }) }));

const session: SessionContextValue = {
  status: "ready",
  user: { id: "platform", role: "admin", name: "Admin", email: "admin@example.com" },
  partner: null,
  isPartnerLoading: false,
  partnerError: null,
  refetchPartner: jest.fn(),
};

it("doesn't offer the Language Centre Admin role while the feature is off", async () => {
  const user = userEvent.setup();
  render(
    <SessionContext.Provider value={session}>
      <InviteStaffUserModal isOpen onClose={jest.fn()} />
    </SessionContext.Provider>,
  );
  const trigger = screen.getByRole("combobox", { name: "Role" });
  await user.click(trigger);
  const list = document.getElementById(trigger.getAttribute("aria-controls") ?? "")!;
  const values = within(list).getAllByRole("option").map((o) => o.getAttribute("data-value"));
  expect(values).toEqual(expect.arrayContaining(["admin", "reviewer", "data_entry"]));
  expect(values).not.toContain("language_centre_admin");
});
