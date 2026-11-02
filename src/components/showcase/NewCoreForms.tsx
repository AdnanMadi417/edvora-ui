"use client";

import { useEffect, useRef, useState } from "react";
import Button from "components/ub/core/Button";
import { TextButton } from "components/ub/core/TextButton";
import { ButtonGroup } from "components/ub/core/ButtonGroup";
import { Input } from "components/ub/forms/Input";
import { Textarea } from "components/ub/forms/Textarea";
import { Checkbox } from "components/ub/forms/Checkbox";
import { Radio, RadioGroup } from "components/ub/forms/Radio";
import { Toggle } from "components/ub/forms/Toggle";
import { Stepper } from "components/ub/forms/Stepper";
import { Combobox, type ComboboxOption } from "components/ub/forms/Combobox";
import { FileUpload, type FileUploadItem, type FileUploadStatus } from "components/ub/forms/FileUpload";
import { Icon, iconNames, type IconSize } from "components/ub/icons/Icon";
import { Demo, ShowcaseSection, StateSwitch, ThemePreviews, Variant } from "./Showcase";

// Initials tile standing in for Institution logos until the SVGs arrive.
function LogoTile({ initials }: { initials: string }) {
  return (
    <span className="grid h-full w-full place-items-center bg-ub-tone-brand-bg text-ub-label-sm text-ub-tone-brand-text" aria-hidden="true">
      {initials}
    </span>
  );
}

const INSTITUTIONS: ComboboxOption[] = [
  { value: "sunway", label: "Sunway University", description: "Bandar Sunway, Malaysia", logo: <LogoTile initials="SU" />, meta: "48 programs" },
  { value: "taylors", label: "Taylor's University", description: "Subang Jaya, Malaysia", logo: <LogoTile initials="TU" />, meta: "36 programs" },
  { value: "apu", label: "Asia Pacific University", description: "Kuala Lumpur, Malaysia", logo: <LogoTile initials="AP" />, meta: "29 programs" },
  { value: "ucsi", label: "UCSI University", description: "Kuala Lumpur, Malaysia", logo: <LogoTile initials="UC" />, meta: "Intake closed", disabled: true },
  { value: "monash", label: "Monash University Malaysia", description: "Bandar Sunway, Malaysia", logo: <LogoTile initials="MU" />, meta: "22 programs" },
  { value: "nottingham", label: "University of Nottingham Malaysia", description: "Semenyih, Malaysia", logo: <LogoTile initials="UN" />, meta: "31 programs" },
];

const ICON_SIZES: IconSize[] = [16, 20, 24, 32];

/** Textarea demo with its own state: default, with count, error, disabled. */
function TextareaDemo() {
  const [state, setState] = useState<"default" | "error" | "disabled">("default");
  const [reason, setReason] = useState("The academic transcript is not certified.");
  return (
    <Demo
      name="Textarea"
      path="components/ub/forms/Textarea.tsx"
      description="Same label, helper and error pattern as Input, for reasons, notes and descriptions. maxLength adds a tabular count and caps input."
      className="grid gap-6"
      code={`<Textarea
  label="Reason for rejection"
  value={reason}
  onChange={setReason}
  maxLength={500}
  error={submitted && !reason.trim() ? "Tell the Advisor why the registration is rejected." : undefined}
  required
/>`}
      props={[
        { name: "label", type: "ReactNode", description: "Shown above; required adds aria-required, optional fields are marked." },
        { name: "value / onChange", type: "string / (value, event) => void", description: "Controlled value." },
        { name: "helperText", type: "ReactNode", description: "Shown under the field." },
        { name: "error", type: "ReactNode", description: "What happened and how to fix it; sets aria-invalid." },
        { name: "maxLength", type: "number", description: "Caps input and shows “120 / 500”." },
        { name: "rows", type: "number", default: "4", description: "Initial height; resizable vertically." },
        { name: "hideLabel", type: "boolean", default: "false", description: "Visually hidden label for screen readers." },
      ]}
    >
      <StateSwitch<"default" | "error" | "disabled"> value={state} options={["default", "error", "disabled"] as const} onChange={setState} label="Textarea state" />
      <ThemePreviews>
        <Textarea
          label="Reason for rejection"
          helperText="Be specific, so the Advisor knows what to fix."
          value={state === "error" ? "" : reason}
          onChange={setReason}
          maxLength={500}
          error={state === "error" ? "Tell the Advisor why the registration is rejected." : undefined}
          disabled={state === "disabled"}
          required
          rows={3}
        />
      </ThemePreviews>
    </Demo>
  );
}

