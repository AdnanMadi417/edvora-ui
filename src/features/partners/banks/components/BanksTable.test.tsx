import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BanksTable from "./BanksTable";
import { rowAction, queryRowAction } from "testUtils/rowActions";
const mockUseBanks = jest.fn();
const mockUpdate = jest.fn();
const mockRefresh = jest.fn();
jest.mock("../hooks", () => ({
  useBanks: (params: any) => mockUseBanks(params),
  useUpdateBank: () => ({ updateBank: mockUpdate }),
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
  mockUpdate.mockResolvedValue({});
  mockUseBanks.mockReturnValue({
    banks: [
      {
        id: "active",
        name: "Active Bank",
        country: "MY",
        code: "ACTIVE",
        swift_code: null,
        is_active: true,
      },
      {
        id: "inactive",
        name: "Retired Bank",
        country: "MY",
        code: "OLD",
        swift_code: "OLDCODE",
        is_active: false,
      },
    ],
    loading: false,
    error: null,
    refetch: mockRefresh,
  });
});
it("applies country and inactive-only filters from the drawer", async () => {
  const user = userEvent.setup();
  render(<BanksTable />);
  await user.click(screen.getByRole("button", { name: "Filters" }));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Country" }),
    "MY"
  );
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Status" }),
    "inactive"
  );
  expect(mockUseBanks).toHaveBeenLastCalledWith({
    country: undefined,
    include_inactive: true,
  });
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  expect(mockUseBanks).toHaveBeenLastCalledWith({
    country: "MY",
    include_inactive: true,
  });
  await waitFor(() =>
    expect(
      queryRowAction("View Active Bank")
    ).not.toBeInTheDocument()
  );
  expect(
    rowAction("View Retired Bank")
  ).toBeInTheDocument();
});
it("updates only bank availability from the row action", async () => {
  const user = userEvent.setup();
  render(<BanksTable />);
  await user.click(
    rowAction("Deactivate Active Bank")
  );
  expect(mockUpdate).toHaveBeenCalledWith("active", { is_active: false });
  expect(mockRefresh).toHaveBeenCalled();
});
it("preserves data-entry routes and searches SWIFT codes", async () => {
  const user = userEvent.setup();
  render(<BanksTable basePath="/data-entry/banks" />);
  await user.type(
    screen.getByPlaceholderText("Search by bank name, code, or SWIFT code..."),
    "OLDCODE"
  );
  await waitFor(() =>
    expect(
      queryRowAction("View Active Bank")
    ).not.toBeInTheDocument()
  );
  expect(
    rowAction("View Retired Bank")
  ).toHaveAttribute("href", "/data-entry/banks/inactive");
  expect(screen.getByRole("link", { name: "Add bank" })).toHaveAttribute(
    "href",
    "/data-entry/banks/create"
  );
});
