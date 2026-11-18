import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import AgencyMemberSubmitProfile from "features/agency-members/components/public/AgencyMemberSubmitProfile";
import { agencyInvitationsApi } from "features/agency-members/services";
import { uploadPublicPartnerFile } from "services/publicUploadService";

let mockParams = new URLSearchParams("token=invite-inv_002");
jest.mock("next/navigation", () => ({
  useSearchParams: () => mockParams,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/team/accept-invite",
}));

jest.mock("features/agency-members/services", () => ({
  agencyInvitationsApi: { verifyOtp: jest.fn(), resendOtp: jest.fn(), submit: jest.fn() },
  agencyMembersApi: {},
}));

jest.mock("services/publicUploadService", () => ({ uploadPublicPartnerFile: jest.fn() }));
jest.mock("utils/scrollToError", () => ({ scrollToFirstError: jest.fn() }));

const api = agencyInvitationsApi as jest.Mocked<typeof agencyInvitationsApi>;
const upload = uploadPublicPartnerFile as jest.MockedFunction<typeof uploadPublicPartnerFile>;

const apiError = (status: number, code: string) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: {},
    data: { code, message: code, details: null },
  } as unknown as AxiosResponse);

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = new URLSearchParams("token=invite-inv_002");
  upload.mockImplementation(async (file: File) => ({ file_key: `key/${file.name}`, file_url: `https://cdn.test/${file.name}` }));
  global.URL.createObjectURL = jest.fn(() => "blob:preview");
  global.URL.revokeObjectURL = jest.fn();
});

const chooseOption = async (user: ReturnType<typeof userEvent.setup>, name: string, text: string) => {
  await user.click(screen.getByRole("combobox", { name }));
  await user.click(await screen.findByRole("option", { name: text }));
};

const attach = (container: HTMLElement, index: number, file: File) => {
  fireEvent.change(container.querySelectorAll('input[type="file"]')[index], { target: { files: [file] } });
};

it("has one h1 and blocks submit until the required fields are filled, with each error on its field", async () => {
  const user = userEvent.setup();
  render(<AgencyMemberSubmitProfile />);

  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  await user.click(screen.getByRole("button", { name: "Create my account" }));

  expect(api.submit).not.toHaveBeenCalled();
  for (const message of [
    "Add a profile photo",
    "Enter your phone number",
    "Choose your country of residence",
    "Choose your nationality",
    "Enter your date of birth",
    "Enter your passport number",
    "Choose the option that best describes you",
    "Upload a photo of your passport",
    "Enter a link to one of your social media accounts",
  ]) {
    expect(screen.getByText(message)).toBeInTheDocument();
  }
  expect(screen.getByLabelText("Passport number")).toHaveAccessibleDescription("Enter your passport number");
  // LinkedIn is optional.
  expect(screen.getByText("LinkedIn profile").textContent).toMatch(/optional/);
});

it("submits the profile with the link's token and shows the next step", async () => {
  api.submit.mockResolvedValueOnce({ data: { message: "ok", reference_id: "p_1" } } as AxiosResponse<{ message: string; reference_id: string }>);
  const user = userEvent.setup();
  const { container } = render(<AgencyMemberSubmitProfile />);

  attach(container, 0, new File(["img"], "me.png", { type: "image/png" }));
  attach(container, 1, new File(["pdf"], "passport.pdf", { type: "application/pdf" }));
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(2));

  await user.type(screen.getByRole("textbox", { name: /Phone number/ }), "123456789");
  await chooseOption(user, "Country of residence", "Malaysia");
  await chooseOption(user, "Nationality", "Nigerian");
  fireEvent.change(screen.getByLabelText("Date of birth"), { target: { value: "1995-04-12" } });
  await user.type(screen.getByLabelText("Passport number"), "A1234567");
  await user.click(screen.getByRole("radio", { name: /Teacher/ }));
  await user.type(screen.getByLabelText("Social media account"), "https://instagram.com/me");

  await user.click(screen.getByRole("button", { name: "Create my account" }));

  await waitFor(() => expect(api.submit).toHaveBeenCalledTimes(1));
  expect(api.submit).toHaveBeenCalledWith(
    expect.objectContaining({
      submission_token: "invite-inv_002",
      phone: "+60 123456789",
      country: "Malaysia",
      nationality: "Nigerian",
      date_of_birth: "1995-04-12",
      passport_number: "A1234567",
      background: "teacher",
      social_media_url: "https://instagram.com/me",
      profile_photo_file_key: "key/me.png",
      passport_photo_file_key: "key/passport.pdf",
    }),
  );
  expect(await screen.findByRole("heading", { level: 1, name: "You're all set" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Go to sign in" })).toBeInTheDocument();
});

it("explains an expired link and who can send a new one", async () => {
  api.submit.mockRejectedValueOnce(apiError(410, "submission_link_expired"));
  const user = userEvent.setup();
  const { container } = render(<AgencyMemberSubmitProfile />);

  attach(container, 0, new File(["img"], "me.png", { type: "image/png" }));
  attach(container, 1, new File(["pdf"], "passport.pdf", { type: "application/pdf" }));
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(2));
  await user.type(screen.getByRole("textbox", { name: /Phone number/ }), "123456789");
  await chooseOption(user, "Country of residence", "Malaysia");
  await chooseOption(user, "Nationality", "Nigerian");
  fireEvent.change(screen.getByLabelText("Date of birth"), { target: { value: "1995-04-12" } });
  await user.type(screen.getByLabelText("Passport number"), "A1234567");
  await user.click(screen.getByRole("radio", { name: /Teacher/ }));
  await user.type(screen.getByLabelText("Social media account"), "https://instagram.com/me");
  await user.click(screen.getByRole("button", { name: "Create my account" }));

  expect(await screen.findByRole("heading", { level: 1, name: "This link has expired" })).toBeInTheDocument();
  expect(screen.getByText(/Ask your agency admin to resend your profile link/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Message Unibexs support/ })).toBeInTheDocument();
});

it("explains a link with no token instead of showing a blank page", () => {
  mockParams = new URLSearchParams();
  render(<AgencyMemberSubmitProfile />);
  expect(screen.getByRole("heading", { level: 1, name: "This link is incomplete" })).toBeInTheDocument();
  expect(screen.getByText(/ask your agency admin to resend your profile link/)).toBeInTheDocument();
});
