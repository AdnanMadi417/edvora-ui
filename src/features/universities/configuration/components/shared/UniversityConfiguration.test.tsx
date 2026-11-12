import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UniversityTypeDirectory from "features/universities/configuration/components/shared/UniversityTypeDirectory";
import UniversityTypeDetailsView from "features/universities/configuration/components/shared/UniversityTypeDetailsView";
import { rowAction, queryRowAction } from "testUtils/rowActions";

const mockDelete = jest.fn();
const type = { id: "standard", name: "Standard category", description: "Standard submission requirements.", required_fields: [{ id: "phone", field_key: "student.phone", field_name: "Phone number", is_required: true }, { id: "address", field_key: "student.address", field_name: "Current address", is_required: false }] };
jest.mock("features/universities/configuration/hooks", () => ({ useUniversityTypes: () => ({ universities: [type], loading: false, error: null, refetchUniversityTypes: jest.fn() }), useDeleteUniversityType: () => ({ deleteUniversityType: mockDelete, isDeleting: false }) }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({ useToast: () => ({ showToast: jest.fn() }) }));
beforeAll(() => { global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver; });
beforeEach(() => { jest.clearAllMocks(); mockDelete.mockResolvedValue(undefined); });

it("searches details without changing required/optional totals", async () => {
  const user = userEvent.setup();
  render(<UniversityTypeDetailsView university={type} />);
  await user.selectOptions(screen.getByRole("combobox", { name: "Requirement status" }), "required");
  expect(screen.getByText("Phone number")).toBeInTheDocument();
  expect(screen.queryByText("Current address")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("1 field shown");
  await user.type(screen.getByPlaceholderText("Search field requirements..."), "not found");
  expect(screen.getByText("No fields match your search.")).toBeInTheDocument();
});

it("requires confirmation before deleting a university type", async () => {
  const user = userEvent.setup();
  render(<UniversityTypeDirectory />);
  await user.click(rowAction("Delete Standard category"));
  expect(mockDelete).not.toHaveBeenCalled();
  const modal = screen.getByRole("dialog", { name: "Delete university type" });
  await user.click(within(modal).getByRole("button", { name: "Delete type" }));
  expect(mockDelete).toHaveBeenCalledWith("standard");
});

it("offers data-entry details and edit links without deletion", () => {
  render(<UniversityTypeDirectory basePath="/data-entry/university-configuration" allowDelete={false} />);
  expect(rowAction("View Standard category")).toHaveAttribute("href", "/data-entry/university-configuration/standard");
  expect(screen.getByRole("link", { name: "Edit Standard category" })).toHaveAttribute("href", "/data-entry/university-configuration/standard/edit");
  expect(queryRowAction("Delete Standard category")).not.toBeInTheDocument();
});
