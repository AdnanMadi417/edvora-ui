"use client";

import { useId, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { formContainer } from "components/ub/recipes";
import Button from "components/ub/core/buttons/Button";

export interface FormPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onSubmit: () => void | Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
  cancelDisabled?: boolean;
  submitting?: boolean;
  submitDisabled?: boolean;
  /** Loading/error pages can keep their header without exposing submit actions. */
  showActions?: boolean;
  children: ReactNode;
  className?: string;
  /** Keep form actions reachable while scrolling a long form. */
  stickyActions?: boolean;
}

/** Single-page counterpart to ApplicationFormView: shared header, body and action footer. */
export default function FormPage({
  title,
  description,
  icon: Icon,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "Cancel",
  cancelDisabled = false,
  submitting = false,
  submitDisabled = false,
  showActions = true,
  children,
  className,
  stickyActions = false,
}: FormPageProps) {
  const titleId = useId();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!showActions || submitting || submitDisabled) return;
    void onSubmit();
  };

  return (
    <section
      aria-labelledby={titleId}
      className={clsx(formContainer, "mt-5 w-full", className)}
    >
      <header className="flex items-start gap-3 border-b border-ub-border px-4 py-4 md:px-6 md:py-5">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 id={titleId} className="text-ub-heading-md text-ub-text-primary">
            {title}
          </h1>
          <p className="mt-0.5 text-ub-body-sm text-ub-text-secondary">
            {description}
          </p>
        </div>
      </header>
      <form onSubmit={submit} noValidate aria-busy={submitting || undefined}>
        <fieldset
          disabled={submitting}
          className="min-w-0 space-y-8 px-4 py-6 md:px-6"
        >
          {children}
        </fieldset>
        {showActions && (
          <footer className={clsx("flex flex-col gap-3 border-t border-ub-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6", stickyActions && "sticky bottom-16 z-20 bg-ub-surface-raised shadow-ub-sm md:bottom-4")}>
            <p className="text-ub-caption text-ub-text-tertiary">
              Optional fields are marked.
            </p>
            <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 sm:flex">
              <Button
                variant="secondary"
                text={cancelLabel}
                onClick={onCancel}
                disabled={submitting || cancelDisabled}
              />
              <Button
                type="submit"
                variant="primary"
                text={submitLabel}
                loading={submitting}
                disabled={submitDisabled}
              />
            </div>
          </footer>
        )}
      </form>
    </section>
  );
}
