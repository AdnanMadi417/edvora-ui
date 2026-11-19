import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionContext, type SessionContextValue } from "components/context/SessionContext";
import InviteStaffUserModal from "./InviteStaffUserModal";

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

it("offers the three staff roles and nothing else", async () => {
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
  expect(values).toEqual(["admin", "reviewer", "data_entry"]);
});
