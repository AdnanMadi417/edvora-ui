import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditUniversityForm from "features/universities/configuration/components/admin/form/EditUniversityForm";

const mockUpdate = jest.fn();
const mockPush = jest.fn();
const university = {
  id: "type-1",
  name: "Standard application",
  description: "Standard application requirements.",
  required_fields: [
    {
      id: "rule-phone",
      field_key: "student.phone",
      field_name: "Student phone",
      is_required: true,
    },
    {
      id: "rule-address",
      field_key: "student.current_address",
      field_name: "Student address",
      is_required: false,
    },
  ],
};
const mockState = {
  university: university as typeof university | null,
  loading: false,
  error: null as string | null,
  saving: false,
};
jest.mock("features/universities/configuration/hooks", () => ({
  useUniversityTypeDetails: () => ({
    university: mockState.university,
    loading: mockState.loading,
    error: mockState.error,
  }),
  useUpdateUniversityType: () => ({
    updateUniversityType: mockUpdate,
    loading: mockState.saving,
  }),
}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
beforeEach(() => {
  jest.clearAllMocks();
  mockUpdate.mockResolvedValue(undefined);
  Object.assign(mockState, {
    university,
    loading: false,
    error: null,
    saving: false,
  });
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

it("edits name, description and existing rule IDs without changing the update contract", async () => {
  const user = userEvent.setup();
  render(<EditUniversityForm id="type-1" />);
  expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await user.clear(screen.getByRole("textbox", { name: "Description" }));
  await user.type(
    screen.getByRole("textbox", { name: "Description" }),
    " Updated submission requirements. "
  );
  await user.click(screen.getByRole("switch", { name: "Student address" }));
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(mockUpdate).toHaveBeenCalledWith({
    name: university.name,
    description: "Updated submission requirements.",
    required_fields: [
      { id: "rule-phone", is_required: true },
      { id: "rule-address", is_required: true },
    ],
  });
  expect(mockPush).toHaveBeenCalledWith("/admin/config-universities/type-1");
});

it("keeps fields visible and locked while saving", () => {
  mockState.saving = true;
  render(<EditUniversityForm id="type-1" />);
  expect(screen.getByRole("textbox", { name: "Category type" })).toBeDisabled();
  expect(screen.getByRole("switch", { name: "Student phone" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
});

it("shows detail loading separately from save loading", () => {
  mockState.loading = true;
  mockState.university = null;
  render(<EditUniversityForm id="type-1" />);
  expect(screen.getByText("Loading university type...")).toBeInTheDocument();
  expect(
    screen.queryByText("University type unavailable")
  ).not.toBeInTheDocument();
});
