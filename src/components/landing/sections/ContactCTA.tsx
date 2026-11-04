"use client";

import { useState } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { CalendarClock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import clsx from "clsx";
import { contact, site } from "lib/content";
import { contactSchema, type ContactInput } from "lib/contactSchema";
import { submitContact } from "app/landing-template/actions";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button, { ButtonLink } from "../ui/Button";
import Card from "../ui/Card";

// Minimal zod resolver (avoids @hookform/resolvers, whose current types need TS 5).
const contactResolver: Resolver<ContactInput> = async (values) => {
  const parsed = contactSchema.safeParse(values);
  if (parsed.success) return { values: parsed.data, errors: {} };
  const errors: FieldErrors<ContactInput> = {};
  for (const issue of parsed.error.issues) {
    const name = issue.path[0] as keyof ContactInput;
    if (!errors[name]) errors[name] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors };
};

const fieldBase =
  "w-full rounded-ub-md border bg-ub-surface px-3 text-ub-body-md text-ub-text-primary placeholder:text-ub-text-tertiary transition-colors duration-ub-fast " +
  "hover:border-ub-border-control-hover focus:border-ub-border-focus focus:outline-none focus:ring-1 focus:ring-ub-border-focus";

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-ub-label-md text-ub-text-primary">
        {label}
        {optional && <span className="text-ub-text-secondary"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-ub-body-sm text-ub-tag-red-text-dark">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactCTA() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: contactResolver, defaultValues: { name: "", email: "", company: "", details: "" } });

  const onSubmit = async (values: ContactInput) => {
    setServerError(null);
    const result = await submitContact(values);
    // tsconfig isn't strict, so narrow with `in` rather than on `ok`.
    if ("error" in result) {
      setStatus("error");
      setServerError(result.error);
    } else {
      setStatus("sent");
      reset();
    }
  };

  const describedBy = (name: keyof ContactInput) => (errors[name] ? `contact-${name}-error` : undefined);
  const control = (name: keyof ContactInput) => clsx(fieldBase, errors[name] ? "border-ub-danger-500" : "border-ub-border-control");

  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-16 py-24 md:py-32">
      <Container>
        <SectionHeading id="contact-heading" eyebrow={contact.eyebrow} heading={contact.heading} subheading={contact.subheading} />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card innerClassName="p-6 md:p-8">
            {status === "sent" ? (
              <div role="status" aria-live="polite" className="flex flex-col items-start gap-4 py-8">
                <CheckCircle2 className="h-8 w-8 text-ub-success-500" aria-hidden />
                <p className="text-ub-heading-md text-ub-text-primary">Message sent</p>
                <p className="max-w-ub-reading text-ub-body-md text-ub-text-secondary">{contact.success}</p>
                <Button variant="ghost" onClick={() => setStatus("idle")}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
                <Field id="contact-name" label="Name" error={errors.name?.message}>
                  <input id="contact-name" autoComplete="name" className={clsx(control("name"), "h-12 md:h-10")} aria-invalid={!!errors.name} aria-describedby={describedBy("name")} {...register("name")} />
                </Field>
                <Field id="contact-email" label="Work email" error={errors.email?.message}>
                  <input id="contact-email" type="email" autoComplete="email" className={clsx(control("email"), "h-12 md:h-10")} aria-invalid={!!errors.email} aria-describedby={describedBy("email")} {...register("email")} />
                </Field>
                <Field id="contact-company" label="Company" optional error={errors.company?.message}>
                  <input id="contact-company" autoComplete="organization" className={clsx(control("company"), "h-12 md:h-10")} aria-invalid={!!errors.company} aria-describedby={describedBy("company")} {...register("company")} />
                </Field>
                <Field id="contact-budget" label="Budget range" error={errors.budget?.message}>
                  <select id="contact-budget" defaultValue="" className={clsx(control("budget"), "h-12 md:h-10")} aria-invalid={!!errors.budget} aria-describedby={describedBy("budget")} {...register("budget")}>
                    <option value="" disabled>
                      Select a range
                    </option>
                    {contact.budgets.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field id="contact-details" label="Project details" error={errors.details?.message}>
                    <textarea
                      id="contact-details"
                      rows={5}
                      placeholder="What are you building, who is it for, and when do you need it?"
                      className={clsx(control("details"), "py-2.5")}
                      aria-invalid={!!errors.details}
                      aria-describedby={describedBy("details")}
                      {...register("details")}
                    />
                  </Field>
                </div>
                {serverError && (
                  <p role="alert" className="text-ub-body-sm text-ub-tag-red-text-dark sm:col-span-2">
                    {serverError}
                  </p>
                )}
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" disabled={isSubmitting} icon={isSubmitting ? <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden /> : undefined}>
                    {isSubmitting ? "Sending message" : "Send message"}
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <Card notch innerClassName="flex flex-col p-6 md:p-8">
            <CalendarClock className="h-8 w-8 text-ub-icon-interactive" aria-hidden />
            <h3 className="mt-6 text-ub-heading-md text-ub-text-primary">{contact.call.title}</h3>
            <p className="mt-2 text-ub-body-md text-ub-text-secondary">{contact.call.description}</p>
            {site.calendlyUrl ? (
              <iframe src={site.calendlyUrl} title={contact.call.title} loading="lazy" className="mt-6 h-[480px] w-full flex-1 rounded-ub-lg border border-ub-border" />
            ) : (
              <div className="mt-6 flex flex-1 flex-col justify-end gap-3">
                <p className="rounded-ub-lg border border-dashed border-ub-border p-4 text-ub-body-sm text-ub-text-secondary">
                  Calendar embed goes here. Set site.calendlyUrl in lib/content.ts.
                </p>
                <ButtonLink href={`mailto:${site.email}`} variant="ghost">
                  {contact.call.cta}
                </ButtonLink>
              </div>
            )}
          </Card>
        </div>
      </Container>
    </section>
  );
}
