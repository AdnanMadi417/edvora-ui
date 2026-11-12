import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePasswordPopup from "./ChangePasswordPopup";
import api from "lib/useApi";
jest.mock("lib/useApi", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
beforeEach(() => {
  jest.clearAllMocks();
  (api.post as jest.Mock).mockResolvedValue({});
});
it("preserves the password-change endpoint and payload", async () => {
  const user = userEvent.setup();
  const close = jest.fn();
  render(<ChangePasswordPopup isOpen onClose={close} />);
  await user.type(screen.getByLabelText("Current password"), "CurrentPass123!");
  await user.type(screen.getByLabelText("New password"), "Replacement123!");
  await user.type(
    screen.getByLabelText("Confirm new password"),
    "Replacement123!"
  );
  await user.click(screen.getByRole("button", { name: "Update password" }));
  expect(api.post).toHaveBeenCalledWith("/partners/reset-password", {
    current_password: "CurrentPass123!",
    new_password: "Replacement123!",
  });
  expect(close).toHaveBeenCalled();
});
it("rejects using the current password as the new password", async () => {
  const user = userEvent.setup();
  render(<ChangePasswordPopup isOpen onClose={jest.fn()} />);
  for (const label of [
    "Current password",
    "New password",
    "Confirm new password",
  ])
    await user.type(screen.getByLabelText(label), "CurrentPass123!");
  await user.click(screen.getByRole("button", { name: "Update password" }));
  expect(api.post).not.toHaveBeenCalled();
  expect(
    screen.getByText(
      "New password must be different from your current password"
    )
  ).toBeInTheDocument();
});
