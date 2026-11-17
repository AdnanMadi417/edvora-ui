import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SessionContext,
  type SessionContextValue,
} from "components/context/SessionContext";
import InviteStaffUserModal from "./InviteStaffUserModal";
import { readWorkspace } from "features/language-centre-admin/services/centreWorkspace";
import { selectOption } from "testUtils/selectOption";
const mockInvite = jest.fn();
jest.mock("../../hooks", () => ({
  useInviteStaffUser: () => ({ inviteStaffUser: mockInvite, loading: false }),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
const session: SessionContextValue = {
  status: "ready",
  user: {
    id: "platform",
    role: "admin",
    name: "Admin",
    email: "admin@example.com",
  },
  partner: null,
  isPartnerLoading: false,
  partnerError: null,
  refetchPartner: jest.fn(),
};
it("offers the new role, requires a centre and saves invitations without calling the backend", async () => {
  localStorage.clear();
  const user = userEvent.setup();
  const close = jest.fn();
  render(
    <SessionContext.Provider value={session}>
      <InviteStaffUserModal isOpen onClose={close} />
    </SessionContext.Provider>
  );
  await user.type(
    screen.getByRole("textbox", { name: "Name" }),
    "Centre Staff"
  );
  await user.type(
    screen.getByRole("textbox", { name: "Email" }),
    "centre.staff@example.com"
  );
  await selectOption(
    user,
    screen.getByRole("combobox", { name: "Role" }),
    "language_centre_admin"
  );
  await user.click(screen.getByRole("button", { name: "Save invitation" }));
  expect(screen.getByText("Choose a language centre.")).toBeInTheDocument();
  expect(mockInvite).not.toHaveBeenCalled();
  await selectOption(
    user,
    screen.getByRole("combobox", { name: /^Assigned language centre/ }),
    "lc_001"
  );
  await user.click(screen.getByRole("button", { name: "Save invitation" }));
  await waitFor(() => expect(close).toHaveBeenCalled());
  expect(
    readWorkspace().users.find(
      (member) => member.email === "centre.staff@example.com"
    )
  ).toEqual(expect.objectContaining({ centreId: "lc_001", status: "invited" }));
  expect(mockInvite).not.toHaveBeenCalled();
});