function useFakeUpload() {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);
  useEffect(() => () => timers.current.forEach(clearInterval), []);

  const start = (picked: File[], replaceId?: string) => {
    picked.forEach((file) => {
      const id = replaceId ?? `${file.name}-${Date.now()}`;
      const item: FileUploadItem = { id, name: file.name, size: file.size, status: "uploading", progress: 0 };
      setFiles((list) => (replaceId ? list.map((f) => (f.id === replaceId ? item : f)) : [...list, item]));
      let p = 0;
      const t = setInterval(() => {
        p += 25;
        setFiles((list) => list.map((f) => (f.id === id ? { ...f, progress: p, status: p >= 100 ? "uploaded" : "uploading" } : f)));
        if (p >= 100) clearInterval(t);
      }, 250);
      timers.current.push(t);
    });
  };
  return { files, start, remove: (id: string) => setFiles((list) => list.filter((f) => f.id !== id)) };
}

const ROW_STATES = ["uploading", "uploaded", "verified", "needs replacing"] as const;
type RowState = (typeof ROW_STATES)[number];

export default function NewCoreForms() {
  const [name, setName] = useState("Nur Aisyah Binti Kamal");
  const [passport, setPassport] = useState("a1234567");
  const [fee, setFee] = useState("4,200");
  const [email, setEmail] = useState("aisyah.kamal@");
  const [reference, setReference] = useState("UBX-2026-0412");

  const [consent, setConsent] = useState(true);
  const [docs, setDocs] = useState({ passport: true, transcript: false, photo: false });
  const allDocs = Object.values(docs).every(Boolean);
  const someDocs = Object.values(docs).some(Boolean);

  const [level, setLevel] = useState<string | null>("bachelor");
  const [intake, setIntake] = useState<string | null>(null);
  const [standalone, setStandalone] = useState("email");

  const [notifyOffer, setNotifyOffer] = useState(true);
  const [glassBox, setGlassBox] = useState(false);

  const [deposit, setDeposit] = useState(4200);
  const [duration, setDuration] = useState(36);
  const [students, setStudents] = useState(1);

  const [institution, setInstitution] = useState<string | null>("sunway");
  const [institution2, setInstitution2] = useState<string | null>(null);

  const upload = useFakeUpload();
  const [rowState, setRowState] = useState<RowState>("needs replacing");
  const staticStatus: FileUploadStatus = rowState === "needs replacing" ? "needs-replacing" : rowState;

  return (
    <ShowcaseSection
      id="core-forms-new"
      title="Core and forms (brief primitives)"
      description="Generic, controlled primitives from brief §4.1–§4.2 and §4.8: value in, onChange out, no form-state contract. All demos are live and keyboard operable."
    >
      <Demo name="TextButton" path="components/ub/core/TextButton.tsx" description="Tertiary text action for cards and tables. Renders a link when given an href." className="flex flex-wrap items-center gap-6">
        <Variant label="Sizes">
          <div className="flex flex-wrap items-center gap-4">
            <TextButton size="sm">View offer letter</TextButton>
            <TextButton>View offer letter</TextButton>
            <TextButton size="lg">View offer letter</TextButton>
          </div>
        </Variant>
        <Variant label="With icons">
          <div className="flex flex-wrap items-center gap-4">
            <TextButton leadingIcon="download">Download receipt</TextButton>
            <TextButton trailingIcon="arrow-right" href="#core-forms-new">
              Open Application Tracker
            </TextButton>
            <TextButton trailingIcon="external-link" href="#core-forms-new">
              Knowledge Hub
            </TextButton>
          </div>
        </Variant>
        <Variant label="Disabled">
          <div className="flex flex-wrap items-center gap-4">
            <TextButton disabled leadingIcon="edit">
              Edit application
            </TextButton>
            <TextButton disabled href="#core-forms-new">
              View commission
            </TextButton>
          </div>
        </Variant>
      </Demo>

      <Demo name="ButtonGroup" path="components/ub/core/ButtonGroup.tsx" description="Up to three buttons, Primary last in reading order. Stacks full-width on mobile when asked, Primary on top." className="grid gap-6">
        <Variant label="align end (dialog footer)">
          <ButtonGroup>
            <Button text="Cancel" variant="secondary" />
            <Button text="Submit application" variant="primary" />
          </ButtonGroup>
        </Variant>
        <Variant label="align between, stacks on mobile">
          <ButtonGroup align="between" stackOnMobile label="Application actions">
            <Button text="Save draft" variant="tertiary" />
            <Button text="Back" variant="secondary" />
            <Button text="Continue to documents" variant="primary" />
          </ButtonGroup>
        </Variant>
        <Variant label="align start">
          <ButtonGroup align="start">
            <Button text="Add student" variant="primary" size="sm" />
          </ButtonGroup>
        </Variant>
      </Demo>

      <Demo name="Input" path="components/ub/forms/Input.tsx" description="Label above, (optional) marker, helper text, errors that say how to fix it, prefix with tabular numerals, reference mode." className="grid gap-x-6 md:grid-cols-2">
        <Input label="Student name" required value={name} onChange={setName} autoComplete="name" />
        <Input
          label="Passport number"
          required
          reference
          value={passport}
          onChange={setPassport}
          placeholder="A12345678"
          error={passport.length < 9 ? "This passport number is too short. Enter all 9 characters exactly as printed." : undefined}
        />
        <Input label="Tuition fee per year" required prefix="RM" inputMode="numeric" value={fee} onChange={setFee} helperText="As quoted on the Institution's fee schedule for 2026." />
        <Input label="Student email" leadingIcon="mail" type="email" value={email} onChange={setEmail} error={email.includes(".") ? undefined : "This email is missing its domain. Enter it as name@example.com."} />
        <Input label="Application reference" reference leadingIcon="search" value={reference} onChange={setReference} helperText="Starts with UBX, for example UBX-2026-0412." />
        <Input label="Advisor notes" disabled value="Locked after submission" onChange={() => {}} helperText="Disabled fields keep their value visible." />
      </Demo>

      <TextareaDemo />

      <Demo name="Checkbox" path="components/ub/forms/Checkbox.tsx" description="20px, radius 4. Label, description and an indeterminate state for select-all." className="grid gap-6 md:grid-cols-2">
        <Variant label="With description">
          <Checkbox
            checked={consent}
            onChange={setConsent}
            label="Share updates with the student"
            description="Nur Aisyah Binti Kamal sees each stage change in her Glass Box view."
          />
        </Variant>
        <Variant label="Indeterminate select-all">
          <div className="grid gap-3">
            <Checkbox
              checked={allDocs}
              indeterminate={someDocs && !allDocs}
              onChange={(c) => setDocs({ passport: c, transcript: c, photo: c })}
              label="All documents received"
            />
            <div className="grid gap-3 ps-8">
              <Checkbox checked={docs.passport} onChange={(c) => setDocs((d) => ({ ...d, passport: c }))} label="Passport" />
              <Checkbox checked={docs.transcript} onChange={(c) => setDocs((d) => ({ ...d, transcript: c }))} label="Academic transcript" />
              <Checkbox checked={docs.photo} onChange={(c) => setDocs((d) => ({ ...d, photo: c }))} label="Passport photo" />
            </div>
          </div>
        </Variant>
        <Variant label="Error and disabled">
          <div className="grid gap-3">
            <Checkbox checked={false} onChange={() => {}} label="I confirm the documents are genuine" error="Confirm the documents before you submit the application." />
            <Checkbox checked disabled onChange={() => {}} label="Verified by Unibexs" />
          </div>
        </Variant>
      </Demo>

      <Demo name="Radio and RadioGroup" path="components/ub/forms/Radio.tsx" description="20px with a 6px dot. The group is one tab stop; arrow keys move and select, mirrored in RTL." className="grid gap-6 md:grid-cols-3">
        <RadioGroup
          legend="Study level"
          required
          value={level}
          onChange={setLevel}
          options={[
            { value: "foundation", label: "Foundation" },
            { value: "diploma", label: "Diploma" },
            { value: "bachelor", label: "Bachelor", description: "Most Sunway University intakes" },
            { value: "master", label: "Master" },
          ]}
        />
        <RadioGroup
          legend="Intake"
          required
          orientation="horizontal"
          value={intake}
          onChange={setIntake}
          error={intake ? undefined : "Choose an intake to see the matching fees."}
          options={[
            { value: "sep-2026", label: "Sep 2026" },
            { value: "jan-2027", label: "Jan 2027" },
            { value: "may-2027", label: "May 2027", disabled: true },
          ]}
        />
        <Variant label="Standalone Radio">
          <div className="grid gap-3" role="radiogroup" aria-label="Contact preference">
            <Radio name="contact" value="email" checked={standalone === "email"} onChange={setStandalone} label="Email" />
            <Radio name="contact" value="whatsapp" checked={standalone === "whatsapp"} onChange={setStandalone} label="WhatsApp" description="+60 12-345 6789" />
          </div>
        </Variant>
      </Demo>

      <Demo name="Toggle" path="components/ub/forms/Toggle.tsx" description="40×24 switch for settings that apply instantly. Use Checkbox for choices saved with a form." className="grid max-w-ub-reading gap-5">
        <Toggle checked={notifyOffer} onChange={setNotifyOffer} label="Email me when an offer arrives" description="Applies right away to every student you advise." switchPosition="end" />
        <Toggle checked={glassBox} onChange={setGlassBox} label="Show commission in Glass Box preview" description="Students never see this. It only affects your preview." switchPosition="end" />
        <Toggle checked disabled onChange={() => {}} label="Two-step sign-in" description="Required for every Advisor account." switchPosition="end" />
      </Demo>

      <Demo name="Stepper" path="components/ub/forms/Stepper.tsx" description="Arrow Up/Down step, Page Up/Down step ×10, Home/End jump to the limits. Typed values clamp on blur." className="grid gap-x-6 md:grid-cols-3">
        <Stepper label="Tuition deposit" required prefix="RM" min={0} max={20000} step={100} value={deposit} onChange={setDeposit} helperText="Between RM0 and RM20,000." />
        <Stepper label="Program duration" required suffix="months" min={6} max={60} step={6} value={duration} onChange={setDuration} />
        <Stepper label="Students in this group" min={1} max={10} value={students} onChange={setStudents} error={students > 5 ? "Groups over 5 need Institution approval. Split the group or attach the approval letter." : undefined} />
      </Demo>

      <Demo name="Combobox" path="components/ub/forms/Combobox.tsx" description="ARIA 1.2 combobox: type to filter, arrows to move, Enter to choose, Esc to close. Options show logo, city and country." className="grid gap-x-6 md:grid-cols-2">
        <Combobox label="Institution" required options={INSTITUTIONS} value={institution} onChange={setInstitution} placeholder="Search Institutions" clearable helperText="Try typing a city, such as Kuala Lumpur." />
        <Combobox
          label="Partner Institution"
          options={INSTITUTIONS}
          value={institution2}
          onChange={setInstitution2}
          placeholder="Search Institutions"
          error={institution2 ? undefined : "Choose the Institution that issued the offer letter."}
          emptyMessage={(q) => `No Institutions match "${q.trim()}". Check the spelling or search by city.`}
        />
        <Variant label="Inside a scroll container" className="md:col-span-2">
          <div className="h-48 overflow-y-auto rounded-ub-lg border border-ub-border p-4">
            <p className="mb-4 text-ub-body-sm text-ub-text-secondary">Scroll down to the field. The list opens above when there is no room below.</p>
            <div className="h-24" />
            <Combobox label="Institution" options={INSTITUTIONS} value={institution} onChange={setInstitution} placeholder="Search Institutions" />
            <div className="h-24" />
          </div>
        </Variant>
        <Combobox label="Institution" disabled options={INSTITUTIONS} value="taylors" onChange={() => {}} helperText="Locked once the application is submitted." />
      </Demo>

      <Demo name="FileUpload" path="components/ub/forms/FileUpload.tsx" description="Dashed 1.5px dropzone, radius 12. Type and size are checked before upload; the caller drives each row's state." className="grid gap-6 md:grid-cols-2">
        <FileUpload
          label="Supporting documents"
          description="Transcript, passport and photo for Nur Aisyah Binti Kamal."
          accept={[".pdf", ".jpg", ".png"]}
          maxSizeMb={10}
          multiple
          required
          files={upload.files}
          onSelect={(f) => upload.start(f)}
          onReplace={(id, f) => upload.start([f], id)}
          onRemove={upload.remove}
        />
        <div>
          <StateSwitch<(typeof ROW_STATES)[number]> label="Row state" value={rowState} options={ROW_STATES} onChange={setRowState} />
          <FileUpload
            label="Passport"
            accept={[".pdf"]}
            required
            files={[
              {
                id: "passport",
                name: "passport-nur-aisyah.pdf",
                size: 2_400_000,
                status: staticStatus,
                progress: 60,
                reason: "The photo page is cut off. Upload a scan that shows all four corners.",
              },
            ]}
            onSelect={() => setRowState("uploading")}
            onReplace={() => setRowState("uploading")}
            onRemove={() => setRowState("needs replacing")}
          />
        </div>
        <FileUpload label="Offer letter" accept={[".pdf"]} files={[]} onSelect={() => {}} disabled description="Available once the Institution issues an offer." />
      </Demo>

      <Demo name="Icon" path="components/ub/icons/Icon.tsx" description="Lucide today, Iconoir later: callers use names only. 1.25 stroke at 16, 1.5 otherwise. Directional icons mirror in RTL; decorative unless labelled." className="grid gap-6">
        <Variant label="Sizes 16 · 20 · 24 · 32">
          <div className="flex items-end gap-6 text-ub-icon-default">
            {ICON_SIZES.map((s) => (
              <span key={s} className="flex flex-col items-center gap-2">
                <Icon name="graduation" size={s} />
                <span className="ub-tabular text-ub-caption text-ub-text-tertiary">{s}</span>
              </span>
            ))}
          </div>
        </Variant>
        <Variant label="RTL mirroring (arrows mirror, checks and clocks do not)">
          <div dir="rtl" className="flex items-center gap-4 text-ub-icon-interactive">
            <Icon name="arrow-right" label="Next" />
            <Icon name="chevron-right" label="Open" />
            <Icon name="send" label="Send" />
            <Icon name="check" label="Done" />
            <Icon name="clock" label="Pending" />
          </div>
        </Variant>
        <Variant label={`All ${iconNames.length} names`}>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {iconNames.map((n) => (
              <li key={n} className="flex items-center gap-2 rounded-ub-md border border-ub-border px-3 py-2 text-ub-icon-default">
                <Icon name={n} size={20} />
                <code className="ub-ref truncate text-ub-caption text-ub-text-secondary">{n}</code>
              </li>
            ))}
          </ul>
        </Variant>
      </Demo>
    </ShowcaseSection>
  );
}
