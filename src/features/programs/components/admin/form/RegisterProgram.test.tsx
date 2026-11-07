import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterProgram from "./RegisterProgram";

const mockCreate = jest.fn();
const mockCommissionTypes = [{ id: "commission-1", name: "Fixed amount" }];
const mockBranches = [
  {
    id: "branch-1",
    name: "Main campus",
    location: "Subang Jaya",
    state: "Selangor",
  },
];
const mockEmptyBranches: typeof mockBranches = [];
const mockUniversities = [
  { id: "uni-1", name: "Sunway University", is_active: true },
];
const mockQualifications = [{ id: "qual-1", name: "Bachelor" }];
const mockFields = [{ id: "field-1", name: "Computing" }];

jest.mock("features/programs/hooks", () => ({
  useCreateProgram: () => ({ createProgram: mockCreate, loading: false }),
}));
jest.mock("features/knowledge-hub/commission/hooks", () => ({
  useCommissionTypes: () => ({ commissionTypes: mockCommissionTypes }),
}));
jest.mock("features/universities/hooks", () => ({
  useUniversities: () => ({ universities: mockUniversities }),
  useBranches: (id: string) => ({
    branches: id ? mockBranches : mockEmptyBranches,
  }),
}));
jest.mock("features/knowledge-hub/qualifications/hooks", () => ({
  useAllQualifications: () => ({ qualifications: mockQualifications }),
}));
jest.mock("features/knowledge-hub/field-of-study/hooks", () => ({
  useAllFields: () => ({ fields: mockFields }),
}));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock(
  "features/programs/components/shared/form/useUnsavedChangesGuard",
  () => ({
    useUnsavedChangesGuard: jest.fn(),
    confirmDiscard: (_dirty: boolean, action: () => void) => action(),
  })
);
jest.mock("components/ub/forms/text/RichTextEditor", () => ({
  __esModule: true,
  default: ({ label, field, formData, updateFormData }: any) => (
    <label>
      {label}
      <textarea
        value={formData.scholarships[0]?.description || ""}
        onChange={(event) => updateFormData(field, event.target.value)}
      />
    </label>
  ),
}));
jest.mock("components/ub/data/display/RichTextDisplay", () => ({
  __esModule: true,
  default: ({ html }: { html: string }) => <p>{html}</p>,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCreate.mockResolvedValue({ id: "program-1" });
});

async function fillProgramme(container: HTMLElement) {
  await userEvent.type(
    screen.getByRole("textbox", { name: "Program Name" }),
    "BSc Computing"
  );
  for (const [field, name] of [
    ["qualification_id", "Bachelor"],
    ["field_of_study_id", "Computing"],
    ["uni_id", "Sunway University"],
  ]) {
    await userEvent.click(
      within(
        container.querySelector(`[data-field="${field}"]`) as HTMLElement
      ).getByRole("button")
    );
    await userEvent.click(screen.getByRole("option", { name }));
  }
}

it("validates programme details and preserves the dependent branch through review and creation", async () => {
  const { container } = render(<RegisterProgram />);
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Program name is required")).toBeInTheDocument();
  await fillProgramme(container);
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Yearly Fees")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByRole("textbox", { name: "Program Name" })).toHaveValue(
    "BSc Computing"
  );
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Sep" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("BSc Computing")).toBeInTheDocument();
  expect(screen.getByText("Main campus")).toBeInTheDocument();
  expect(screen.getByText("September")).toBeInTheDocument();
  expect(mockCreate).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Create program" }));
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "BSc Computing",
      uni_id: "uni-1",
      branch_id: "branch-1",
      qualification_id: "qual-1",
      field_of_study_id: "field-1",
      commission_type_id: "commission-1",
      intake_months: [9],
      scholarships: [],
      course_type: null,
    })
  );
});

it("blocks invalid fees and scholarship details on their own steps", async () => {
  const { container } = render(<RegisterProgram />);
  await fillProgramme(container);
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  const commission = screen.getByRole("spinbutton", {
    name: /Commission amount/,
  });
  await userEvent.clear(commission);
  await userEvent.type(commission, "30000");
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(
    screen.getByText("Commission amount cannot exceed RM 29,999")
  ).toBeInTheDocument();
  await userEvent.clear(commission);
  await userEvent.type(commission, "1000");
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Available" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Scholarship name is required")).toBeInTheDocument();
  await userEvent.type(
    screen.getByRole("textbox", { name: "Scholarship Name" }),
    "Excellence Award"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: "Description" }),
    "Support for excellent students."
  );
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Excellence Award")).toBeInTheDocument();
  expect(mockCreate).not.toHaveBeenCalled();
});
