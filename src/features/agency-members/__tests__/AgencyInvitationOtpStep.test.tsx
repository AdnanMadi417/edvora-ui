import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import AgencyInvitationOtpStep from "features/agency-members/components/public/AgencyInvitationOtpStep";
import { agencyInvitationsApi } from "features/agency-members/services";
import { SUPPORT_WHATSAPP_URL } from "constants/support";

let mockParams = new URLSearchParams("email=chiamaka.nwosu@mail.com");
jest.mock("next/navigation", () => ({
  useSearchParams: () => mockParams,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/team/verify-otp",
}));

jest.mock("features/agency-members/services", () => ({
  agencyInvitationsApi: { verifyOtp: jest.fn(), resendOtp: jest.fn(), submit: jest.fn() },
  agencyMembersApi: {},
}));

const api = agencyInvitationsApi as jest.Mocked<typeof agencyInvitationsApi>;

/** A rejected request shaped like the backend's errors: `{ code, message, details }`. */
const apiError = (status: number, code: string, details: unknown = null) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: {},
    data: { code, message: code, details },
  } as unknown as AxiosResponse);
const ok = () => Promise.resolve({ data: { message: "ok" } } as AxiosResponse<{ message: string }>);

const setup = () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<AgencyInvitationOtpStep />);
  return user;
};

const enterCode = async (user: ReturnType<typeof userEvent.setup>, code = "123456") => {
  await user.click(screen.getByRole("textbox", { name: "Digit 1 of 6" }));
  await user.paste(code);
  await user.click(screen.getByRole("button", { name: "Verify" }));
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockParams = new URLSearchParams("email=chiamaka.nwosu@mail.com");
});

afterEach(() => {
  jest.useRealTimers();
});

it("has one h1 and names the email the code went to", () => {
  setup();
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1, name: "Verify your email" })).toBeInTheDocument();
  expect(screen.getByText("chiamaka.nwosu@mail.com")).toBeInTheDocument();
});

it("asks for every digit before calling the API", async () => {
  const user = setup();
  await user.click(screen.getByRole("button", { name: "Verify" }));
  expect(screen.getByText("Enter all 6 digits of the code")).toBeInTheDocument();
  expect(api.verifyOtp).not.toHaveBeenCalled();
});

it("keeps the person on the step when the code is wrong and says how many tries are left", async () => {
  api.verifyOtp.mockRejectedValueOnce(apiError(422, "otp_invalid", { attempts_remaining: 2 }));
  const user = setup();
  await enterCode(user, "111111");

  expect(api.verifyOtp).toHaveBeenCalledWith("chiamaka.nwosu@mail.com", "111111");
  const error = await screen.findByText(/That code isn't right.*2 tries left\./);
  expect(error).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1, name: "Verify your email" })).toBeInTheDocument();
  // The error is tied to the code field.
  expect(screen.getByRole("group", { name: "Verification code" })).toHaveAccessibleDescription(/That code isn't right/);
  expect(screen.getByRole("textbox", { name: "Digit 1 of 6" })).toHaveValue("");
});

it("shows the check-your-email screen once the code is right", async () => {
  api.verifyOtp.mockImplementationOnce(ok);
  const user = setup();
  await enterCode(user);
  expect(await screen.findByRole("heading", { level: 1, name: "Check your email" })).toBeInTheDocument();
  expect(screen.getByText(/works for 48 hours/)).toBeInTheDocument();
});

it("offers a new code straight away when the code has expired, then returns to the code step", async () => {
  api.verifyOtp.mockRejectedValueOnce(apiError(410, "otp_expired"));
  api.resendOtp.mockImplementationOnce(ok);
  const user = setup();
  await enterCode(user);

  expect(await screen.findByRole("heading", { level: 1, name: "Your code has expired" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Message Unibexs support/ })).toHaveAttribute("href", SUPPORT_WHATSAPP_URL);

  await user.click(screen.getByRole("button", { name: "Send a new code" }));
  expect(api.resendOtp).toHaveBeenCalledWith("chiamaka.nwosu@mail.com");
  expect(await screen.findByRole("heading", { level: 1, name: "Verify your email" })).toBeInTheDocument();
  expect(screen.getByText(/We sent a new code to chiamaka.nwosu@mail.com/)).toBeInTheDocument();
  expect(screen.getByText(/You can ask for a new code in/)).toBeInTheDocument();
});

it("explains a locked invite (too many wrong codes) and points to the agency admin and Unibexs support", async () => {
  api.verifyOtp.mockRejectedValueOnce(apiError(429, "otp_max_attempts"));
  const user = setup();
  await enterCode(user);

  expect(await screen.findByRole("heading", { level: 1, name: "This invite is locked" })).toBeInTheDocument();
  expect(screen.getByText(/Ask your agency admin to send you a new invite/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Message Unibexs support/ })).toHaveAttribute("href", SUPPORT_WHATSAPP_URL);
  // The invite is used up, so no new code can be sent from here.
  expect(screen.queryByRole("button", { name: "Send a new code" })).not.toBeInTheDocument();
});

it("explains when no open invite matches the email and lets the person try another", async () => {
  api.verifyOtp.mockRejectedValueOnce(apiError(404, "otp_not_found"));
  const user = setup();
  await enterCode(user);

  expect(await screen.findByRole("heading", { level: 1, name: "We can't find an open invite" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Use a different email" }));
  expect(screen.getByRole("textbox", { name: "Email address" })).toBeInTheDocument();
});

describe("resend cooldown", () => {
  it("waits 60 seconds before a new code can be sent, then restarts the timer", async () => {
    api.resendOtp.mockImplementation(ok);
    const user = setup();

    expect(screen.getByText("60s")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send a new code" })).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    expect(screen.getByText("30s")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    await user.click(screen.getByRole("button", { name: "Send a new code" }));
    expect(api.resendOtp).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText("60s")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Send a new code" })).not.toBeInTheDocument();
  });

  it("explains when every new code for the invite has been used", async () => {
    api.resendOtp.mockRejectedValueOnce(apiError(429, "otp_max_resends"));
    const user = setup();
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    await user.click(screen.getByRole("button", { name: "Send a new code" }));
    expect(await screen.findByRole("heading", { level: 1, name: "No more new codes for this invite" })).toBeInTheDocument();
    expect(screen.getByText(/Ask your agency admin to send you a new invite/)).toBeInTheDocument();
  });
});

it("explains a link without an email and asks for it, with the error tied to the field", async () => {
  mockParams = new URLSearchParams();
  const user = setup();

  expect(screen.getByText("This link is missing your email")).toBeInTheDocument();
  const emailField = screen.getByRole("textbox", { name: "Email address" });
  await user.click(screen.getByRole("button", { name: "Verify" }));
  expect(emailField).toHaveAccessibleDescription("Enter the email address your invite was sent to");

  api.verifyOtp.mockImplementationOnce(ok);
  await user.type(emailField, "Chiamaka.Nwosu@mail.com");
  await enterCode(user);
  expect(api.verifyOtp).toHaveBeenCalledWith("chiamaka.nwosu@mail.com", "123456");
});
