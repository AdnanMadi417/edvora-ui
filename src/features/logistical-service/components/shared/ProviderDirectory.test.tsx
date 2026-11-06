import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProviderDirectory from "./ProviderDirectory";
const mockDelete = jest.fn();
const mockEditService = jest.fn();
const mockRefetch = jest.fn();
jest.mock("features/logistical-service/hooks", () => ({
  useLogisticProviders: () => ({
    serviceProviders: [
      {
        id: "active",
        name: "Airport Assist",
        nationality: "Malaysian",
        main_location: "Selangor",
        is_active: true,
        services_offered: [
          { id: "pickup", name: "Airport transfer", price: 100 },
        ],
      },
      {
        id: "inactive",
        name: "City Support",
        nationality: "Malaysian",
        main_location: "Kuala Lumpur",
        is_active: false,
        services_offered: [],
      },
    ],
    loading: false,
    error: null,
    refetch: mockRefetch,
  }),
  useDeleteLogisticProvider: () => ({
    deleteProvider: mockDelete,
    isDeleting: false,
  }),
  useLogisticServices: () => ({
    logisticServices: [{ id: "pickup", name: "Airport transfer" }],
    loadingLogisticServices: false,
    errorLogisticServices: null,
    refetchLogisticServices: mockRefetch,
  }),
  useEditLogisticService: () => ({
    editLogisticService: mockEditService,
    loadingEditLogisticService: false,
  }),
  useDeleteLogisticService: () => ({
    deleteLogisticService: jest.fn(),
    isDeleting: false,
  }),
  useCreateLogisticService: () => ({
    createLogisticService: jest.fn(),
    loadingCreateLogisticService: false,
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
  mockDelete.mockResolvedValue(undefined);
  mockEditService.mockResolvedValue(undefined);
});
it("applies status and location filters together", async () => {
  const user = userEvent.setup();
  render(<ProviderDirectory />);
  await user.click(screen.getByRole("button", { name: "Filters" }));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Status" }),
    "active"
  );
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Main location" }),
    "Selangor"
  );
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("link", { name: "View City Support" })
    ).not.toBeInTheDocument()
  );
  expect(
    screen.getByRole("link", { name: "View Airport Assist" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Filters (2)" })
  ).toBeInTheDocument();
});
it("requires confirmation to delete a provider", async () => {
  const user = userEvent.setup();
  render(<ProviderDirectory />);
  await user.click(screen.getByRole("button", { name: "Delete City Support" }));
  expect(mockDelete).not.toHaveBeenCalled();
  await user.click(
    within(
      screen.getByRole("dialog", { name: "Delete logistics provider" })
    ).getByRole("button", { name: "Delete provider" })
  );
  expect(mockDelete).toHaveBeenCalledWith("inactive");
});
it("offers data-entry details and edit links without deletion", () => {
  render(
    <ProviderDirectory
      basePath="/data-entry/logistics-marketplace"
      allowDelete={false}
    />
  );
  expect(
    screen.getByRole("link", { name: "View Airport Assist" })
  ).toHaveAttribute("href", "/data-entry/logistics-marketplace/active");
  expect(
    screen.getByRole("link", { name: "Edit Airport Assist" })
  ).toHaveAttribute("href", "/data-entry/logistics-marketplace/active/edit");
  expect(
    screen.queryByRole("button", { name: "Delete Airport Assist" })
  ).not.toBeInTheDocument();
});
