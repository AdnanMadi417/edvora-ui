import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateBankPage from "./CreateBankPage";
import EditBankDetails from "./EditBankDetails";

const mockPush = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockUseBank = jest.fn();
const mockCreateState = { loading: false };
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("../hooks", () => ({
  useCreateBank: () => ({ createBank: mockCreate, ...mockCreateState }),
  useBank: () => mockUseBank(),
  useUpdateBank: () => ({ updateBank: mockUpdate, loading: false }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateState.loading = false;
});

it("creates a bank from the redesigned form with the original payload and redirect", async () => {
  mockCreate.mockResolvedValue({ id: "bank-1" });
  render(<CreateBankPage basePath="/data-entry/banks" />);
  expect(screen.getByRole("button", { name: "Add bank" })).toBeDisabled();
  await userEvent.selectOptions(
    screen.getByRole("combobox", { name: "Country" }),
    "MY"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: "Bank Code" }),
    " MBB "
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: "Bank Name" }),
    " Maybank {Enter}"
  );
  expect(mockCreate).toHaveBeenCalledWith({
    country: "MY",
    code: "MBB",
    swift_code: undefined,
    name: "Maybank",
    is_active: true,
  });
  expect(mockPush).toHaveBeenCalledWith("/data-entry/banks/bank-1");
});

it("keeps the create form open and identifies duplicate bank codes", async () => {
  mockCreate.mockRejectedValue({
    isAxiosError: true,
    response: { data: { code: "bank_already_exists" } },
  });
  render(<CreateBankPage />);
  await userEvent.selectOptions(
    screen.getByRole("combobox", { name: "Country" }),
    "MY"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: "Bank Code" }),
    "MBB"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: "Bank Name" }),
    "Maybank"
  );
  await userEvent.click(screen.getByRole("button", { name: "Add bank" }));
  expect(
    await screen.findByText("A bank with this country and code already exists.")
  ).toBeInTheDocument();
  expect(mockPush).not.toHaveBeenCalled();
});

it("does not offer save actions when the bank cannot be found", () => {
  mockUseBank.mockReturnValue({
    bank: null,
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
  render(<EditBankDetails id="missing" />);
  expect(screen.getByText("Bank not found")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Save changes" })
  ).not.toBeInTheDocument();
});
