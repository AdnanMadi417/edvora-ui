"use client";

import { useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import Button from "components/ub/core/Button";
import FormModal, { FormSection, type FormModalError } from "components/ub/feedback/FormModal";
import { useToast } from "components/ub/feedback/ToastContext";
import Checkbox from "components/ub/forms/Checkbox";
import Combobox from "components/ub/forms/Combobox";
import FileUpload, { type FileUploadItem } from "components/ub/forms/FileUpload";
import Input from "components/ub/forms/Input";
import { RadioGroup } from "components/ub/forms/Radio";
import Textarea from "components/ub/forms/Textarea";
import ReviewPartnerPopup from "features/partners/components/admin/ReviewPartnerPopup";
import { Demo, ShowcaseSection } from "./Showcase";

const NATIONALITIES = ["Malaysia", "Indonesia", "Nigeria", "Bangladesh", "Pakistan", "Egypt", "Kenya", "Sudan"].map((n) => ({ value: n, label: n }));
const INSTITUTIONS = [
  { value: "sunway", label: "Sunway University", description: "Bandar Sunway, Selangor" },
  { value: "taylors", label: "Taylor's University", description: "Subang Jaya, Selangor" },
  { value: "ucsi", label: "UCSI University", description: "Cheras, Kuala Lumpur" },
  { value: "apu", label: "Asia Pacific University", description: "Bukit Jalil, Kuala Lumpur" },
];
const PROGRAMMES = ["Bachelor of Computer Science (Hons)", "Bachelor of Business (Hons)", "Diploma in Information Technology", "Master of Data Science"].map((p) => ({ value: p, label: p }));
const INTAKES = [
  { value: "2027-01", label: "January 2027" },
  { value: "2027-05", label: "May 2027" },
  { value: "2027-09", label: "September 2027" },
];
const MANAGERS = [
  { value: "am_001", label: "Farid Hakimi" },
  { value: "am_002", label: "Lim Wei Jie" },
  { value: "am_003", label: "Priya Nair" },
];

type StudentForm = {
  fullName: string;
  passport: string;
  nationality: string | null;
  birthday: string;
  gender: string | null;
  email: string;
  phone: string;
  institution: string | null;
  programme: string | null;
  intake: string | null;
  tuition: string;
  contactName: string;
  contactPhone: string;
  notes: string;
  consent: boolean;
};

const EMPTY: StudentForm = { fullName: "", passport: "", nationality: null, birthday: "", gender: null, email: "", phone: "", institution: null, programme: null, intake: null, tuition: "", contactName: "", contactPhone: "", notes: "", consent: false };

const SECTIONS = [
  { id: "student-personal", label: "Personal details", fields: ["fullName", "passport", "nationality", "birthday", "gender"] },
  { id: "student-contact", label: "Contact", fields: ["email", "phone"] },
  { id: "student-programme", label: "Programme", fields: ["institution", "programme", "intake"] },
  { id: "student-documents", label: "Documents", fields: ["documents"] },
  { id: "student-emergency", label: "Emergency contact", fields: ["contactName", "contactPhone"] },
  { id: "student-confirm", label: "Confirm", fields: ["consent"] },
];

/** Pure: field errors for the Add student form, in reading order. */
export function validateStudent(f: StudentForm, documents: FileUploadItem[]): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.fullName.trim()) e.fullName = "Enter the student's full name as on the passport.";
  if (!/^[A-Z0-9]{6,12}$/.test(f.passport)) e.passport = "Enter the passport number: 6 to 12 letters and numbers.";
  if (!f.nationality) e.nationality = "Choose the student's nationality.";
  if (!f.birthday) e.birthday = "Enter the date of birth.";
  if (!f.gender) e.gender = "Choose a gender.";
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter an email address like name@example.com.";
  if (f.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a phone number with at least 7 digits.";
  if (!f.institution) e.institution = "Choose an Institution.";
  if (!f.programme) e.programme = "Choose a programme.";
  if (!f.intake) e.intake = "Choose an intake.";
  if (!documents.length) e.documents = "Upload the passport photo page.";
  if (!f.contactName.trim()) e.contactName = "Enter an emergency contact's name.";
  if (f.contactPhone.replace(/\D/g, "").length < 7) e.contactPhone = "Enter the emergency contact's phone number.";
  if (!f.consent) e.consent = "Confirm the student agreed to share these details.";
  return e;
}

const id = (field: string) => `student-${field}`;

