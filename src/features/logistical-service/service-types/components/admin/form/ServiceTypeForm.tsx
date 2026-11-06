"use client";
import { useEffect, useState } from "react";
import { Pencil, Truck } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import InputField from "components/ub/forms/text/InputField";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { validateServiceName } from "../../../utils/validateServiceName";

export default function ServiceTypeForm({
  open,
  onClose,
  initialName = "",
  editing = false,
  submitting,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  editing?: boolean;
  submitting: boolean;
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  useEffect(() => {
    if (open) {
      setName(initialName);
      setErrors({});
      setApiError("");
    }
  }, [open, initialName]);
  const handleError = useApiFormErrors({
    setErrors: (patch) => setErrors(patch),
    onUnmappedError: setApiError,
  });
  async function submit() {
    const error = validateServiceName(name);
    if (error) {
      setErrors({ name: error });
      return;
    }
    try {
      await onSave(name.trim());
    } catch (err) {
      handleError(err, "Unable to save service type.");
    }
  }
  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={editing ? "Edit logistics service" : "Create logistics service"}
      description={
        editing
          ? "Update the service name used by logistics providers."
          : "Add a service that logistics providers can offer to students."
      }
      icon={editing ? Pencil : Truck}
      onSubmit={submit}
      submitLabel={editing ? "Save changes" : "Create logistics service"}
      submitting={submitting}
      submitDisabled={
        Boolean(validateServiceName(name)) ||
        (editing && name.trim() === initialName)
      }
    >
      <fieldset disabled={submitting} className="min-w-0 space-y-4">
        <InputField
          label="Service name"
          field="name"
          required
          placeholder="e.g. Airport transfer"
          formData={{ name }}
          errors={errors}
          updateFormData={(_, value) => {
            setName(String(value));
            setErrors({});
            setApiError("");
          }}
          onBlur={() => setErrors({ name: validateServiceName(name) })}
        />
        <p className="text-ub-caption text-ub-text-tertiary">
          Use a clear name between 3 and 255 characters.
        </p>
        {apiError && (
          <p
            role="alert"
            className="rounded-ub-md border border-red-200 bg-red-50 p-3 text-ub-body-sm text-red-700"
          >
            {apiError}
          </p>
        )}
      </fieldset>
    </FormModal>
  );
}
