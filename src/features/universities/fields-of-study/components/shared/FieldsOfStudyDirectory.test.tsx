import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FieldsOfStudyDirectory from "./FieldsOfStudyDirectory";
const mockDelete = jest.fn();
jest.mock("../../hooks", () => ({
  useAllFields: () => ({
    fields: [
      { id: "science", name: "Computer Science", code: "CS", is_active: true },
      { id: "arts", name: "Arts", code: "ART", is_active: false },
    ],
    fieldsLoading: false,
    fieldsError: "",
    refetch: jest.fn(),
  }),
  useDeleteField: () => ({ deleteField: mockDelete, isDeleting: false }),
  useCreateFieldOfStudy: () => ({
    CreateFieldOfStudy: jest.fn(),
    fieldLoading: false,
  }),
  useUpdateFieldOfStudy: () => ({
    updateFieldOfStudy: jest.fn(),
    fieldLoading: false,
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
});
it("applies status filters only after confirmation", async () => {
  const user = userEvent.setup();
  render(<FieldsOfStudyDirectory />);
  await user.click(screen.getByRole("button", { name: "Filters" }));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Status" }),
    "active"
  );
  expect(screen.getByRole("button", { name: "View Arts" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("button", { name: "View Arts" })
    ).not.toBeInTheDocument()
  );
  expect(
    screen.getByRole("button", { name: "View Computer Science" })
  ).toBeInTheDocument();
});
it("requires confirmation before deletion", async () => {
  const user = userEvent.setup();
  render(<FieldsOfStudyDirectory />);
  await user.click(screen.getByRole("button", { name: "Delete Arts" }));
  expect(mockDelete).not.toHaveBeenCalled();
  await user.click(
    within(
      screen.getByRole("dialog", { name: "Delete field of study" })
    ).getByRole("button", { name: "Delete field" })
  );
  expect(mockDelete).toHaveBeenCalledWith("arts");
});
it("keeps data-entry editing without delete actions", () => {
  render(<FieldsOfStudyDirectory allowDelete={false} />);
  expect(screen.getByRole("button", { name: "Edit Arts" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Delete Arts" })
  ).not.toBeInTheDocument();
});
