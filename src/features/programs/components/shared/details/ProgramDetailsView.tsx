"use client";

import { useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import {
  Award,
  Building2,
  CalendarDays,
  Check,
  Copy,
  FileText,
  GraduationCap,
  MapPin,
} from "lucide-react";
import type {
  Program,
  Commission,
  ExchangeRate,
} from "features/programs/types";
import { getIeltsLabel } from "constants/lists";
import { courseTypeLabel } from "features/programs/utils/courseType";
import { monthLabel } from "features/programs/utils/intakeMonths";
import {
  formatFeeAmount,
  formatMoney,
  getCurrencyOptions,
} from "features/programs/utils/exchangeRate";
import CurrencyButton from "components/ub/core/buttons/CurrencyButton";
import IntakeMonthsChips from "../IntakeMonthsChips";
import PresignedImage from "components/ub/data/media/PresignedImage";
import RichTextDisplay from "components/ub/data/display/RichTextDisplay";
import Button from "components/ub/core/buttons/Button";
import Tag from "components/ub/data/badges/Tag";
import { focusRing } from "components/ub/recipes";

export interface ProgramDocument {
  id: string;
  type: string;
  description: string;
  is_required_for_init: boolean | null;
  is_required_init_app_doc: boolean;
}

interface Props {
  program: Program;
  commission: Commission | null;
  requiredDocuments: ProgramDocument[];
  exchangeRates: ExchangeRate[];
  hidden?: boolean;
  managementActions?: ReactNode;
  /** Trail above the title, e.g. Programs › Bachelor of Computer Science. */
  breadcrumbs?: ReactNode;
  actions: ReactNode;
  onCopyError?: () => void;
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : MICRO_DURATION, ease: EASE, delay: reducedMotion ? 0 : 0.08 }}
      tabIndex={-1}
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 rounded-ub-lg border border-ub-border bg-ub-surface p-5 shadow-ub-xs focus:outline-none sm:p-6"
    >
      <h2
        id={`${id}-title`}
        className="text-ub-heading-md text-ub-text-primary"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
          {description}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

