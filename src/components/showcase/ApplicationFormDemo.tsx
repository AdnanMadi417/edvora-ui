"use client";

// Style-guide demos: StepIndicator (kit) and the full application form,
// driven by a local mock of useApplicationForm that uses the same pure
// validation and update functions, with fake uploads.

import { useState } from "react";
import StepIndicator from "components/ub/navigation/StepIndicator";
import ApplicationFormView, { type FormUniversity } from "features/applications/form/ApplicationFormView";
import { visibleSteps, type ApplicationFormStepId } from "features/applications/form/applicationFormModel";
import { updateFormData } from "features/applications/partner/components/form/utility-functions/updateFormData";
import { validateFormData } from "features/applications/partner/components/form/utility-functions/validateFormData";
import type { DocumentType, FormDataType } from "features/applications/partner/components/form/utility-functions/types";
import { Demo, ShowcaseSection, StateSwitch } from "./Showcase";

const UNIVERSITIES: FormUniversity[] = [
  { id: "uni_sunway", name: "Sunway University", programs: [{ id: "p1", name: "Bachelor of Computer Science (Hons)" }, { id: "p2", name: "Bachelor of Business (Hons)" }] },
  { id: "uni_taylors", name: "Taylor's University", programs: [{ id: "p3", name: "Master of Data Science" }] },
];
const DOC_TYPES = [
  { id: "d1", type: "Passport", code: "passport", description: "Photo page, valid for 6 months or more.", is_init_app_doc: true, is_required_init_app_doc: true, is_required_for_init: true },
  { id: "d2", type: "Academic transcript", code: "transcript", description: "Certified true copy.", is_init_app_doc: true, is_required_init_app_doc: true, is_required_for_init: true },
  { id: "d3", type: "English proficiency certificate", code: "english", description: "IELTS, TOEFL, PTE or MUET.", is_init_app_doc: true, is_required_init_app_doc: false, is_required_for_init: false },
] as unknown as DocumentType[];
const REQUIRED_FIELDS = ["intake_date", "student.birthday", "student.gender", "student.email", "student.phone", "student.emergency_contacts[0].name", "student.emergency_contacts[0].phone"];

const empty: FormDataType = {
  program_id: "",
  university_id: "",
  intake_date: "2027-01-05",
  student_id: "",
  student: {
    name: "",
    birthday: "",
    nationality: "",
    passport_number: "",
    email: "",
    phone: "",
    current_address: "",
    gender: null,
    emergency_contacts: [{ name: "", relation: "", phone: "", email: "" }],
    english_proficiencies: [{ test_type: "", score: "", test_date: "" }],
    previous_educations: [{ institution_name: "", qualification: "", start_date: "", end_date: "", grade: "" }],
  },
  documents: [],
  is_draft: false,
};

function useMockApplicationForm(mode: "new" | "programme") {
  const [formData, setFormData] = useState<FormDataType>(mode === "programme" ? { ...empty, university_id: "uni_sunway", program_id: "p1" } : empty);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [step, setStep] = useState<ApplicationFormStepId>("student");
  const [completed, setCompleted] = useState<ApplicationFormStepId[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const steps = visibleSteps(true);
  const legacy: Record<ApplicationFormStepId, number> = { student: 1, documents: 2, details: 3, review: 4 };

  const update = (fieldPath: string, value: unknown) => updateFormData<FormDataType>({ fieldPath, value, setFormData, setErrors });
  const validate = (id: ApplicationFormStepId) => {
    const r = validateFormData(formData, legacy[id], REQUIRED_FIELDS, DOC_TYPES, false);
    setErrors(r.errors);
    return r.isValid;
  };
  return {
    formData,
    errors,
    update,
    step,
    steps,
    completed,
    goTo: setStep,
    next: () => {
      if (!validate(step)) return false;
      setCompleted((c) => (c.includes(step) ? c : [...c, step]));
      const i = steps.findIndex((s) => s.id === step);
      setStep(steps[Math.min(i + 1, steps.length - 1)].id);
      return true;
    },
    back: () => {
      const i = steps.findIndex((s) => s.id === step);
      if (i > 0) setStep(steps[i - 1].id);
    },
    submit: async () => {
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 900));
      setSubmitting(false);
      setStep("student");
      setCompleted([]);
      setFormData(empty);
    },
    submitting,
    // Fake upload with real progress, so the Uploading state shows.
    upload: (file: File, typeId: string) => {
      setFormData((p) => ({ ...p, documents: [...p.documents.filter((d) => d.document_type_id !== typeId), { document_type_id: typeId, file_url: "", file_key: "", name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, raw: file, uploading: true, progress: 0 }] }));
      let pct = 0;
      const t = setInterval(() => {
        pct += 25;
        setFormData((p) => ({ ...p, documents: p.documents.map((d) => (d.raw === file ? { ...d, progress: pct, uploading: pct < 100, file_url: pct >= 100 ? "blob:demo" : "", file_key: pct >= 100 ? `demo/${file.name}` : "" } : d)) }));
        if (pct >= 100) clearInterval(t);
      }, 300);
    },
    removeDocument: (typeId: string) => setFormData((p) => ({ ...p, documents: p.documents.filter((d) => d.document_type_id !== typeId) })),
    universities: UNIVERSITIES,
    documentTypes: DOC_TYPES,
    qualifications: [{ id: "spm", name: "SPM" }, { id: "alevel", name: "A-Levels" }],
    requiredFieldKeys: REQUIRED_FIELDS,
    intakeMonths: [1, 5, 9],
  };
}

