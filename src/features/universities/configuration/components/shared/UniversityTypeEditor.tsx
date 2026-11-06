"use client";

import { ArrowRight, Check, Layers, SlidersHorizontal } from "lucide-react";
import FormPage from "components/ub/forms/layout/FormPage";
import InputField from "components/ub/forms/text/InputField";
import TextareaField from "components/ub/forms/text/TextareaField";
import RequirementSelector from "components/ub/forms/choices/RequirementSelector";
import Alert from "components/ub/feedback/notifications/Alert";
import Skeleton from "components/ub/feedback/states/Skeleton";
import Button from "components/ub/core/buttons/Button";
import Tag from "components/ub/data/badges/Tag";

export interface UniversityTypeEditorData {
  name: string;
  description: string;
  required_fields_map: Record<string, boolean>;
}
interface Props {
  mode?: "create" | "edit";
  formData: UniversityTypeEditorData;
  errors: Record<string, string>;
  submissionFields: { id: string; field_name: string }[];
  updateFormData: (field: string, value: any) => void;
  onValidate: (field: "name" | "description") => void;
  onSubmit: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  fieldsLoading?: boolean;
  fieldsError?: string | null;
  refetchFields?: () => unknown;
  isFormValid: boolean;
  dirty?: boolean;
}
export default function UniversityTypeEditor({
  mode = "create",
  formData,
  errors,
  submissionFields,
  updateFormData,
  onValidate,
  onSubmit,
  onCancel,
  loading,
  fieldsLoading,
  fieldsError,
  refetchFields,
  isFormValid,
  dirty,
}: Props) {
  const requiredFields = submissionFields.filter(
    (field) => formData.required_fields_map[field.id]
  );
  const optionalCount = submissionFields.length - requiredFields.length;
  return (
    <FormPage
      stickyActions
      title={
        mode === "edit" ? "Edit university type" : "Create university type"
      }
      description="Define an institution category and the information advisors need to submit an application."
      className="mx-auto max-w-6xl"
      icon={Layers}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={mode === "edit" ? "Save changes" : "Create type"}
      submitting={loading}
      submitDisabled={
        !isFormValid ||
        fieldsLoading ||
        !!fieldsError ||
        (mode === "edit" && !dirty)
      }
    >
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_17rem] 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="type-details-title">
            <div className="mb-5 flex items-start gap-3">
              <span
                className="ub-tabular grid h-7 w-7 shrink-0 place-items-center rounded-ub-full bg-ub-tone-brand-bg text-ub-label-sm text-ub-tone-brand-text"
                aria-hidden="true"
              >
                1
              </span>
              <div>
                <h2
                  id="type-details-title"
                  className="text-ub-heading-sm text-ub-text-primary"
                >
                  Type details
                </h2>
                <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
                  Give this category a clear name and explain when it should be
                  used.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <InputField
                label="Category type"
                field="name"
                placeholder="e.g. Standard application"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                hint="Use 3–100 characters."
                onBlur={() => {
                  onValidate("name");
                }}
              />
              <TextareaField
                label="Description"
                field="description"
                placeholder="Explain which institutions use this category and what makes their application requirements different."
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                hint="At least 10 characters. This helps your team choose the right type."
                onBlur={() => {
                  onValidate("description");
                }}
              />
            </div>
          </section>

          <section
            aria-labelledby="requirements-title"
            className="border-t border-ub-border pt-7"
          >
            <div className="mb-5 flex items-start gap-3">
              <span
                className="ub-tabular grid h-7 w-7 shrink-0 place-items-center rounded-ub-full bg-ub-tone-brand-bg text-ub-label-sm text-ub-tone-brand-text"
                aria-hidden="true"
              >
                2
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="requirements-title"
                    className="text-ub-heading-sm text-ub-text-primary"
                  >
                    Application requirements
                  </h2>
                  {!fieldsLoading && !fieldsError && (
                    <Tag tone="neutral" size="sm">
                      {requiredFields.length} required
                    </Tag>
                  )}
                </div>
                <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
                  Choose which fields must be completed. Fields left off stay
                  optional.
                </p>
              </div>
            </div>
            {fieldsLoading ? (
              <div
                role="status"
                aria-label="Loading application fields"
                className="grid gap-3 sm:grid-cols-2"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-24 rounded-ub-md" />
                ))}
              </div>
            ) : fieldsError ? (
              <Alert tone="danger" title="Application fields couldn't load">
                <p>{fieldsError}</p>
                {refetchFields && (
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      text="Try again"
                      onClick={() => {
                        void refetchFields();
                      }}
                    />
                  </div>
                )}
              </Alert>
            ) : submissionFields.length ? (
              <RequirementSelector
                fields={submissionFields.map((field) => ({
                  id: field.id,
                  label: field.field_name,
                }))}
                value={formData.required_fields_map}
                onChange={(id, required) =>
                  updateFormData(`required_fields_map.${id}`, required)
                }
                errors={Object.fromEntries(
                  Object.entries(errors)
                    .filter(([key]) => key.startsWith("required_fields_map."))
                    .map(([key, message]) => [
                      key.slice("required_fields_map.".length),
                      message,
                    ])
                )}
                disabled={loading}
              />
            ) : (
              <Alert tone="info" title="No submission fields available">
                {mode === "edit"
                  ? "No field rules are configured for this type."
                  : "You can create this type without additional field requirements."}
              </Alert>
            )}
          </section>
        </div>

        <aside
          aria-labelledby="type-summary-title"
          className="space-y-5 rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-5 xl:sticky xl:top-24"
        >
          <div className="flex items-center gap-2 text-ub-text-secondary">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <h2 id="type-summary-title" className="text-ub-label-md">
              At a glance
            </h2>
          </div>
          <div>
            <p className="break-words text-ub-heading-sm text-ub-text-primary">
              {formData.name.trim() || "Your university type"}
            </p>
            <p className="mt-2 line-clamp-4 whitespace-pre-wrap break-words text-ub-body-sm text-ub-text-secondary">
              {formData.description.trim() ||
                "Add a description to give your team context."}
            </p>
          </div>
          <div
            className="grid grid-cols-2 gap-3 border-y border-ub-border py-4"
            aria-live="polite"
          >
            <div>
              <p className="ub-tabular text-ub-heading-lg text-ub-text-primary">
                {fieldsLoading || fieldsError ? "—" : requiredFields.length}
              </p>
              <p className="text-ub-caption text-ub-text-secondary">
                Required fields
              </p>
            </div>
            <div>
              <p className="ub-tabular text-ub-heading-lg text-ub-text-primary">
                {fieldsLoading || fieldsError ? "—" : optionalCount}
              </p>
              <p className="text-ub-caption text-ub-text-secondary">
                Optional fields
              </p>
            </div>
          </div>
          {requiredFields.length > 0 && (
            <div>
              <h3 className="mb-3 text-ub-label-sm text-ub-text-secondary">
                Required at submission
              </h3>
              <ul className="space-y-2">
                {requiredFields.map((field) => (
                  <li
                    key={field.id}
                    className="flex items-start gap-2 text-ub-body-sm text-ub-text-primary"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-ub-text-link"
                      aria-hidden="true"
                    />
                    <span>{field.field_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="flex items-start gap-2 text-ub-body-sm text-ub-text-secondary">
            <ArrowRight
              className="mt-0.5 h-4 w-4 shrink-0 text-ub-icon-default"
              aria-hidden="true"
            />
            <span>
              Institutions assigned to this type use these application
              requirements.
            </span>
          </p>
        </aside>
      </div>
    </FormPage>
  );
}
