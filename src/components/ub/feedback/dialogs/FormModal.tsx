"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import { ConfirmDialog, OverlayCloseButton, OverlayPortal, OverlayScrim, useOverlay } from "components/ub/feedback/dialogs/Modal";

export type FormModalSize = "md" | "lg" | "xl";

/** md 560 · lg 720 · xl 960 (brief §4.7; xl for multi-section forms). */
const WIDTHS: Record<FormModalSize, string> = {
  md: "md:max-w-ub-form-sm",
  lg: "md:max-w-ub-form",
  xl: "md:max-w-ub-form-xl",
};

export interface FormModalError {
  /** id of the field to focus when the summary item is chosen. */
  fieldId: string;
  message: string;
}

export interface FormModalSection {
  id: string;
  label: string;
  /** Marks the section in the side nav, e.g. when it holds an error. */
  invalid?: boolean;
}

export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** 20px icon in a brand tile before the title. */
  icon?: LucideIcon;
  size?: FormModalSize;
  /** Runs on submit (button or Enter). Validate here; set `errors` to show the summary. */
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  /** Verb + object, e.g. "Add student". */
  submitLabel: string;
  submitIcon?: ReactNode;
  /** primary (default) · positive (approve) · destructive (reject/delete: allowed in dialogs that commit the action). */
  submitTone?: "primary" | "positive" | "destructive";
  submitting?: boolean;
  submitDisabled?: boolean;
  cancelLabel?: string;
  /** Start-side footer action, e.g. "Save draft" (secondary/tertiary). */
  secondaryAction?: ReactNode;
  /** Start-side footer note, e.g. "Saved 2 minutes ago". */
  footerNote?: ReactNode;
  /** Validation errors; shown as a summary at the top of the body, each linking to its field. */
  errors?: FormModalError[];
  /** Sections for the side nav (from lg up). Pair with <FormSection id> in the body. */
  sections?: FormModalSection[];
  /** Unsaved changes: closing asks "Discard changes?" first. */
  dirty?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Popup for long forms (brief §4.7, §9). Full-screen sheet below 768px,
 * centred panel above; the header and footer stay put while the body
 * scrolls. Focus is trapped, Esc closes (asking first when there are
 * unsaved changes), focus returns to the opener. On a failed submit the
 * error summary takes focus and links to each field.
 */
