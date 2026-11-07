"use client";

import { useState } from "react";
import { Building2, User, ArrowRightLeft, Copy } from "lucide-react";
import InputField from "components/ub/forms/text/InputField";
import TextareaField from "components/ub/forms/text/TextareaField";
import SelectField from "components/ub/forms/selection/SelectField";
import RadioField from "components/ub/forms/choices/RadioField";
import RichTextEditor from "components/ub/forms/text/RichTextEditor";
import ArrayObjectField from "components/ub/forms/layout/ArrayObjectField";
import CheckBoxGroup from "components/ub/forms/choices/CheckBoxGroup";
import CheckSimpleBoxGroup from "components/ub/forms/choices/CheckSimpleBoxGroup";
import PasswordField from "components/ub/forms/password/PasswordField";
import OtpInputField from "components/ub/forms/text/OtpInputField";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import MultiSelect from "components/ub/forms/selection/MultiSelect";
import SearchableSelect from "components/ub/forms/selection/SearchableSelect";
import ToggleInput from "components/ub/forms/choices/ToggleInput";
import SettingToggleInput from "components/ub/forms/choices/SettingToggleInput";
import SegmentedToggleField from "components/ub/forms/choices/SegmentedToggleField";
import StatusFileUpload from "components/ub/forms/uploads/StatusFileUpload";
import ImageUploadField from "components/ub/forms/uploads/ImageUploadField";
import IntakeDatePicker from "components/ub/forms/dates/IntakeDatePicker";
import SelectInput from "components/ub/forms/selection/SelectInput";
import PhoneInputField from "components/ub/forms/text/PhoneInputField";
import CommissionPercentageField from "components/ub/forms/numeric/CommissionPercentageField";
import PasswordRequirementsChecklist from "components/ub/forms/password/PasswordRequirementsChecklist";
import PasswordMatchIndicator from "components/ub/forms/password/PasswordMatchIndicator";
import RadioCardGroup from "components/ub/forms/choices/RadioCardGroup";
import SearchableChecklist, {
  type SearchableChecklistItem,
} from "components/ub/forms/selection/SearchableChecklist";
import DocumentUpload from "components/ub/forms/uploads/DocumentUpload";
import ImageUpload from "components/ub/forms/uploads/ImageUpload";
import PublicFileUploadField, {
  type PublicUploadResult,
} from "components/ub/forms/uploads/PublicFileUploadField";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { Demo, ShowcaseSection, Variant, useDemoForm } from "../Showcase";

const INSTITUTIONS = [
  { value: "uni_004", label: "Sunway University" },
  { value: "uni_002", label: "Taylor's University" },
  { value: "uni_003", label: "UCSI University" },
  { value: "uni_001", label: "Asia Pacific University" },
];
const FIELDS = [
  { id: "fos_001", name: "Computer Science & IT" },
  { id: "fos_002", name: "Business & Management" },
  { id: "fos_003", name: "Engineering" },
  { id: "fos_004", name: "Medicine & Health" },
  { id: "fos_005", name: "Law" },
  { id: "fos_006", name: "Hospitality & Tourism" },
];
const ADVISORS: SearchableChecklistItem[] = [
  {
    id: "ptn_001",
    label: "Global Pathways Education",
    sublabel: "global@example.com",
    badge: "Company",
  },
  { id: "ptn_002", label: "Ahmed Karim", sublabel: "ahmed@example.com" },
  {
    id: "ptn_003",
    label: "Bright Future Consultants",
    sublabel: "bright@example.com",
    badge: "Company",
  },
  { id: "ptn_004", label: "Fatima Yusuf", sublabel: "fatima@example.com" },
  {
    id: "ptn_005",
    label: "Nile Study Abroad",
    sublabel: "nile@example.com",
    badge: "Company",
  },
];

