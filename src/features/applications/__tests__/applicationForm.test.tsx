import { render, screen, fireEvent } from "@testing-library/react";
import StepIndicator, { canOpenStep } from "components/ub/navigation/controls/StepIndicator";
import ApplicationFormView, { fieldId } from "features/applications/form/ApplicationFormView";
import { buildPayload, getPath, missingRequiredDocuments, visibleSteps } from "features/applications/form/applicationFormModel";

jest.mock("components/ub/feedback/notifications/ToastContext", () => ({ useToast: () => ({ showToast: jest.fn() }) }));

const student = { name: "Nur", birthday: "2006-03-18", nationality: "Malaysian", passport_number: "A123456", email: "", phone: "", current_address: "", gender: true as unknown as string, emergency_contacts: [{ name: "", relation: "", phone: "", email: "" }], english_proficiencies: [{ test_type: "", score: "", test_date: "" }], previous_educations: [{ institution_name: "SMK", qualification: "spm", start_date: "2018-01-01", end_date: "2023-12-01", grade: "" }] };
const form = { program_id: "p1", university_id: "u1", intake_date: "2027-01-05", student_id: "", student, documents: [{ document_type_id: "d1", file_url: "u", file_key: "k" }, { document_type_id: "d2", file_url: "", uploading: true }], is_draft: false };
const types = [
  { id: "d1", type: "Passport", is_required_for_init: true },
  { id: "d2", type: "Transcript", is_required_for_init: true },
  { id: "d3", type: "English", is_required_for_init: false },
] as any;

describe("application form model", () => {
  it("shows the details step only when the Institution requires fields", () => {
    expect(visibleSteps(false).map((s) => s.id)).toEqual(["student", "documents", "review"]);
    expect(visibleSteps(true)).toHaveLength(4);
  });
  it("finds required documents still missing (uploading counts as missing)", () => {
    expect(missingRequiredDocuments(types, form.documents as any).map((d) => d.id)).toEqual(["d2"]);
  });
  it("reads nested paths", () => {
    expect(getPath(form, "student.previous_educations[0].institution_name")).toBe("SMK");
  });
  it("builds the payload: drops empty rows and unfinished uploads, keeps gender boolean", () => {
    const p = buildPayload(form as any);
    expect(p.student.emergency_contacts).toEqual([]);
    expect(p.student.previous_educations[0]).toMatchObject({ institution_name: "SMK", start_date: "2018-01-01" });
    expect(p.documents).toEqual([{ document_type_id: "d1", file_url: "u", file_key: "k" }]);
    expect(p.student.gender).toBe(true);
  });
});

describe("StepIndicator", () => {
  const steps = [{ id: "a", label: "Student" }, { id: "b", label: "Documents" }, { id: "c", label: "Review" }];
  it("marks the current step and lets you reopen completed ones", () => {
    const onStepClick = jest.fn();
    render(<StepIndicator steps={steps} currentId="b" completedIds={["a"]} onStepClick={onStepClick} />);
    expect(screen.getAllByRole("listitem")[1]).toHaveAttribute("aria-current", "step");
    fireEvent.click(screen.getByRole("button", { name: /Student/ }));
    expect(onStepClick).toHaveBeenCalledWith("a");
    expect(screen.queryByRole("button", { name: /Review/ })).toBeNull();
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });
  it("canOpenStep rule", () => {
    expect(canOpenStep(steps, "c", "a", [])).toBe(false);
    expect(canOpenStep(steps, "c", "b", ["a", "b"])).toBe(true);
  });
});

describe("ApplicationFormView", () => {
  const base = {
    formData: { ...form, student: { ...student, name: "" } } as any,
    update: jest.fn(),
    steps: visibleSteps(false),
    completed: [],
    goTo: jest.fn(),
    next: jest.fn(),
    back: jest.fn(),
    submit: jest.fn(),
    upload: jest.fn(),
    removeDocument: jest.fn(),
    universities: [{ id: "u1", name: "Sunway University", programs: [{ id: "p1", name: "BSc" }] }],
    documentTypes: types,
    qualifications: [],
    requiredFieldKeys: [],
    intakeMonths: [],
  };
  it("shows an error summary linking to the field and calls next on Continue", () => {
    render(<ApplicationFormView {...base} step="student" errors={{ "student.name": "Enter the student's full name as on the passport." }} />);
    expect(screen.getByRole("link", { name: /full name/ })).toHaveAttribute("href", `#${fieldId("student.name")}`);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(base.next).toHaveBeenCalled();
  });
  it("review step lists uploads, offers Edit and Submit", () => {
    render(<ApplicationFormView {...base} step="review" errors={{}} />);
    expect(screen.getByRole("button", { name: "Edit documents" })).toBeInTheDocument();
    expect(screen.getByText("Passport")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Submit application/ }));
    expect(base.submit).toHaveBeenCalled();
  });
  it("programme mode shows the preset with a switch to change it", () => {
    render(<ApplicationFormView {...base} mode="programme" step="student" errors={{}} />);
    expect(screen.getByRole("heading", { name: "Apply for this programme" })).toBeInTheDocument();
    expect(screen.getByText("Sunway University")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /Choose a different programme/ })).toBeInTheDocument();
  });
});
