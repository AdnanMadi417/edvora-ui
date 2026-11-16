"use client";

import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import { useId } from "react";
import UniversityLanguageCenters from "features/universities/language-centers/UniversityLanguageCenters";
import { focusRing } from "components/ub/recipes";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Building2,
  GraduationCap,
  MapPin,
  Pencil,
} from "lucide-react";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Tag from "components/ub/data/badges/Tag";
import DetailsSection from "components/ub/data/cards/DetailsSection";
import SectionCard from "components/ub/data/cards/SectionCard";
import PresignedImage from "components/ub/data/media/PresignedImage";
import RichTextDisplay from "components/ub/data/display/RichTextDisplay";
import IntakeMonthsChips from "features/programs/components/shared/IntakeMonthsChips";
import type {
  UniversityDetails,
  Branch,
  UniversityPaymentMethod,
} from "features/universities/types";

interface Props {
  university: UniversityDetails;
  branches: Branch[];
  basePath: string;
  canManage?: boolean;
  paymentMethods?: UniversityPaymentMethod[];
  paymentsLoading?: boolean;
  paymentsError?: string | null;
  onRetryPayments?: () => void;
}
export default function UniversityProfileView({
  university,
  branches,
  basePath,
  canManage,
  paymentMethods = [],
  paymentsLoading,
  paymentsError,
  onRetryPayments,
}: Props) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const rolePath = basePath.replace(/\/universities$/, "");
  const sections = [
    { key: "overview", label: "Overview" },
    { key: "campuses", label: "Campuses" },
    { key: "language-centers", label: "Language Centers" },
    ...(canManage ? [{ key: "payments", label: "Payment methods" }] : []),
  ];
  return (
    <motion.div
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
                  fileKey={university.logo_file_key}
                  alt=""
                  className="h-full w-full object-contain"
                  fallback={
                    <GraduationCap className="h-7 w-7 text-ub-tone-brand-text" />
                  }
                />
              </div>
              <div className="min-w-0">
                <p className="text-ub-label-md text-ub-text-secondary">
                  {university.name}
                </p>
                <p className="mt-1 flex items-center gap-1 text-ub-body-sm text-ub-text-tertiary">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {university.country || "Location to be confirmed"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag hue={university.is_active ? "teal" : "grey"}>
                {university.is_active ? "Active" : "Inactive"}
              </Tag>
              {canManage && university.is_hidden && (
                <Tag hue="amber">Hidden from catalogue</Tag>
              )}
            </div>
          </div>
          <Breadcrumbs
            items={[
              { label: "Universities", href: basePath },
              { label: university.name },
            ]}
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <Tag hue="indigo">
              {university.is_public
                ? "Public university"
                : "Private university"}
            </Tag>
            <Tag hue="sky">
              {university.university_type_name || "Type not configured"}
            </Tag>
            {university.has_language_center && (
              <Tag hue="teal">Language center available</Tag>
            )}
          </div>
          <h2 className="mt-3 max-w-4xl text-ub-heading-xl-mobile text-ub-text-primary sm:text-ub-heading-xl">
            {university.name}
          </h2>
        </div>
        <nav
          aria-label="University sections"
          className="flex gap-1 overflow-x-auto overscroll-x-contain border-t border-ub-border px-4 py-2"
        >
          {sections.map((section) => (
            <a
              key={section.key}
              href={`#${id}-${section.key}`}
              className={`shrink-0 rounded-ub-full px-4 py-2 text-ub-label-md text-ub-text-secondary transition-colors hover:bg-ub-action-ghost-hover hover:text-ub-text-link ${focusRing}`}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                const target = document.getElementById(`${id}-${section.key}`);
                if (!target) return;
                event.preventDefault();
                window.history.pushState(
                  window.history.state,
                  "",
                  `#${id}-${section.key}`
                );
                target.focus({ preventScroll: true });
                target.scrollIntoView({
                  behavior: reducedMotion ? "auto" : "smooth",
                  block: "start",
                });
              }}
            >
              {section.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <div
            id={`${id}-overview`}
            tabIndex={-1}
            className="scroll-mt-24 focus:outline-none"
          >
            <DetailsSection
              title="University overview"
              description="Institution details and study options at a glance."
            >
              <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                {[
                  [
                    "Institution type",
                    university.is_public
                      ? "Public university"
                      : "Private university",
                  ],
                  [
                    "University category",
                    university.university_type_name || "To be confirmed",
                  ],
                  ["Country", university.country || "To be confirmed"],
                  ["Campuses", String(branches.length)],
                  [
                    "Language center",
                    university.has_language_center
                      ? "Available"
                      : "Not available",
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-ub-label-sm text-ub-text-tertiary">
                      {label}
                    </dt>
                    <dd className="mt-1 text-ub-label-md text-ub-text-primary">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 border-t border-ub-border pt-5">
                {university.description ? (
                  <RichTextDisplay html={university.description} />
                ) : (
                  <p className="text-ub-body-sm text-ub-text-secondary">
                    An overview is not available yet.
                  </p>
                )}
              </div>
            </DetailsSection>
          </div>
          <div
            id={`${id}-campuses`}
            tabIndex={-1}
            className="scroll-mt-24 focus:outline-none"
          >
            <DetailsSection
              title="Campuses & branches"
              description={`${branches.length} ${
                branches.length === 1 ? "campus" : "campuses"
              }`}
            >
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                {branches.length ? (
                  branches.map((branch) => (
                    <article
                      key={branch.id}
                      className="min-w-0 rounded-ub-md border border-ub-border bg-ub-surface-subtle p-4"
                    >
                      <Building2
                        className="mb-3 h-5 w-5 text-ub-icon"
                        aria-hidden="true"
                      />
                      <h3 className="text-ub-heading-sm text-ub-text-primary">
                        {branch.name}
                      </h3>
                      <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
                        {[branch.location, branch.state]
                          .filter(Boolean)
                          .join(" · ") || "Location to be confirmed"}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-ub-body-sm text-ub-text-secondary">
                    No campuses configured yet.
                  </p>
                )}
              </div>
            </DetailsSection>
          </div>
          <div
            id={`${id}-language-centers`}
            tabIndex={-1}
            className="scroll-mt-24 focus:outline-none"
          >
            <UniversityLanguageCenters
              universityId={university.id}
              basePath={rolePath}
              canManage={canManage}
            />
          </div>
          {canManage && (
            <div
              id={`${id}-payments`}
              tabIndex={-1}
              className="scroll-mt-24 focus:outline-none"
            >
              <SectionCard
                title="Payment methods"
                as="h2"
                state={
                  paymentsLoading
                    ? "loading"
                    : paymentsError
                    ? "error"
                    : paymentMethods.length
                    ? "ready"
                    : "empty"
                }
                errorMessage={paymentsError || undefined}
                onRetry={onRetryPayments}
                empty={{ title: "No payment methods assigned" }}
              >
                <div className="space-y-3">
                  {paymentMethods.map((payment) => (
                    <article
                      key={payment.id}
                      className="rounded-ub-md border border-ub-border p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-ub-heading-sm text-ub-text-primary">
                          {payment.payment_method_name}
                        </h3>
                        <Tag
                          hue={payment.is_active ? "teal" : "grey"}
                          size="sm"
                        >
                          {payment.is_active ? "Active" : "Inactive"}
                        </Tag>
                      </div>
                      {payment.currency && (
                        <p className="mt-2 text-ub-label-sm text-ub-text-secondary">
                          Currency: {payment.currency}
                        </p>
                      )}
                      {payment.instructions && (
                        <div className="mt-3">
                          <RichTextDisplay html={payment.instructions} />
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}
        </div>
        <aside
          aria-labelledby={`${id}-intakes`}
          className="min-w-0 space-y-4 xl:sticky xl:top-24"
        >
          <SectionCard title="Upcoming intakes" as="h2">
            <div id={`${id}-intakes`} className="sr-only">
              University summary
            </div>
            {university.intake_months?.length ? (
              <IntakeMonthsChips months={university.intake_months} />
            ) : (
              <p className="text-ub-body-sm text-ub-text-secondary">
                Intake dates to be confirmed.
              </p>
            )}
            <div className="mt-5 flex flex-col gap-3 border-t border-ub-border pt-5">
              {canManage ? (
                <LinkBtn
                  href={`${basePath}/${university.id}/edit`}
                  label="Edit university"
                  variant="primary"
                  icon={<Pencil className="h-4 w-4" />}
                />
              ) : (
                <LinkBtn
                  href={`${rolePath}/knowledge-hub?university_id=${encodeURIComponent(
                    university.id
                  )}`}
                  label="Explore programs"
                  variant="primary"
                  icon={<BookOpen className="h-4 w-4" />}
                />
              )}
            </div>
          </SectionCard>
        </aside>
      </div>
    </motion.div>
  );
}
