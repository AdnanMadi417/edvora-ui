"use client";
import { useState } from "react";
import { Languages } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import Input from "components/ub/forms/text/Input";
import Textarea from "components/ub/forms/text/Textarea";
import Combobox from "components/ub/forms/selection/Combobox";
import { checkbox } from "components/ub/recipes";
import { parseApiError } from "utils/parseApiError";
import type { University } from "features/universities/types";
import { validateLanguageCenter, type LanguageCenterInput } from "./types";

export default function LanguageCenterForm({
  initial,
  editing,
  universities,
  onClose,
  onSave,
}: {
  initial: LanguageCenterInput;
  editing: boolean;
  universities: University[];
  onClose: () => void;
  onSave: (data: LanguageCenterInput) => Promise<void>;
}) {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");
  function update<K extends keyof LanguageCenterInput>(
    field: K,
    value: LanguageCenterInput[K]
  ) {
    setData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
    setFailure("");
  }
  return (
    <FormModal
      open
      onClose={onClose}
      icon={Languages}
      title={editing ? "Edit language center" : "Create language center"}
      description="Link the center to its university and add the details your team needs."
      submitLabel={editing ? "Save changes" : "Create center"}
      submitting={saving}
      dirty={JSON.stringify(data) !== JSON.stringify(initial)}
      errors={Object.entries(errors)
        .filter(([, message]) => message)
        .map(([field, message]) => ({ fieldId: `lc-${field}`, message }))}
      onSubmit={async (event) => {
        event.preventDefault();
        const invalid = validateLanguageCenter(data);
        setErrors(invalid);
        if (Object.keys(invalid).length) return;
        setSaving(true);
        setFailure("");
        try {
          await onSave({
            ...data,
            name: data.name.trim(),
            location: data.location.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
            description: data.description.trim(),
          });
        } catch (error) {
          setFailure(
            parseApiError(error, "Unable to save language center. Try again.")
          );
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid gap-4">
        {failure && (
          <p role="alert" className="text-ub-tone-danger-text">
            {failure}
          </p>
        )}
        <Input
          wrapperClassName="mb-0"
          id="lc-name"
          label="Center name"
          required
          value={data.name}
          onChange={(value) => update("name", value)}
          error={errors.name}
          disabled={saving}
        />
        <Combobox
          className="!mb-0"
          id="lc-university_id"
          label="University"
          required
          options={universities.map((university) => ({
            value: university.id,
            label: university.name,
            description: university.is_active
              ? undefined
              : "Inactive university",
          }))}
          value={data.university_id || null}
          onChange={(value) => update("university_id", value ?? "")}
          error={errors.university_id}
          disabled={saving}
        />
        <Input
          wrapperClassName="mb-0"
          id="lc-location"
          label="Location"
          required
          value={data.location}
          onChange={(value) => update("location", value)}
          error={errors.location}
          disabled={saving}
        />
        <Textarea
          wrapperClassName="mb-0"
          label="Description"
          value={data.description}
          onChange={(value) => update("description", value)}
          disabled={saving}
        />
        <label className="flex min-h-11 items-center gap-3 text-ub-label-md">
          <input
            type="checkbox"
            className={checkbox}
            checked={data.is_active}
            disabled={saving}
            onChange={(event) => update("is_active", event.target.checked)}
          />
          Active center
        </label>
      </div>
    </FormModal>
  );
}
