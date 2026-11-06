import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UniversityTypeForm from "features/universities/configuration/components/admin/form/UniversityTypeForm";

const mockCreate = jest.fn();
const mockPush = jest.fn();
const mockRefetch = jest.fn();
const fields = [
  { id: "phone-id", field_key: "student.phone", field_name: "Student phone" },
  {
    id: "education-id",
    field_key: "student.previous_educations",
    field_name: "Previous education",
  },
];
const mockState = { saving: false, loading: false, error: "", fields };
jest.mock("features/universities/configuration/hooks", () => ({
  useCreateUniversityType: () => ({
    createUniversityType: mockCreate,
    loading: mockState.saving,
  }),
  useApplicationSubmissionFields: () => ({
    submissionFields: mockState.fields,
    loading: mockState.loading,
    error: mockState.error,
    refetch: mockRefetch,
  }),
}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCreate.mockResolvedValue(undefined);
  Object.assign(mockState, {
    saving: false,
    loading: false,
    error: "",
    fields,
  });
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

async function fillDetails() {
  await userEvent.type(
    screen.getByRole("textbox", { name: "Category type" }),
    " Standard application "
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: "Description" }),
    " Standard requirements for private institutions. "
  );
}

it("keeps existing validation and submits the trimmed fields and touched requirement choices", async () => {
  render(<UniversityTypeForm basePath="/data-entry/config-universities" />);
  const create = screen.getByRole("button", { name: "Create type" });
  expect(create).toBeDisabled();
  await userEvent.type(
    screen.getByRole("textbox", { name: "Category type" }),
    "AB"
  );
  await userEvent.tab();
  expect(
    screen.getByText("Name must be at least 3 characters")
  ).toBeInTheDocument();
  await userEvent.clear(screen.getByRole("textbox", { name: "Category type" }));
  await fillDetails();
  await userEvent.click(screen.getByRole("switch", { name: "Student phone" }));
  const summary = screen.getByRole("complementary", { name: "At a glance" });
  expect(within(summary).getByText("Student phone")).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("switch", { name: "Previous education" })
  );
  await userEvent.click(
    screen.getByRole("switch", { name: "Previous education" })
  );
  await userEvent.click(create);
  expect(mockCreate).toHaveBeenCalledWith({
    name: "Standard application",
    description: "Standard requirements for private institutions.",
    required_fields: [
      { application_submission_field_id: "phone-id", is_required: true },
      { application_submission_field_id: "education-id", is_required: false },
    ],
  });
  expect(mockPush).toHaveBeenCalledWith("/data-entry/config-universities");
});

it("does not create an untouched requirement map when no fields are selected", async () => {
  render(<UniversityTypeForm />);
  await fillDetails();
  await userEvent.click(
    screen.getByRole("button", { name: "Create type" })
  );
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({ required_fields: [] })
  );
});

it("handles loading and fetch failures without losing entered details, and offers retry", async () => {
  mockState.loading = true;
  const { rerender } = render(<UniversityTypeForm />);
  expect(
    screen.getByRole("status", { name: "Loading application fields" })
  ).toBeInTheDocument();
  await fillDetails();
  expect(
    screen.getByRole("button", { name: "Create type" })
  ).toBeDisabled();
  mockState.loading = false;
  mockState.error = "Connection interrupted";
  rerender(<UniversityTypeForm />);
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(mockRefetch).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("textbox", { name: "Category type" })).toHaveValue(
    " Standard application "
  );
  expect(
    screen.getByRole("button", { name: "Create type" })
  ).toBeDisabled();
});

it("locks fields and cancel during save and keeps backend validation attached to the field", async () => {
  const { rerender } = render(<UniversityTypeForm />);
  await fillDetails();
  mockCreate.mockRejectedValue({
    isAxiosError: true,
    response: {
      data: {
        details: [
          {
            loc: ["body", "name"],
            msg: "This category name is already in use",
          },
        ],
      },
    },
  });
  await userEvent.click(
    screen.getByRole("button", { name: "Create type" })
  );
  expect(
    await screen.findByText("This category name is already in use")
  ).toBeInTheDocument();
  expect(mockPush).not.toHaveBeenCalled();
  mockState.saving = true;
  rerender(<UniversityTypeForm />);
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  expect(screen.getByRole("textbox", { name: "Category type" })).toBeDisabled();
  expect(screen.getByRole("switch", { name: "Student phone" })).toBeDisabled();
});
