"use client";

// Presentational application form: every visual comes from the kit. State and
// API calls live in useApplicationForm (or a mock in the style guide), so this
// renders the same in the product and on /ui-unibexs-template-2026.

import Card from "components/ub/data/cards/Card";
import IconTile from "components/ub/dashboard/shared/IconTile";
import { FieldError } from "components/ub/forms/layout/FieldChrome";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, FileText, Send } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import Collapse from "components/ub/core/motion/Collapse";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import FileUpload from "components/ub/forms/uploads/FileUpload";
import TextButton from "components/ub/core/buttons/TextButton";
import AppDate from "components/ub/data/formatting/AppDate";
import DescriptionList from "components/ub/data/display/DescriptionList";
import FileRow from "components/ub/data/display/FileRow";
import SectionCard from "components/ub/data/cards/SectionCard";
import ProgressBar from "components/ub/feedback/states/ProgressBar";
import Combobox from "components/ub/forms/selection/Combobox";
import Input from "components/ub/forms/text/Input";
import IntakeDatePicker from "components/ub/forms/dates/IntakeDatePicker";
import { RadioGroup } from "components/ub/forms/choices/Radio";
import Toggle from "components/ub/forms/choices/Toggle";
import StepIndicator from "components/ub/navigation/controls/StepIndicator";
import { formContainer } from "components/ub/recipes";
import { NATIONALITIES } from "constants/lists";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import type { DocumentType, FormDataType } from "features/applications/partner/components/form/utility-functions/types";
import { getPath, isRequiredDocument, uploadedFor, type ApplicationFormStepId } from "./applicationFormModel";

export interface FormUniversity {
  id: string;
  name: string;
  programs?: { id: string; name: string }[];
}

export interface ApplicationFormViewProps {
  /** new: pick the Institution and programme · programme: preset from the Knowledge Hub, change optional. */
  mode?: "new" | "programme";
  formData: FormDataType;
  errors: Record<string, string | undefined>;
  update: (path: string, value: unknown) => void;
  validateField?: (path: string) => void;
  step: ApplicationFormStepId;
  steps: { id: ApplicationFormStepId; label: string; description: string }[];
  completed: ApplicationFormStepId[];
  goTo: (id: ApplicationFormStepId) => void;
  next: () => unknown;
  back: () => void;
  submit: () => unknown;
  submitting?: boolean;
  upload: (file: File, documentTypeId: string) => unknown;
  removeDocument: (documentTypeId: string) => unknown;
  universities: FormUniversity[];
  documentTypes: DocumentType[];
  documentTypesLoading?: boolean;
  qualifications: { id: string | number; name: string }[];
  requiredFieldKeys: string[];
  intakeMonths: number[];
  /** Page heading level; h3 when embedded in the style guide. */
  titleAs?: "h1" | "h2" | "h3";
}

/** Stable DOM id for a field path, used by labels and field navigation. */
export const fieldId = (path: string) => `af-${path.replace(/[^a-z0-9]+/gi, "-")}`;

const NATIONALITY_OPTIONS = NATIONALITIES.map((n) => ({ value: String(n.label), label: n.name }));

// ── Steps ────────────────────────────────────────────────────────────────

