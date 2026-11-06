import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PendingRegistrationOtpsTable from "./PendingRegistrationOtpsTable";
const mockResend = jest.fn();
const mockRefetch = jest.fn();
jest.mock("features/partners/hooks", () => ({
  usePendingRegistrationOtps: () => ({
    items: [
      {
        email: "new@example.test",
        full_name: "New Adviser",
        partner_type: "individual",
        progress: "otp_pending",
        resend_count: 1,
        created_at: null,
        expires_at: null,
      },
      {
        email: "done@example.test",
        full_name: "Registered Adviser",
        partner_type: "individual",
        progress: "completed",
        resend_count: 0,
        created_at: null,
        expires_at: null,
      },
    ],
    total: 2,
    loading: false,
    error: null,
    refetch: mockRefetch,
  }),
  useAdminResendRegistrationOtp: () => ({
    resendRegistrationOtp: mockResend,
    loading: false,
  }),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
beforeEach(() => {
  jest.clearAllMocks();
  mockResend.mockResolvedValue({ message: "Code resent" });
});
it("keeps completed registrations ineligible for resend", () => {
  render(<PendingRegistrationOtpsTable />);
  expect(
    screen.getByRole("button", { name: "Resend limit reached" })
  ).toBeDisabled();
});
it("requires confirmation before sending a verification code", async () => {
  const user = userEvent.setup();
  render(<PendingRegistrationOtpsTable />);
  await user.click(
    screen.getByRole("button", { name: "Resend verification code (2 left)" })
  );
  expect(mockResend).not.toHaveBeenCalled();
  await user.click(
    within(
      screen.getByRole("dialog", { name: "Resend verification code" })
    ).getByRole("button", { name: "Resend code" })
  );
  expect(mockResend).toHaveBeenCalledWith("new@example.test");
  expect(mockRefetch).toHaveBeenCalled();
});