function AddStudentDemo() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StudentForm>(EMPTY);
  const [documents, setDocuments] = useState<FileUploadItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof StudentForm>(key: K, value: StudentForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };
  const dirty = JSON.stringify(form) !== JSON.stringify(EMPTY) || documents.length > 0;
  const err = (k: string) => errors[k] || undefined;

  const close = () => {
    setOpen(false);
    setForm(EMPTY);
    setDocuments([]);
    setErrors({});
  };

  const submit = async () => {
    const next = validateStudent(form, documents);
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    showToast(`${form.fullName} is added. Next step: submit the application.`, "success");
    close();
  };

  const summary: FormModalError[] = Object.entries(errors)
    .filter(([, m]) => m)
    .map(([k, message]) => ({ fieldId: id(k), message }));

  return (
    <>
      <Button variant="primary" icon={<UserPlus className="h-4 w-4" aria-hidden="true" />} text="Add student" onClick={() => setOpen(true)} />
      <FormModal
        open={open}
        onClose={close}
        size="xl"
        icon={UserPlus}
        title="Add student"
        description="Fields marked * are required. You can submit the application after saving."
        onSubmit={submit}
        submitting={submitting}
        submitLabel="Add student"
        secondaryAction={<Button variant="tertiary" size="sm" text="Save draft" onClick={() => showToast("Draft saved.", "info")} disabled={submitting} />}
        footerNote={dirty ? "Unsaved changes" : undefined}
        errors={summary}
        sections={SECTIONS.map((s) => ({ id: s.id, label: s.label, invalid: s.fields.some((f) => errors[f]) }))}
        dirty={dirty}
      >
        <FormSection id="student-personal" title="Personal details" description="Exactly as printed on the passport.">
          <Input id={id("fullName")} label="Full name" placeholder="e.g. Nur Aisyah Binti Kamal" value={form.fullName} onChange={(v) => set("fullName", v)} error={err("fullName")} required wrapperClassName="mb-4 sm:col-span-2" autoComplete="name" />
          <Input id={id("passport")} label="Passport number" placeholder="e.g. A12345678" value={form.passport} onChange={(v) => set("passport", v)} error={err("passport")} reference required />
          <Combobox id={id("nationality")} label="Nationality" options={NATIONALITIES} value={form.nationality} onChange={(v) => set("nationality", v)} error={err("nationality")} placeholder="Search countries" required />
          <Input id={id("birthday")} label="Date of birth" type="date" value={form.birthday} onChange={(v) => set("birthday", v)} error={err("birthday")} required />
          <div id={id("gender")} tabIndex={-1} className="mb-4 outline-none">
            <RadioGroup legend="Gender" orientation="horizontal" options={[{ value: "female", label: "Female" }, { value: "male", label: "Male" }]} value={form.gender} onChange={(v) => set("gender", v)} error={err("gender")} required />
          </div>
        </FormSection>

        <FormSection id="student-contact" title="Contact" description="Used for Institution and visa updates.">
          <Input id={id("email")} label="Email" type="email" placeholder="name@example.com" value={form.email} onChange={(v) => set("email", v)} error={err("email")} required autoComplete="email" />
          <Input id={id("phone")} label="Phone (WhatsApp)" type="tel" placeholder="12 345 6789" value={form.phone} onChange={(v) => set("phone", v)} error={err("phone")} prefix="+60" required autoComplete="tel" />
        </FormSection>

        <FormSection id="student-programme" title="Programme">
          <Combobox id={id("institution")} label="Institution" options={INSTITUTIONS} value={form.institution} onChange={(v) => set("institution", v)} error={err("institution")} placeholder="Search Institutions" required className="sm:col-span-2" />
          <Combobox id={id("programme")} label="Programme" options={PROGRAMMES} value={form.programme} onChange={(v) => set("programme", v)} error={err("programme")} placeholder="Search programmes" required />
          <Input id={id("tuition")} label="Tuition per year" placeholder="31,000" value={form.tuition} onChange={(v) => set("tuition", v.replace(/[^\d,]/g, ""))} prefix="RM" helperText="From the Knowledge Hub. Optional." inputMode="numeric" />
          <div id={id("intake")} tabIndex={-1} className="mb-4 outline-none sm:col-span-2">
            <RadioGroup legend="Intake" orientation="horizontal" options={INTAKES} value={form.intake} onChange={(v) => set("intake", v)} error={err("intake")} required />
          </div>
        </FormSection>

        <FormSection id="student-documents" title="Documents" description="PDF, JPG or PNG, up to 10 MB each." columns={1}>
          <FileUpload
            id={id("documents")}
            label="Passport photo page"
            description="The page with the photo, valid for 6 months or more."
            accept={[".pdf", ".jpg", ".jpeg", ".png"]}
            maxSizeMb={10}
            files={documents}
            onSelect={(files) => {
              setDocuments(files.map((f, i) => ({ id: `${Date.now()}-${i}`, name: f.name, size: f.size, status: "uploaded" as const })));
              setErrors((e) => ({ ...e, documents: "" }));
            }}
            onRemove={(fid) => setDocuments((d) => d.filter((x) => x.id !== fid))}
            error={err("documents")}
            required
          />
        </FormSection>

        <FormSection id="student-emergency" title="Emergency contact">
          <Input id={id("contactName")} label="Name" placeholder="e.g. Kamal Bin Hassan" value={form.contactName} onChange={(v) => set("contactName", v)} error={err("contactName")} required />
          <Input id={id("contactPhone")} label="Phone" type="tel" placeholder="+60 13 222 4455" value={form.contactPhone} onChange={(v) => set("contactPhone", v)} error={err("contactPhone")} required />
          <Textarea id={id("notes")} label="Notes for your account manager" placeholder="Anything they should know, e.g. preferred intake" value={form.notes} onChange={(v) => set("notes", v)} maxLength={500} rows={3} wrapperClassName="mb-4 sm:col-span-2" />
        </FormSection>

        <FormSection id="student-confirm" title="Confirm" columns={1}>
          <Checkbox id={id("consent")} checked={form.consent} onChange={(v) => set("consent", v)} label="The student agreed to share these details with the Institution" error={err("consent")} />
        </FormSection>
      </FormModal>
    </>
  );
}

function ReviewAdvisorDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} text="Review Advisor" onClick={() => setOpen(true)} />
      <ReviewPartnerPopup isOpen={open} onClose={() => setOpen(false)} partnerId="ptn_002" partnerName="Global Pathways Education" managerOptions={MANAGERS} />
    </>
  );
}

export default function PopupForms() {
  return (
    <ShowcaseSection id="popup-forms" title="Form popups" description="Popups that hold a form.">
      <Demo
        name="FormModal"
        path="components/ub/feedback/FormModal.tsx"
        description="For long forms: full-screen sheet below 768px, centred panel above (560 / 720 / 960). Header and footer stay put while the body scrolls; a side nav jumps between sections from 992px. A failed submit shows an error summary that takes focus and links to each field. Closing with unsaved changes asks first. Try submitting the empty form."
        className="flex flex-wrap gap-3"
        code={`<FormModal
  open={open}
  onClose={close}
  size="xl"
  icon={UserPlus}
  title="Add student"
  onSubmit={submit}
  submitLabel="Add student"
  submitting={saving}
  errors={[{ fieldId: "student-passport", message: "Enter the passport number." }]}
  sections={[{ id: "student-personal", label: "Personal details" }]}
  dirty={dirty}
>
  <FormSection id="student-personal" title="Personal details">
    <Input id="student-passport" label="Passport number" reference required value={passport} onChange={setPassport} />
  </FormSection>
</FormModal>`}
        props={[
          { name: "open / onClose", type: "boolean / () => void", description: "onClose runs after the discard check when dirty." },
          { name: "title / description / icon", type: "ReactNode / ReactNode / LucideIcon", description: "Header; the icon sits in a brand tile." },
          { name: "size", type: '"md" | "lg" | "xl"', default: '"lg"', description: "560 / 720 / 960px from 768px; full screen below." },
          { name: "onSubmit", type: "(event) => void | Promise", description: "Runs on the submit button or Enter. Validate here." },
          { name: "submitLabel / submitIcon / submitTone", type: 'string / ReactNode / "primary" | "positive" | "destructive"', default: '— / — / "primary"', description: "The one Primary action, verb + object." },
          { name: "submitting / submitDisabled", type: "boolean", default: "false", description: "Busy state locks Cancel and close." },
          { name: "errors", type: "{ fieldId, message }[]", description: "Error summary; takes focus after a failed submit and links to fields." },
          { name: "sections", type: "{ id, label, invalid? }[]", description: "Side nav (992px+); pair with <FormSection id>." },
          { name: "dirty", type: "boolean", default: "false", description: "Closing asks “Discard changes?” first." },
          { name: "secondaryAction / footerNote", type: "ReactNode", description: "Start side of the footer, e.g. Save draft." },
        ]}
      >
        <AddStudentDemo />
      </Demo>

      <Demo
        name="Review Advisor popup"
        path="features/partners/components/admin/ReviewPartnerPopup.tsx"
        description="A short FormModal (md): assign the account manager, approve or reject, and a reason when rejecting. The Primary button names the decision and turns positive or destructive with it."
        className="flex flex-wrap gap-3"
      >
        <ReviewAdvisorDemo />
      </Demo>
    </ShowcaseSection>
  );
}