export default function ProgramDetailsView({
  program,
  commission,
  requiredDocuments,
  exchangeRates,
  hidden,
  managementActions,
  breadcrumbs,
  actions,
  onCopyError,
}: Props) {
  const prefix = useId();
  const reducedMotion = useReducedMotion();
  const [currency, setCurrency] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fee = (amount: number | string, source?: string | null) =>
    formatFeeAmount(amount, source, currency, exchangeRates);
  const required = requiredDocuments.filter(
    (doc) => doc.is_required_for_init ?? doc.is_required_init_app_doc
  );
  const optional = requiredDocuments.filter(
    (doc) => !(doc.is_required_for_init ?? doc.is_required_init_app_doc)
  );
  const sections = [
    "Overview",
    "Fees",
    ...(program.has_scholarship && program.scholarships.length
      ? ["Scholarships"]
      : []),
    "Documents",
  ];
  const sectionId = (name: string) => `${prefix}-${name.toLowerCase()}`;
  const copyFees = async () => {
    const text = [
      program.university.name,
      program.name,
      `Duration: ${program.duration ?? "To be confirmed"} years`,
      `English requirement: ${
        program.english_required_score
          ? `IELTS ${getIeltsLabel(program.english_required_score)}`
          : "To be confirmed"
      }`,
      `Intakes: ${
        (program.intake_months ?? [])
          .map((month) => monthLabel(month))
          .join(" / ") || "To be confirmed"
      }`,
      "Course fees for international students",
      ...[...program.yearly_fees]
        .sort((a, b) => a.year - b.year)
        .map(
          (item) =>
            `Year ${item.year}: ${fee(item.fee, program.yearly_fee_currency)}`
        ),
      ...program.one_time_fees.map(
        (item) =>
          `${item.description || "Fee"}: ${fee(item.fee, item.currency)}`
      ),
      "University fees for this course exclude 6% tax (SST)",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      onCopyError?.();
    }
  };
  const facts = [
    ["Qualification", program.qualification_level],
    ["Field of study", program.field_of_study?.name],
    [
      "Course type",
      program.course_type ? courseTypeLabel(program.course_type) : null,
    ],
    [
      "Study mode",
      program.is_on_campus && program.is_online
        ? "On campus & online"
        : program.class_type === "online" || program.is_online
        ? "Online"
        : program.is_on_campus
        ? "On campus"
        : null,
    ],
    ["Campus", program.branch?.name],
    ["Country", program.university.country],
    ["Location", program.branch?.state],
    [
      "English requirement",
      program.english_required_score
        ? `IELTS ${getIeltsLabel(program.english_required_score)}`
        : null,
    ],
  ];

  return (
    <motion.div
      key={program.id}
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : MICRO_DURATION, ease: EASE }}
      className="mx-auto w-full min-w-0 max-w-7xl space-y-5 break-words pb-6"
    >
      <header className="overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs">
        <div className="h-1.5 bg-ub-action-primary" />
        <div className="p-5 sm:p-7">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:flex-wrap">
            <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:flex-1">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-ub-md border border-ub-border bg-ub-tone-brand-bg">
                <PresignedImage
                  fileKey={program.university.logo_file_key}
                  alt=""
                  className="h-full w-full object-contain"
                  fallback={
                    <Building2 className="h-6 w-6 text-ub-tone-brand-text" />
                  }
                />
              </div>
              <div className="min-w-0">
                <p className="text-ub-label-md text-ub-text-secondary">
                  {program.university.name}
                </p>
                <p className="mt-1 flex items-center gap-1 text-ub-body-sm text-ub-text-tertiary">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {[program.branch?.state, program.university.country]
                    .filter(Boolean)
                    .join(", ") || "Location to be confirmed"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {hidden && <Tag hue="amber">Hidden from catalogue</Tag>}
              <Tag hue={program.university.is_active ? "teal" : "grey"}>
                {program.university.is_active
                  ? "University active"
                  : "University inactive"}
              </Tag>
            </div>
          </div>
          {breadcrumbs}
          <div className="mt-5 flex flex-wrap gap-2">
            <Tag hue="indigo" className="capitalize">
              {program.qualification_level}
            </Tag>
            {program.has_scholarship && (
              <Tag hue="amber" icon={<Award className="h-3 w-3" />}>
                Scholarship available
              </Tag>
            )}
          </div>
          <h2 className="mt-3 max-w-4xl text-ub-heading-xl-mobile text-ub-text-primary sm:text-ub-heading-xl">
            {program.name}
          </h2>
          {managementActions && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-ub-border pt-4">
              {managementActions}
            </div>
          )}
        </div>
        <nav
          aria-label="Program sections"
          className="flex gap-1 overflow-x-auto overscroll-x-contain border-t border-ub-border px-4 py-2"
        >
          {sections.map((section) => (
            <a
              key={section}
              href={`#${sectionId(section)}`}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                const target = document.getElementById(sectionId(section));
                if (!target) return;
                event.preventDefault();
                window.history.pushState(window.history.state, "", `#${sectionId(section)}`);
                target.focus({ preventScroll: true });
                target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
              }}
              className={`shrink-0 rounded-ub-full transition-colors duration-200 motion-reduce:transition-none px-4 py-2 text-ub-label-md text-ub-text-secondary hover:bg-ub-action-ghost-hover hover:text-ub-text-link ${focusRing}`}
            >
              {section}
            </a>
          ))}
        </nav>
      </header>

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Section
            id={sectionId("Overview")}
            title="Program overview"
            description="Study details and entry requirements at a glance."
          >
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-ub-label-sm text-ub-text-tertiary">
                    {label}
                  </dt>
                  <dd className="mt-1 text-ub-label-md capitalize text-ub-text-primary">
                    {value || "To be confirmed"}
                  </dd>
                </div>
              ))}
            </dl>
            {program.overview && (
              <div className="mt-6 border-t border-ub-border pt-5">
                <RichTextDisplay html={program.overview} />
              </div>
            )}
            {program.curriculum && (
              <div className="mt-6 border-t border-ub-border pt-5">
                <h3 className="mb-3 text-ub-heading-sm text-ub-text-primary">
                  Curriculum
                </h3>
                <RichTextDisplay html={program.curriculum} />
              </div>
            )}
          </Section>

          <Section
            id={sectionId("Fees")}
            title="Tuition & fees"
            description="Yearly tuition and one-time fees for international students."
          >
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <CurrencyButton
                value={currency}
                options={getCurrencyOptions(exchangeRates)}
                onChange={(value) => {
                  setCurrency(value);
                  setCopied(false);
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={copyFees}
                icon={
                  copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )
                }
                text={copied ? "Copied" : "Copy fee summary"}
              />
              <span role="status" className="sr-only">
                {copied ? "Fee summary copied to clipboard" : ""}
              </span>
            </div>
            <div className="space-y-5">
              {[
                {
                  title: "Yearly tuition",
                  rows: [...program.yearly_fees]
                    .sort((a, b) => a.year - b.year)
                    .map((item) => ({
                      label: `Year ${item.year}`,
                      amount: fee(item.fee, program.yearly_fee_currency),
                    })),
                },
                {
                  title: "Other fees",
                  rows: program.one_time_fees.map((item) => ({
                    label: item.description || "Fee",
                    amount: fee(item.fee, item.currency),
                  })),
                },
              ].map((group) => (
                <div
                  key={group.title}
                  className="overflow-hidden rounded-ub-md border border-ub-border"
                >
                  <h3 className="bg-ub-surface-subtle px-4 py-3 text-ub-label-md text-ub-text-primary">
                    {group.title}
                  </h3>
                  <dl className="divide-y divide-ub-border">
                    {group.rows.length ? (
                      group.rows.map((row, index) => (
                        <div
                          key={index}
                          className="flex flex-wrap justify-between gap-3 px-4 py-3 text-ub-body-sm"
                        >
                          <dt className="text-ub-text-secondary">
                            {row.label}
                          </dt>
                          <dd className="ub-tabular font-medium text-ub-text-primary">
                            {row.amount}
                          </dd>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-ub-body-sm text-ub-text-tertiary">
                        No fees available. Contact the university for details.
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </Section>

          {program.has_scholarship && program.scholarships.length > 0 && (
            <Section
              id={sectionId("Scholarships")}
              title="Scholarships & discounts"
              description={`${program.scholarships.length} available for this program.`}
            >
              <div className="flex snap-x gap-4 overflow-x-auto overscroll-x-contain pb-2">
                {program.scholarships.map((item, index) => (
                  <article
                    key={item.id || index}
                    className="w-80 max-w-full shrink-0 snap-start rounded-ub-md border border-ub-tag-amber-border bg-ub-tag-amber-bg p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-ub-heading-sm text-ub-text-primary">
                        {item.name}
                      </h3>
                      {item.coverage_percent > 0 && (
                        <Tag hue="amber">{item.coverage_percent}%</Tag>
                      )}
                    </div>
                    {item.description && (
                      <div className="mt-3">
                        <RichTextDisplay html={item.description} />
                      </div>
                    )}
                    {item.max_amount > 0 && (
                      <p className="mt-3 text-ub-label-md text-ub-tag-amber-text">
                        Up to{" "}
                        {formatMoney(item.max_amount, currency, exchangeRates)}
                      </p>
                    )}
                    {!!item.conditions?.length && (
                      <div className="mt-4 border-t border-ub-tag-amber-border pt-3">
                        <p className="text-ub-label-sm text-ub-text-secondary">
                          Conditions
                        </p>
                        <ul className="mt-2 list-disc space-y-2 pl-4 text-ub-body-sm text-ub-text-secondary">
                          {item.conditions.map((condition, i) => (
                            <li key={i}>{condition}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </Section>
          )}

          <Section
            id={sectionId("Documents")}
            title="Application documents"
            description="Prepare these documents before starting an application."
          >
            <div className="space-y-3">
              {!requiredDocuments.length && (
                <p className="text-ub-body-sm text-ub-text-secondary">
                  No documents configured for this program.
                </p>
              )}
              {required.map((doc) => (
                <DocumentRow key={doc.id} document={doc} required />
              ))}
              {optional.length > 0 && (
                <details className="rounded-ub-md border border-ub-border p-4">
                  <summary
                    className={`cursor-pointer rounded-ub-xs text-ub-label-md text-ub-text-secondary ${focusRing}`}
                  >
                    Optional documents ({optional.length})
                  </summary>
                  <div className="mt-4 space-y-3">
                    {optional.map((doc) => (
                      <DocumentRow key={doc.id} document={doc} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          </Section>
        </div>

        <aside
          aria-label="Program summary"
          className="order-first min-w-0 space-y-4 xl:sticky xl:top-24 xl:order-none"
        >
          {commission?.amount != null && (
            <section
              aria-label="Your commission"
              className="rounded-ub-lg border border-ub-tone-success-border bg-ub-tone-success-bg p-5"
            >
              <p className="text-ub-label-sm text-ub-tone-success-text">
                Your commission
              </p>
              <p className="ub-tabular mt-2 text-ub-heading-xl-mobile text-ub-tone-success-text sm:text-ub-heading-xl">
                {fee(commission.amount, commission.currency)}
              </p>
              {(commission.expected_commission_from ||
                commission.expected_commission_to) && (
                <p className="mt-3 text-ub-body-sm text-ub-tone-success-text">
                  {commission.expected_commission_from &&
                  commission.expected_commission_to
                    ? `Within ${commission.expected_commission_from}–${commission.expected_commission_to} months after enrollment`
                    : commission.expected_commission_from
                    ? `From ${commission.expected_commission_from} months after enrollment`
                    : `Up to ${commission.expected_commission_to} months after enrollment`}
                </p>
              )}
              {commission.notes && (
                <p className="mt-3 border-t border-ub-tone-success-border pt-3 text-ub-body-sm text-ub-tone-success-text">
                  {commission.notes}
                </p>
              )}
            </section>
          )}
          <div className="rounded-ub-lg border border-ub-border bg-ub-surface p-5 shadow-ub-xs">
            <p className="flex items-center gap-2 text-ub-label-sm text-ub-text-tertiary">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              First-year tuition
            </p>
            <p className="ub-tabular mt-2 text-ub-heading-xl-mobile text-ub-text-primary">
              {program.first_year_tuition != null
                ? fee(program.first_year_tuition, program.yearly_fee_currency)
                : "Fees on request"}
            </p>
            <dl className="mt-5 border-y border-ub-border py-4">
              <dt className="text-ub-label-sm text-ub-text-tertiary">
                Duration
              </dt>
              <dd className="mt-1 text-ub-label-md text-ub-text-primary">
                {program.duration != null
                  ? `${program.duration} ${
                      program.duration === 1 ? "year" : "years"
                    }`
                  : "To be confirmed"}
              </dd>
            </dl>
            <div className="py-4">
              <p className="mb-2 flex items-center gap-2 text-ub-label-sm text-ub-text-tertiary">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Upcoming intakes
              </p>
              {program.intake_months?.length ? (
                <IntakeMonthsChips months={program.intake_months} />
              ) : (
                <p className="text-ub-body-sm text-ub-text-secondary">
                  Dates to be confirmed
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 border-t border-ub-border pt-4">
              {actions}
            </div>
          </div>

        </aside>
      </div>
    </motion.div>
  );
}

function DocumentRow({
  document,
  required = false,
}: {
  document: ProgramDocument;
  required?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start gap-3 rounded-ub-md border border-ub-border p-3 sm:flex-nowrap sm:p-4">
      <FileText
        className="mt-0.5 h-5 w-5 shrink-0 text-ub-icon"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-ub-label-md text-ub-text-primary">{document.type}</p>
        {document.description && (
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
            {document.description}
          </p>
        )}
      </div>
      <Tag hue={required ? "amber" : "grey"} size="sm">
        {required ? "Required" : "Optional"}
      </Tag>
    </div>
  );
}
