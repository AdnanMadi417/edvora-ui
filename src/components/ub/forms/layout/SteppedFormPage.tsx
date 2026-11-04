"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import FormPage, { type FormPageProps } from "./FormPage";
import StepIndicator from "components/ub/navigation/controls/StepIndicator";
import TextButton from "components/ub/core/buttons/TextButton";

export interface FormPageStep {
  id: string;
  label: string;
  description: string;
  content: ReactNode;
  /** Validate only this step and display its errors. */
  validate?: () => boolean;
}

export interface SteppedFormPageProps
  extends Omit<FormPageProps, "children" | "showActions" | "submitDisabled"> {
  steps: FormPageStep[];
  /** Controlled so API field errors can reopen the step containing the field. */
  currentStep: number;
  onStepChange: (index: number) => void;
  review: ReactNode;
  /** Prevent navigation during uploads without locking the upload widget itself. */
  navigationDisabled?: boolean;
}

/** Long forms: validate each section, preserve parent-owned data, then review before committing. */
export default function SteppedFormPage({
  steps,
  currentStep,
  onStepChange,
  review,
  navigationDisabled = false,
  submitting = false,
  onSubmit,
  onCancel,
  submitLabel,
  ...props
}: SteppedFormPageProps) {
  const headingId = useId();
  const body = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const allSteps = [
    ...steps,
    { id: "review", label: "Review", description: "Check before submitting" },
  ];
  const current = allSteps[currentStep];
  const last = currentStep === steps.length;
  const blocked = submitting || navigationDisabled;

  const previousStep = useRef(currentStep);
  useLayoutEffect(() => {
    if (previousStep.current === currentStep) return;
    previousStep.current = currentStep;
    body.current?.focus({ preventScroll: true });
    body.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  }, [currentStep]);

  const move = (index: number) => onStepChange(index);

  const validate = (index: number) => {
    const valid = steps[index].validate?.() ?? true;
    if (!valid)
      setCompleted((ids) =>
        ids.filter((id) => steps.findIndex((s) => s.id === id) < index)
      );
    return valid;
  };

  const navigate = (target: number) => {
    if (blocked || target === currentStep) return;
    if (target < currentStep) {
      move(target);
      return;
    }
    for (let i = currentStep; i < target; i += 1) {
      if (!validate(i)) {
        if (i !== currentStep) move(i);
        return;
      }
    }
    setCompleted((ids) =>
      Array.from(new Set([...ids, ...steps.slice(0, target).map((s) => s.id)]))
    );
    move(target);
  };

  const advance = async () => {
    if (blocked) return;
    if (!last) {
      navigate(currentStep + 1);
      return;
    }
    // Earlier fields may have changed after a visit to Review.
    for (let i = 0; i < steps.length; i += 1) {
      if (!validate(i)) {
        if (i !== currentStep) move(i);
        return;
      }
    }
    await onSubmit();
  };

  return (
    <FormPage
      {...props}
      onSubmit={advance}
      onCancel={() => {
        if (blocked) return;
        if (currentStep > 0) navigate(currentStep - 1);
        else onCancel();
      }}
      cancelLabel={currentStep > 0 ? "Back" : "Cancel"}
      cancelDisabled={navigationDisabled}
      submitLabel={last ? submitLabel : "Continue"}
      submitting={submitting}
      submitDisabled={navigationDisabled}
    >
      <StepIndicator
        steps={allSteps}
        currentId={current.id}
        completedIds={completed}
        onStepClick={
          blocked
            ? undefined
            : (id) => navigate(allSteps.findIndex((s) => s.id === id))
        }
      />
      <div
        ref={body}
        tabIndex={-1}
        aria-labelledby={headingId}
        className="scroll-mt-24 outline-none"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id={headingId}
              className="text-ub-heading-sm text-ub-text-primary"
            >
              {current.label}
            </h2>
            <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
              {current.description}
            </p>
          </div>
          {currentStep > 0 && (
            <TextButton onClick={onCancel} disabled={blocked} size="sm">
              Cancel
            </TextButton>
          )}
        </div>
        {last ? review : steps[currentStep].content}
      </div>
    </FormPage>
  );
}
