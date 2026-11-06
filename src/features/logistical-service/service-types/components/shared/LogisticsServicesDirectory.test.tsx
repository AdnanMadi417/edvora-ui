import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogisticsServicesDirectory from "./LogisticsServicesDirectory";
const mockCreate = jest.fn();
const mockEdit = jest.fn();
const mockDelete = jest.fn();
const mockRefresh = jest.fn();
jest.mock("../../hooks", () => ({
  useLogisticServices: () => ({
    logisticServices: [{ id: "pickup", name: "Airport transfer" }],
    loadingLogisticServices: false,
    errorLogisticServices: null,
    refetchLogisticServices: mockRefresh,
  }),
  useCreateLogisticService: () => ({
    createLogisticService: mockCreate,
    loadingCreateLogisticService: false,
  }),
  useEditLogisticService: () => ({
    editLogisticService: mockEdit,
    loadingEditLogisticService: false,
  }),
  useDeleteLogisticService: () => ({
    deleteLogisticService: mockDelete,
    isDeleting: false,
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
  mockCreate.mockResolvedValue({});
  mockEdit.mockResolvedValue({});
  mockDelete.mockResolvedValue(undefined);
});
it("creates a service with a trimmed name and refreshes", async () => {
  const user = userEvent.setup();
  render(<LogisticsServicesDirectory />);
  await user.click(screen.getByRole("button", { name: "Create service" }));
  await user.type(
    screen.getByRole("textbox", { name: "Service name" }),
    "  Student pickup  "
  );
  await user.click(
    screen.getByRole("button", { name: "Create logistics service" })
  );
  expect(mockCreate).toHaveBeenCalledWith({ name: "Student pickup" });
  expect(mockRefresh).toHaveBeenCalled();
});
it("renames a service without reloading", async () => {
  const user = userEvent.setup();
  render(<LogisticsServicesDirectory />);
  await user.click(
    screen.getByRole("button", { name: "Edit Airport transfer" })
  );
  const input = screen.getByRole("textbox", { name: "Service name" });
  await user.clear(input);
  await user.type(input, "Airport pickup");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(mockEdit).toHaveBeenCalledWith("pickup", { name: "Airport pickup" });
  expect(mockRefresh).toHaveBeenCalled();
});
it("keeps API errors in the open form", async () => {
  mockEdit.mockRejectedValue(new Error("Unable to save"));
  const user = userEvent.setup();
  render(<LogisticsServicesDirectory />);
  await user.click(
    screen.getByRole("button", { name: "Edit Airport transfer" })
  );
  await user.type(
    screen.getByRole("textbox", { name: "Service name" }),
    " updated"
  );
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByRole("alert");
  expect(
    screen.getByRole("dialog", { name: "Edit logistics service" })
  ).toBeInTheDocument();
  expect(mockRefresh).not.toHaveBeenCalled();
});
it("requires confirmation before deletion", async () => {
  const user = userEvent.setup();
  render(<LogisticsServicesDirectory />);
  await user.click(
    screen.getByRole("button", { name: "Delete Airport transfer" })
  );
  expect(mockDelete).not.toHaveBeenCalled();
  await user.click(
    within(
      screen.getByRole("dialog", { name: "Delete logistics service" })
    ).getByRole("button", { name: "Delete service" })
  );
  await waitFor(() => expect(mockDelete).toHaveBeenCalledWith("pickup"));
  expect(mockRefresh).toHaveBeenCalled();
});
it("keeps create/edit available to data-entry without deletion", () => {
  render(<LogisticsServicesDirectory allowDelete={false} />);
  expect(
    screen.getByRole("button", { name: "Create service" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Edit Airport transfer" })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Delete Airport transfer" })
  ).not.toBeInTheDocument();
});
