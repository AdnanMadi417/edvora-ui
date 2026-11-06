"use client";

import { useState } from "react";
import UniversityTypeEditor, {
  type UniversityTypeEditorData,
} from "features/universities/configuration/components/shared/UniversityTypeEditor";
import UniversityTypeDetailsView from "features/universities/configuration/components/shared/UniversityTypeDetailsView";
import { Demo, StateSwitch } from "../Showcase";

const sample = {
  id: "sample-standard",
  name: "Standard application",
  description:
    "Submission requirements for institutions using the standard application process.",
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
      field_name: "Current address",
      is_required: true,
    },
    {
      id: "rule-education",
      field_key: "student.previous_educations",
      field_name: "Previous education",
      is_required: false,
    },
  ],
};
export function UniversityTypeFormDemo() {
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<UniversityTypeEditorData>({
    name: sample.name,
    description: sample.description,
    required_fields_map: Object.fromEntries(
      sample.required_fields.map((field) => [field.id, field.is_required])
    ),
  });
  return (
    <Demo
      name="University type create & edit"
      path="features/universities/configuration/components/shared/UniversityTypeEditor.tsx"
      description="Shared form for institution categories and application field requirements. Search and filter the choices, mark fields required or optional, and review the live summary. This preview never calls an API."
    >
      <StateSwitch<"create" | "edit">
        value={mode}
        options={["create", "edit"]}
        onChange={setMode}
        label="Form mode"
      />
      {saved && (
        <p
          role="status"
          className="mb-3 text-ub-body-sm text-ub-tone-success-text"
        >
          Preview saved. No records were changed.
        </p>
      )}
      <UniversityTypeEditor
        mode={mode}
        formData={data}
        submissionFields={sample.required_fields}
        errors={{}}
        onValidate={() => {}}
        isFormValid={
          data.name.trim().length >= 3 && data.description.trim().length >= 10
        }
        dirty
        onCancel={() => setSaved(false)}
        onSubmit={() => setSaved(true)}
        updateFormData={(field, value) => {
          setSaved(false);
          if (field.startsWith("required_fields_map."))
            setData((previous) => ({
              ...previous,
              required_fields_map: {
                ...previous.required_fields_map,
                [field.slice("required_fields_map.".length)]: value,
              },
            }));
          else setData((previous) => ({ ...previous, [field]: value }));
        }}
      />
    </Demo>
  );
}
export function UniversityTypeDetailsDemo() {
  return (
    <Demo
      name="University type details"
      path="features/universities/configuration/components/shared/UniversityTypeDetailsView.tsx"
      description="Configuration overview with required/optional counts and a searchable field list. Sample links are for layout preview."
    >
      <UniversityTypeDetailsView university={sample} />
    </Demo>
  );
}