export default function FormModal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  size = "lg",
  onSubmit,
  submitLabel,
  submitIcon,
  submitTone = "primary",
  submitting = false,
  submitDisabled = false,
  cancelLabel = "Cancel",
  secondaryAction,
  footerNote,
  errors = [],
  sections,
  dirty = false,
  children,
  className,
}: FormModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [activeSection, setActiveSection] = useState(sections?.[0]?.id);
  const submitCount = useRef(0);

  const requestClose = () => {
    if (submitting) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  const { present, visible } = useOverlay({ open, onClose: requestClose, panelRef });

  // After a submit that produced errors, move focus to the summary so it's read out.
  const [lastSubmit, setLastSubmit] = useState(0);
  useEffect(() => {
    if (lastSubmit && errors.length) summaryRef.current?.focus();
  }, [lastSubmit, errors.length]);

  // Track the section in view for the side nav.
  useEffect(() => {
    const body = bodyRef.current;
    if (!present || !sections?.length || !body || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActiveSection(top.target.id);
      },
      { root: body, rootMargin: "0px 0px -60% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [present, sections]);

  if (!present) return null;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(e);
    submitCount.current += 1;
    setLastSubmit(submitCount.current);
  };

  const focusField = (fieldId: string) => {
    const el = document.getElementById(fieldId);
    el?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    el?.focus({ preventScroll: true });
  };

  const goToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView?.({ block: "start", behavior: "smooth" });
    setActiveSection(id);
    el?.querySelector<HTMLElement>("h3")?.focus({ preventScroll: true });
  };

  return (
    <OverlayPortal>
      <div className="fixed inset-0 z-[1000]">
        <OverlayScrim visible={visible} onClick={requestClose} />
        <div className="pointer-events-none fixed inset-0 flex items-stretch justify-center md:items-center md:p-6">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={clsx(
              // Full-screen sheet on mobile; the modal panel (radius 16, border, shadow) from 768px.
              "bg-ub-modal md:rounded-ub-xl md:border md:border-ub-border-overlay md:shadow-ub-xl",
              WIDTHS[size],
              "pointer-events-auto relative flex h-full w-full flex-col overflow-hidden outline-none md:h-auto md:max-h-full",
              "transition-[opacity,transform] duration-ub-slow motion-reduce:transform-none motion-reduce:duration-ub-fast",
              visible ? "translate-y-0 opacity-100 ease-ub-enter" : "translate-y-4 opacity-0 ease-ub-exit",
              className,
            )}
          >
            <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col" aria-busy={submitting || undefined}>
              <header className="flex items-start gap-3 border-b border-ub-border px-4 py-4 md:px-6">
                {Icon && (
                  <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h2 id={titleId} className="text-ub-heading-md text-ub-text-primary">
                    {title}
                  </h2>
                  {description && (
                    <p id={descId} className="mt-0.5 text-ub-body-sm text-ub-text-secondary">
                      {description}
                    </p>
                  )}
                </div>
                <div className="-me-2 -mt-1">
                  <OverlayCloseButton onClick={requestClose} label="Close dialog" />
                </div>
              </header>

              <div className="flex min-h-0 flex-1">
                {sections && sections.length > 1 && (
                  <nav aria-label="Form sections" className="hidden w-52 shrink-0 border-e border-ub-border p-4 lg:block">
                    <ol className="grid gap-1">
                      {sections.map((s, i) => {
                        const current = activeSection === s.id;
                        return (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => goToSection(s.id)}
                              aria-current={current ? "step" : undefined}
                              className={clsx(
                                "flex w-full items-center gap-2 rounded-ub-md border-s-2 px-3 py-2 text-start text-ub-label-md transition-colors duration-ub-fast motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus",
                                current ? "border-ub-border-focus bg-ub-selected text-ub-text-selected" : "border-transparent text-ub-text-secondary hover:bg-ub-nav-hover hover:text-ub-text-primary",
                              )}
                            >
                              <span className="ub-tabular text-ub-caption text-ub-text-tertiary">{i + 1}</span>
                              <span className="min-w-0 flex-1 truncate">{s.label}</span>
                              {s.invalid && <CircleAlert className="h-4 w-4 shrink-0 text-ub-tone-danger-text" aria-label="Has errors" />}
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </nav>
                )}

                <div ref={bodyRef} className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-6">
                  {errors.length > 0 && (
                    <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby={`${titleId}-errors`} className="mb-6 rounded-ub-md border border-ub-tone-danger-border bg-ub-tone-danger-bg p-4 outline-none focus-visible:ring-2 focus-visible:ring-ub-border-focus">
                      <p id={`${titleId}-errors`} className="flex items-center gap-2 text-ub-label-md text-ub-tone-danger-text">
                        <CircleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {errors.length === 1 ? "Fix 1 field to continue" : `Fix ${errors.length} fields to continue`}
                      </p>
                      <ul className="mt-2 grid gap-1 ps-7">
                        {errors.map((err) => (
                          <li key={err.fieldId}>
                            <button type="button" onClick={() => focusField(err.fieldId)} className="text-start text-ub-body-sm text-ub-tone-danger-text underline underline-offset-2 hover:no-underline">
                              {err.message}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid gap-8">{children}</div>
                </div>
              </div>

              <footer className="flex flex-col gap-2 border-t border-ub-border px-4 py-3 sm:flex-row sm:items-center sm:gap-3 md:px-6">
                {(secondaryAction || footerNote) && (
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {secondaryAction}
                    {footerNote && <p className="min-w-0 truncate text-ub-caption text-ub-text-tertiary">{footerNote}</p>}
                  </div>
                )}
                {/* Cancel then the Primary, side by side even on mobile (Primary last, brief §4.7). */}
                <div className="grid grid-cols-2 gap-2 sm:ms-auto sm:flex">
                  <Button variant="secondary" text={cancelLabel} onClick={requestClose} disabled={submitting} />
                  <Button type="submit" variant={submitTone} text={submitLabel} icon={submitIcon} loading={submitting} disabled={submitDisabled} />
                </div>
              </footer>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
        tone="danger"
        title="Discard changes?"
        consequence="What you've entered in this form will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
      />
    </OverlayPortal>
  );
}

export interface FormSectionProps {
  /** Anchor for the FormModal side nav. */
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** Field columns from 576px up. Default 2. */
  columns?: 1 | 2;
  children: ReactNode;
}

/** A titled group of fields inside FormModal (or any long form). Use fullWidth wrappers with sm:col-span-2. */
export function FormSection({ id, title, description, columns = 2, children }: FormSectionProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-4">
      <h3 id={headingId} tabIndex={-1} className="text-ub-heading-sm text-ub-text-primary outline-none">
        {title}
      </h3>
      {description && <p className="mt-1 text-ub-body-sm text-ub-text-secondary">{description}</p>}
      <div className={clsx("mt-4 grid gap-x-4 gap-y-1", columns === 2 && "sm:grid-cols-2")}>{children}</div>
    </section>
  );
}