function StudentStep({ mode, formData, errors, update, validateField, universities }: Pick<ApplicationFormViewProps, "mode" | "formData" | "errors" | "update" | "validateField" | "universities">) {
  const [changeProgramme, setChangeProgramme] = useState(mode !== "programme");
  const uni = universities.find((u) => u.id === formData.university_id);
  const programme = uni?.programs?.find((p) => p.id === formData.program_id);
  const text = (path: string, label: string, extra: Partial<React.ComponentProps<typeof Input>> = {}) => (
    <Input
      id={fieldId(path)}
      label={label}
      value={getPath(formData, path) ?? ""}
      onChange={(v) => update(path, v)}
      onBlur={() => validateField?.(path)}
      error={errors[path]}
      required
      {...extra}
    />
  );
  return (
    <div className="grid gap-8">
      <section aria-labelledby="af-student-title">
        <h3 id="af-student-title" className="text-ub-heading-sm text-ub-text-primary">
          Student
        </h3>
        <p className="mt-1 text-ub-body-sm text-ub-text-secondary">Exactly as printed on the passport.</p>
        <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
          {text("student.name", "Full name", { autoComplete: "name", placeholder: "e.g. Nur Aisyah Binti Kamal", wrapperClassName: "mb-4 sm:col-span-2" })}
          {text("student.passport_number", "Passport number", { reference: true, placeholder: "e.g. A12345678" })}
          <Combobox id={fieldId("student.nationality")} label="Nationality" options={NATIONALITY_OPTIONS} value={formData.student.nationality || null} onChange={(v) => update("student.nationality", v ?? "")} error={errors["student.nationality"]} placeholder="Search nationalities" required />
        </div>
      </section>

      <section aria-labelledby="af-programme-title">
        <h3 id="af-programme-title" className="text-ub-heading-sm text-ub-text-primary">
          Programme
        </h3>
        {mode === "programme" && (
          <Card extra="mt-4 gap-3 p-4">
            <DescriptionList columns={2} fallback="Not chosen" items={[{ label: "Institution", value: uni?.name }, { label: "Programme", value: programme?.name }]} />
            <Toggle checked={changeProgramme} onChange={setChangeProgramme} label="Choose a different programme" />
          </Card>
        )}
        <Collapse open={changeProgramme}>
          <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
            <Combobox
              id={fieldId("university_id")}
              label="Institution"
              options={universities.map((u) => ({ value: String(u.id), label: u.name }))}
              value={formData.university_id || null}
              onChange={(v) => {
                update("university_id", v ?? "");
                update("program_id", "");
              }}
              error={errors.university_id}
              placeholder="Search institutions"
              required
            />
            <Combobox
              id={fieldId("program_id")}
              label="Programme"
              options={(uni?.programs ?? []).map((p) => ({ value: p.id, label: p.name }))}
              value={formData.program_id || null}
              onChange={(v) => update("program_id", v ?? "")}
              error={errors.program_id}
              placeholder={uni ? "Search programmes" : "Choose an Institution first"}
              disabled={!uni}
              required
            />
          </div>
        </Collapse>
      </section>
    </div>
  );
}

function DocumentSlot({ type, formData, errors, upload, removeDocument }: { type: DocumentType } & Pick<ApplicationFormViewProps, "formData" | "errors" | "upload" | "removeDocument">) {
  const doc = uploadedFor(formData.documents, type.id);
  const message = errors[`documents.${type.id}`];
  return <div id={fieldId(`documents.${type.id}`)} tabIndex={-1} className="min-w-0 outline-none">
    <FileUpload label={type.type} description={type.description || undefined} required={isRequiredDocument(type)} accept={[...ALLOWED_FILE_TYPES.extensions, ...ALLOWED_FILE_TYPES.mimeTypes]} files={doc ? [{ id: String(type.id), name: doc.name || type.type, status: doc.uploading ? "uploading" : doc.file_key ? "uploaded" : "needs-replacing", progress: doc.progress, previewUrl: doc.file_url || undefined }] : []} onSelect={(files) => { if (files[0]) upload(files[0], type.id); }} onReplace={(_id, file) => upload(file, type.id)} onRemove={() => removeDocument(type.id)} disabled={!!doc?.uploading} error={message === "required" ? "This document is required." : message} />
  </div>;
}

function DocumentsStep({ formData, errors, upload, removeDocument, documentTypes, documentTypesLoading }: Pick<ApplicationFormViewProps, "formData" | "errors" | "upload" | "removeDocument" | "documentTypes" | "documentTypesLoading">) {
  const [showOptional, setShowOptional] = useState(false);
  const sorted = [...documentTypes].sort((a, b) => Number(isRequiredDocument(b)) - Number(isRequiredDocument(a)) || a.type.localeCompare(b.type));
  const required = sorted.filter(isRequiredDocument);
  const optional = sorted.filter((d) => !isRequiredDocument(d));
  const done = required.filter((t) => {
    const d = uploadedFor(formData.documents, t.id);
    return d?.file_key && !d.uploading;
  }).length;

  if (documentTypesLoading) {
    return <SectionCard title="Documents" state="loading" loadingRows={4} />;
  }
  if (!documentTypes.length) {
    return <SectionCard title="Documents" state="empty" empty={{ icon: FileText, title: "Choose a programme first", description: "The documents depend on the programme and the student's nationality." }} />;
  }
  const slot = (t: DocumentType) => <DocumentSlot key={t.id} type={t} formData={formData} errors={errors} upload={upload} removeDocument={removeDocument} />;
  return (
    <div className="grid gap-6">
      {required.length > 0 && <ProgressBar value={done} max={required.length} label="Required documents" valueText={`${done} of ${required.length} uploaded`} tone={done === required.length ? "success" : "brand"} />}
      <div className="-mx-3 divide-y divide-ub-border">{required.map(slot)}</div>
      {optional.length > 0 && (
        <div className="grid gap-3">
          <Toggle checked={showOptional} onChange={setShowOptional} label={`Optional documents (${optional.length})`} description="Add them now if you have them; they can also be uploaded later." />
          <Collapse open={showOptional}>
            <div className="-mx-3 divide-y divide-ub-border">{optional.map(slot)}</div>
          </Collapse>
        </div>
      )}
      {errors.documents && (
        <div role="alert"><FieldError>{errors.documents}</FieldError></div>
      )}
    </div>
  );
}