/** Some fields write an event-ish value; this mirrors how forms in the app wire them. */
function useUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const pick = (f: File) => {
    setFile(f);
    setUploading(true);
    setProgress(0);
    let p = 0;
    const timer = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        setUploading(false);
      }
    }, 200);
  };
  return { file, progress, uploading, pick, remove: () => setFile(null) };
}

export default function Forms() {
  const { showToast } = useToast();
  const text = useDemoForm(
    {
      student_name: "Nur Aisyah Binti Kamal",
      passport: "",
      intake_date: "2026-09-01",
      notes: "",
    },
    {
      passport: "Enter the passport number exactly as printed, e.g. A12345678.",
    }
  );
  const select = useDemoForm({
    university: "uni_004",
    university_input: "",
    level: "bachelor",
    fields: ["fos_001"],
    fields_simple: ["fos_002", "fos_005"],
  });
  const search = useDemoForm({
    dropdown: "",
    multi: ["uni_004"],
    searchable: "",
  });
  const toggles = useDemoForm({
    is_active: true,
    notify: false,
    is_public: false,
  });
  const secure = useDemoForm({ password: "", confirm: "", otp: "" });
  const contact = useDemoForm({
    dial_code: "+60",
    phone: "123456789",
    commission: "12",
    fees: [{ year: "Year 1", amount: "RM18,500" }],
  });
  const rich = useDemoForm({
    description:
      "<p>Bachelor of Computer Science (Hons) with a <strong>12-month</strong> industrial placement.</p>",
  });
  const [intake, setIntake] = useState("2026-09-01");
  const [mode, setMode] = useState<"move" | "copy">("move");
  const [selected, setSelected] = useState<Set<string>>(new Set(["ptn_002"]));
  const compact = useUpload();
  const imageUpload = useUpload();
  const status = useUpload();
  const [image, setImage] = useState<File | null>(null);
  const [publicResult, setPublicResult] = useState<{
    result: PublicUploadResult;
    name: string;
  } | null>(null);

  return (
    <ShowcaseSection
      id="forms"
      title="Forms"
      description="Field components share the formData / errors / updateFormData contract. All demos are live."
    >
      <Demo
        name="InputField and TextareaField"
        path="components/ub/forms/text/InputField.jsx"
        className="grid gap-x-6 md:grid-cols-2"
      >
        <InputField
          label="Student name"
          field="student_name"
          formData={text.formData}
          errors={text.errors}
          updateFormData={text.updateFormData}
        />
        <InputField
          label="Passport number"
          field="passport"
          placeholder="A12345678"
          formData={text.formData}
          errors={text.errors}
          updateFormData={text.updateFormData}
        />
        <InputField
          label="Intake date"
          field="intake_date"
          type="date"
          required={false}
          formData={text.formData}
          errors={text.errors}
          updateFormData={text.updateFormData}
        />
        <TextareaField
          label="Notes"
          field="notes"
          required={false}
          placeholder="Anything the Institution should know"
          formData={text.formData}
          errors={text.errors}
          updateFormData={text.updateFormData}
        />
      </Demo>

      <Demo
        name="SelectField, SelectInput and RadioField"
        path="components/ub/forms/"
        className="grid gap-x-6 md:grid-cols-2"
      >
        <SelectField
          label="Institution"
          field="university"
          options={INSTITUTIONS}
          formData={select.formData}
          errors={select.errors}
          updateFormData={select.updateFormData}
        />
        <Variant label="SelectInput (no label)">
          <SelectInput
            field="university_input"
            options={["Foundation", "Diploma", "Bachelor", "Master", "PhD"]}
            formData={select.formData}
            updateFormData={select.updateFormData}
          />
        </Variant>
        <RadioField
          label="Study level"
          field="level"
          options={[
            { value: "foundation", label: "Foundation" },
            { value: "bachelor", label: "Bachelor" },
            { value: "master", label: "Master" },
          ]}
          formData={select.formData}
          errors={select.errors}
          updateFormData={select.updateFormData}
        />
      </Demo>

      <Demo
        name="CheckBoxGroup and CheckSimpleBoxGroup"
        path="components/ub/forms/"
        className="grid gap-x-6 md:grid-cols-2"
      >
        <CheckBoxGroup
          label="Fields of study"
          field="fields"
          options={FIELDS}
          formData={select.formData}
          updateFormData={select.updateFormData}
          errors={select.errors}
        />
        <CheckSimpleBoxGroup
          label="Fields of study (searchable)"
          field="fields_simple"
          options={FIELDS}
          formData={select.formData}
          updateFormData={select.updateFormData}
          errors={select.errors}
        />
      </Demo>

      <Demo
        name="SearchableDropdown, MultiSelect and SearchableSelect"
        path="components/ub/forms/"
        className="grid gap-x-6 md:grid-cols-3"
      >
        <SearchableDropdown
          label="Institution"
          field="dropdown"
          options={INSTITUTIONS}
          formData={search.formData}
          errors={search.errors}
          updateFormData={search.updateFormData}
          placeholder="Search Institutions"
        />
        <MultiSelect
          label="Institutions"
          field="multi"
          options={INSTITUTIONS}
          formData={search.formData}
          errors={search.errors}
          updateFormData={search.updateFormData}
        />
        <SearchableSelect
          label="Institution"
          field="searchable"
          options={INSTITUTIONS}
          formData={search.formData}
          errors={search.errors}
          updateFormData={search.updateFormData}
        />
      </Demo>

      <Demo
        name="Toggles"
        path="components/ub/forms/"
        className="grid gap-6 md:grid-cols-3"
      >
        <ToggleInput
          label="Program status"
          field="is_active"
          enabledText="Active"
          disabledText="Inactive"
          formData={toggles.formData}
          updateFormData={toggles.updateFormData}
          errors={toggles.errors}
        />
        <SettingToggleInput
          label="Email me when an offer arrives"
          field="notify"
          formData={toggles.formData}
          updateFormData={toggles.updateFormData}
          errors={toggles.errors}
        />
        <Variant label="SegmentedToggleField">
          <SegmentedToggleField
            field="is_public"
            leftText="Private"
            rightText="Public"
            leftIcon={User}
            rightIcon={Building2}
            formData={toggles.formData}
            updateFormData={toggles.updateFormData}
          />
        </Variant>
      </Demo>

      <Demo
        name="Password and OTP"
        path="components/ub/forms/"
        className="grid gap-x-6 md:grid-cols-2"
      >
        <div>
          <PasswordField
            label="New password"
            field="password"
            formData={secure.formData}
            errors={secure.errors}
            updateFormData={secure.updateFormData}
          />
          <PasswordRequirementsChecklist password={secure.formData.password} />
        </div>
        <div>
          <PasswordField
            label="Confirm password"
            field="confirm"
            formData={secure.formData}
            errors={secure.errors}
            updateFormData={secure.updateFormData}
          />
          <PasswordMatchIndicator
            password={secure.formData.password}
            confirmPassword={secure.formData.confirm}
          />
        </div>
        <OtpInputField
          label="Verification code"
          field="otp"
          formData={secure.formData}
          errors={secure.errors}
          updateFormData={secure.updateFormData}
        />
      </Demo>

      <Demo
        name="Phone, commission and fee rows"
        path="components/ub/forms/"
        className="grid gap-x-6 md:grid-cols-2"
      >
        <PhoneInputField
          label="Phone number"
          dialCodeField="dial_code"
          numberField="phone"
          formData={contact.formData}
          errors={contact.errors}
          updateFormData={contact.updateFormData}
        />
        <CommissionPercentageField
          field="commission"
          formData={contact.formData}
          errors={contact.errors}
          updateFormData={contact.updateFormData}
        />
        <div className="md:col-span-2">
          <ArrayObjectField
            label="Yearly fees"
            subLabel="Fee"
            field="fees"
            formData={contact.formData}
            errors={contact.errors}
            updateFormData={contact.updateFormData}
            fields={[
              { key: "year", label: "Year" },
              { key: "amount", label: "Amount" },
            ]}
            insertPosition="end"
          />
        </div>
      </Demo>

      <Demo
        name="IntakeDatePicker"
        path="components/ub/forms/dates/IntakeDatePicker.tsx"
      >
        <IntakeDatePicker
          months={[1, 5, 9]}
          value={intake}
          onChange={setIntake}
        />
      </Demo>

      <Demo
        name="RichTextEditor"
        path="components/ub/forms/text/RichTextEditor.tsx"
      >
        <RichTextEditor
          label="Program description"
          field="description"
          formData={rich.formData}
          errors={rich.errors}
          updateFormData={rich.updateFormData}
        />
      </Demo>

      <Demo
        name="RadioCardGroup"
        path="components/ub/forms/choices/RadioCardGroup.tsx"
      >
        <RadioCardGroup<"move" | "copy">
          ariaLabel="Transfer mode"
          value={mode}
          onChange={setMode}
          options={[
            {
              value: "move",
              label: "Move Advisors",
              hint: "The new manager replaces the current one.",
              icon: ArrowRightLeft,
            },
            {
              value: "copy",
              label: "Share Advisors",
              hint: "Both managers can see these Advisors.",
              icon: Copy,
            },
          ]}
        />
      </Demo>

      <Demo
        name="SearchableChecklist"
        path="components/ub/forms/selection/SearchableChecklist.tsx"
      >
        <SearchableChecklist
          items={ADVISORS}
          selected={selected}
          onChange={setSelected}
          itemNoun="Advisors"
          label="Advisors"
          searchPlaceholder="Search Advisors"
        />
      </Demo>

      <Demo
        name="File uploads"
        path="components/ub/forms/"
        className="grid gap-6 lg:grid-cols-2"
      >
        <Variant label="ImageUpload">
          <ImageUpload
            label="University logo"
            description="PNG or JPG up to 10 MB"
            file={imageUpload.file}
            onFileChange={imageUpload.pick}
            onRemove={imageUpload.remove}
            uploading={imageUpload.uploading}
            progress={imageUpload.progress}
          />
        </Variant>
        <Variant label="DocumentUpload">
          <DocumentUpload
            id="demo-compact"
            label="Passport copy"
            description="PDF, JPG or PNG up to 10 MB"
            file={compact.file}
            onFileChange={compact.pick}
            onRemove={compact.remove}
            onError={(m) => { if (m) showToast(m, "error"); }}
            uploading={compact.uploading}
            progress={compact.progress}
            required
          />
        </Variant>
        <Variant label="StatusFileUpload">
          <StatusFileUpload
            id="demo-status"
            label="Academic transcript"
            description="Certified copy, PDF up to 10 MB"
            file={status.file}
            onFileChange={status.pick}
            onRemove={status.remove}
            onError={(m: string) => { if (m) showToast(m, "error"); }}
            uploading={status.uploading}
            progress={status.progress}
          />
        </Variant>
        <Variant label="ImageUploadField (simple mode)">
          <ImageUploadField
            label="Profile photo"
            field="photo"
            simpleFile={image}
            onSimpleFileChange={setImage}
            onSimpleRemove={() => setImage(null)}
            errors={{}}
            imageOnly
          />
        </Variant>
        <Variant label="PublicFileUploadField (uploads to the mock API)">
          <PublicFileUploadField
            label="Business registration"
            fieldId="demo-public"
            result={publicResult?.result ?? null}
            fileName={publicResult?.name}
            onUpload={(result, name) => setPublicResult({ result, name })}
            onRemove={() => setPublicResult(null)}
          />
        </Variant>
      </Demo>
    </ShowcaseSection>
  );
}