function FormHarness({ mode }: { mode: "new" | "programme" }) {
  const form = useMockApplicationForm(mode);
  return <ApplicationFormView {...form} mode={mode} titleAs="h3" />;
}

const STEPS = [
  { id: "a", label: "Student and programme", description: "Passport details" },
  { id: "b", label: "Documents", description: "What the Institution needs" },
  { id: "c", label: "More details", description: "Extra fields" },
  { id: "d", label: "Review and submit", description: "Check everything" },
];

export default function ApplicationFormDemo() {
  const [current, setCurrent] = useState("b");
  const [mode, setMode] = useState<"new" | "programme">("new");
  const done = STEPS.slice(0, STEPS.findIndex((s) => s.id === current)).map((s) => s.id);
  return (
    <ShowcaseSection id="application-form" title="Application form" description="The Advisor's multi-step application form.">
      <Demo
        name="StepIndicator"
        path="components/ub/navigation/StepIndicator.tsx"
        description="Numbered steps with a connector from 768px; below, a compact Step 2 of 4 line with a segmented bar. Completed steps (and the one after them) are clickable; aria-current marks the current step."
        code={`<StepIndicator steps={steps} currentId={step} completedIds={completed} onStepClick={goTo} aria-label="Application steps" />`}
        props={[
          { name: "steps", type: "{ id, label, description? }[]", description: "In order." },
          { name: "currentId / completedIds", type: "string / string[]", description: "Current step and the ones done." },
          { name: "onStepClick", type: "(id) => void", description: "Makes reachable steps buttons; canOpenStep() is the rule." },
          { name: "aria-label", type: "string", default: '"Form steps"', description: "Name of the nav." },
        ]}
      >
        <StateSwitch<string> value={current} options={STEPS.map((s) => s.id)} onChange={setCurrent} label="Current step" />
        <div className="mt-4 rounded-ub-lg border border-ub-border bg-ub-surface p-4">
          <StepIndicator steps={STEPS} currentId={current} completedIds={done} onStepClick={setCurrent} />
        </div>
      </Demo>

      <Demo
        name="Application form"
        path="features/applications/form/ApplicationFormView.tsx"
        description="New application and Apply for this programme (preset from the Knowledge Hub, change optional) share one view and one hook. Continue validates the step and shows an error summary that links to the fields; documents show Required / Optional, upload progress, Replace and Remove, and accept drops; the review step has Edit links. Try Continue on the empty form."
        code={`// Page container: data and API stay in the hook.
const form = useApplicationForm({ program_id, university_id, intake_date });
return <ApplicationFormView {...form} mode="programme" />;`}
        props={[
          { name: "mode", type: '"new" | "programme"', default: '"new"', description: "Programme mode shows the preset with a Choose a different programme switch." },
          { name: "formData / errors / update", type: "FormDataType / Record / (path, value) => void", description: "From useApplicationForm (paths like student.emergency_contacts[0].name)." },
          { name: "step / steps / completed / goTo / next / back / submit", type: "…", description: "Step flow; next validates the current step." },
          { name: "upload / removeDocument", type: "(file, typeId) => void / (typeId) => void", description: "Uploads with progress; removal also deletes from storage." },
          { name: "universities / documentTypes / qualifications / requiredFieldKeys / intakeMonths", type: "lists", description: "The More details step only appears when the Institution requires fields." },
          { name: "titleAs", type: '"h1" | "h2" | "h3"', default: '"h1"', description: "Heading level when embedded." },
        ]}
      >
        <StateSwitch<"new" | "programme"> value={mode} options={["new", "programme"] as const} onChange={setMode} label="Mode" />
        <div className="ub-canvas-light mt-4 rounded-ub-xl p-4 md:p-6">
          <FormHarness key={mode} mode={mode} />
        </div>
      </Demo>
    </ShowcaseSection>
  );
}