function DetailsStep({ formData, errors, update, requiredFieldKeys, qualifications, intakeMonths }: Pick<ApplicationFormViewProps, "formData" | "errors" | "update" | "requiredFieldKeys" | "qualifications" | "intakeMonths">) {
  const req = (k: string) => requiredFieldKeys.includes(k);
  const s = formData.student;
  const studentFields = requiredFieldKeys.some((k) => k.startsWith("student.") && !k.includes("emergency_contacts") && !k.includes("previous_educations"));
  const emergency = requiredFieldKeys.some((k) => k.startsWith("student.emergency_contacts"));
  const education = requiredFieldKeys.some((k) => k.startsWith("student.previous_educations"));
  const text = (path: string, label: string, extra: Partial<React.ComponentProps<typeof Input>> = {}) => (
    <Input key={path} id={fieldId(path)} label={label} value={getPath(formData, path) ?? ""} onChange={(v) => update(path, v)} error={errors[path]} required {...extra} />
  );
  const lastEdu = s.previous_educations[s.previous_educations.length - 1];
  const canAddEdu = !lastEdu || (lastEdu.qualification && lastEdu.institution_name && lastEdu.start_date && lastEdu.end_date);

  return (
    <div className="grid gap-8">
      {req("intake_date") && intakeMonths.length > 1 && (
        <section aria-labelledby="af-intake-title" id={fieldId("intake_date")} tabIndex={-1} className="outline-none">
          <h3 id="af-intake-title" className="mb-3 text-ub-heading-sm text-ub-text-primary">
            Intake
          </h3>
          <IntakeDatePicker months={intakeMonths} value={formData.intake_date ?? ""} onChange={(d) => update("intake_date", d)} error={errors.intake_date} />
        </section>
      )}

      {studentFields && (
        <section aria-labelledby="af-more-student-title">
          <h3 id="af-more-student-title" className="mb-4 text-ub-heading-sm text-ub-text-primary">
            Student details
          </h3>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {req("student.birthday") && text("student.birthday", "Date of birth", { type: "date" })}
            {req("student.gender") && (
              <div id={fieldId("student.gender")} tabIndex={-1} className="mb-4 outline-none">
                <RadioGroup
                  legend="Gender"
                  orientation="horizontal"
                  options={[{ value: "female", label: "Female" }, { value: "male", label: "Male" }]}
                  value={s.gender === null ? null : (s.gender as unknown) === true ? "male" : "female"}
                  onChange={(v) => update("student.gender", v === "male")}
                  error={errors["student.gender"]}
                  required
                />
              </div>
            )}
            {req("student.email") && text("student.email", "Email", { type: "email", autoComplete: "email", placeholder: "name@example.com" })}
            {req("student.phone") && text("student.phone", "Phone (WhatsApp)", { type: "tel", autoComplete: "tel", placeholder: "+60 12 345 6789" })}
            {req("student.current_address") && text("student.current_address", "Current address", { wrapperClassName: "mb-4 sm:col-span-2", autoComplete: "street-address", placeholder: "Street, city and postcode" })}
          </div>
        </section>
      )}

      {emergency && (
        <section aria-labelledby="af-emergency-title">
          <h3 id="af-emergency-title" className="mb-4 text-ub-heading-sm text-ub-text-primary">
            Emergency contact
          </h3>
          {s.emergency_contacts.map((_c, i) => (
            <div key={i} className="grid gap-x-4 sm:grid-cols-2">
              {text(`student.emergency_contacts[${i}].name`, "Name", { placeholder: "e.g. Kamal Bin Hassan" })}
              {text(`student.emergency_contacts[${i}].relation`, "Relation", { placeholder: "Father, mother or guardian" })}
              {text(`student.emergency_contacts[${i}].phone`, "Phone", { type: "tel", placeholder: "+60 13 222 4455" })}
              {text(`student.emergency_contacts[${i}].email`, "Email", { type: "email", placeholder: "name@example.com" })}
            </div>
          ))}
        </section>
      )}

      {education && (
        <section aria-labelledby="af-education-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 id="af-education-title" className="text-ub-heading-sm text-ub-text-primary">
              Education
            </h3>
            <TextButton
              leadingIcon="plus"
              disabled={!canAddEdu}
              onClick={() => update("student.previous_educations", [...s.previous_educations, { qualification: "", institution_name: "", start_date: "", end_date: "", grade: "" }])}
            >
              Add education
            </TextButton>
          </div>
          {s.previous_educations.map((_e, i) => (
            <div key={i} className={clsx("grid gap-x-4 sm:grid-cols-2", i > 0 && "mt-2 border-t border-ub-border pt-6")}>
              <Combobox
                id={fieldId(`student.previous_educations[${i}].qualification`)}
                label="Highest qualification"
                options={qualifications.map((q) => ({ value: String(q.id), label: q.name }))}
                value={s.previous_educations[i].qualification || null}
                onChange={(v) => update(`student.previous_educations[${i}].qualification`, v ?? "")}
                error={errors[`student.previous_educations[${i}].qualification`]}
                placeholder="Search qualifications"
                required
              />
              {text(`student.previous_educations[${i}].institution_name`, "School or Institution", { placeholder: "e.g. SMK Seksyen 9 Shah Alam" })}
              {text(`student.previous_educations[${i}].start_date`, "Start date", { type: "date" })}
              {text(`student.previous_educations[${i}].end_date`, "End date", { type: "date" })}
              {text(`student.previous_educations[${i}].grade`, "Grade or GPA", { required: false, placeholder: "3.75 / 4.0" })}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function ReviewStep({ formData, universities, documentTypes, goTo, steps }: Pick<ApplicationFormViewProps, "formData" | "universities" | "documentTypes" | "goTo" | "steps">) {
  const uni = universities.find((u) => u.id === formData.university_id);
  const s = formData.student;
  const edit = (id: ApplicationFormStepId, what: string) =>
    steps.some((x) => x.id === id) ? (
      <TextButton onClick={() => goTo(id)} aria-label={`Edit ${what}`}>
        Edit
      </TextButton>
    ) : undefined;
  const uploads = documentTypes.map((t) => ({ t, d: uploadedFor(formData.documents, t.id) })).filter(({ d }) => d?.file_key);
  return (
    <div className="grid gap-4">
      <SectionCard title="Programme" as="h3" action={edit("student", "programme")}>
        <DescriptionList
          columns={2}
          fallback="Not chosen"
          items={[
            { label: "Institution", value: uni?.name },
            { label: "Programme", value: uni?.programs?.find((p) => p.id === formData.program_id)?.name },
            { label: "Intake", value: formData.intake_date && <AppDate value={formData.intake_date} format="month-year" /> },
          ]}
        />
      </SectionCard>
      <SectionCard title="Student" as="h3" action={edit("student", "student")}>
        <DescriptionList
          columns={2}
          fallback="Not given"
          items={[
            { label: "Full name", value: s.name },
            { label: "Passport number", value: s.passport_number && <span className="ub-ref">{s.passport_number}</span> },
            { label: "Nationality", value: s.nationality },
            { label: "Date of birth", value: s.birthday && <AppDate value={s.birthday} /> },
            { label: "Gender", value: s.gender === null ? null : (s.gender as unknown) === true ? "Male" : "Female" },
            { label: "Email", value: s.email },
            { label: "Phone", value: s.phone && <span dir="ltr">{s.phone}</span> },
            { label: "Address", value: s.current_address, fullWidth: true },
          ]}
        />
      </SectionCard>
      <SectionCard title={`Documents (${uploads.length})`} as="h3" action={edit("documents", "documents")} state={uploads.length ? "ready" : "empty"} empty={{ icon: FileText, title: "No documents uploaded" }}>
        <ul className="-my-4 divide-y divide-ub-border">
          {uploads.map(({ t, d }) => (
            <FileRow key={t.id} name={t.type} state="uploaded" stateLabel="Uploaded" meta={d?.name} />
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

// ── View ─────────────────────────────────────────────────────────────────

/**
 * The Advisor's application form (brief §6): four steps (the details step
 * only when the Institution asks for extra fields), a step indicator, an
 * error summary on a blocked step, and Back / Continue / Submit.
 */
export default function ApplicationFormView(props: ApplicationFormViewProps) {
  const { mode = "new", step, steps, completed, goTo, next, back, submit, submitting = false, errors, titleAs: Title = "h1" } = props;
  const index = steps.findIndex((s) => s.id === step);
  const last = index === steps.length - 1;
  const current = steps[index];
  const top = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Direction of travel: forward slides in from the end side, back from the start (mirrored in RTL).
  const prevIndex = useRef(index);
  const direction = index >= prevIndex.current ? 1 : -1;
  useEffect(() => {
    prevIndex.current = index;
  }, [index]);
  const [rtl, setRtl] = useState(false);
  useEffect(() => setRtl(getComputedStyle(document.documentElement).direction === "rtl"), []);
  const shift = (sign: number) => (reduce ? 0 : sign * (rtl ? -1 : 1) * 24);

  // Keep the step's top in view after moving, and move focus for screen readers.
  const move = (fn: () => unknown) => {
    fn();
    requestAnimationFrame(() => {
      top.current?.scrollIntoView?.({ block: "start", behavior: reduce ? "auto" : "smooth" });
      top.current?.focus({ preventScroll: true });
    });
  };

  let body: ReactNode = null;
  if (step === "student") body = <StudentStep {...props} mode={mode} />;
  if (step === "documents") body = <DocumentsStep {...props} />;
  if (step === "details") body = <DetailsStep {...props} />;
  if (step === "review") body = <ReviewStep {...props} />;

  return (
    <section className={clsx(formContainer, "mx-auto w-full max-w-5xl")} aria-labelledby="af-title" aria-busy={submitting || undefined}>
      <header className="flex items-start gap-3 border-b border-ub-border px-4 py-4 md:px-6 md:py-5">
        <IconTile icon={FileText} />
        <div className="min-w-0">
          <Title id="af-title" className="text-ub-heading-md text-ub-text-primary">
            {mode === "programme" ? "Apply for this programme" : "New application"}
          </Title>
          <p className="mt-0.5 text-ub-body-sm text-ub-text-secondary">Every field is required unless it says (optional). You can review everything before you submit.</p>
        </div>
      </header>

      <div className="border-b border-ub-border px-4 py-4 md:px-6">
        <StepIndicator aria-label="Application steps" steps={steps} currentId={step} completedIds={completed} onStepClick={(id) => move(() => goTo(id as ApplicationFormStepId))} />
      </div>

      <div ref={top} tabIndex={-1} className="scroll-mt-24 overflow-x-clip px-4 py-6 outline-none md:px-6">
        <h2 className="sr-only">{current?.label}</h2>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: shift(d) }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: shift(-d) / 2 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.12 : MICRO_DURATION, ease: EASE }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="sticky bottom-16 z-20 flex flex-col-reverse gap-3 border-t border-ub-border bg-ub-surface-raised px-4 py-3 shadow-ub-sm sm:flex-row md:bottom-0 sm:items-center sm:justify-between md:px-6">
        <p className="ub-tabular text-ub-caption text-ub-text-tertiary">
          Step {index + 1} of {steps.length}
          {completed.length > 0 && ` · ${completed.length} done`}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex [&>button]:min-h-[44px]">
          {index > 0 ? <Button variant="secondary" text="Back" icon={<ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />} onClick={() => move(back)} disabled={submitting} /> : <span />}
          {last ? (
            <Button variant="primary" text="Submit application" icon={<Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />} onClick={() => submit()} loading={submitting} />
          ) : (
            <Button variant="primary" text="Continue" icon={<ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />} onClick={() => move(next)} disabled={submitting} />
          )}
        </div>
      </footer>
    </section>
  );
}


