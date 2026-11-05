"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  GraduationCap,
  MapPin,
  Pencil,
} from "lucide-react";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Tag from "components/ub/data/badges/Tag";
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
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : MICRO_DURATION, ease: EASE }}
      className="mx-auto w-full min-w-0 max-w-7xl space-y-5 break-words pb-6"
    >
      <header className="overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface shadow-ub-xs">
        <div className="h-1.5 bg-ub-action-primary" />
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-ub-md border border-ub-border bg-ub-tone-brand-bg">
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
                <p className="text-ub-label-sm text-ub-text-tertiary">
                  University profile
                </p>
                <h2 className="mt-1 text-ub-heading-xl-mobile text-ub-text-primary sm:text-ub-heading-xl">
                  {university.name}
                </h2>
                <p className="mt-1 flex items-center gap-1 text-ub-body-sm text-ub-text-secondary">
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
          <div className="flex flex-wrap gap-2">
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
        </div>
      </header>
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          <SectionCard title="About the university" as="h2">
            {university.description ? (
              <RichTextDisplay html={university.description} />
            ) : (
              <p className="text-ub-body-sm text-ub-text-secondary">
                An overview is not available yet.
              </p>
            )}
          </SectionCard>
          <SectionCard
            title="Campuses & branches"
            as="h2"
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
          </SectionCard>
          {canManage && (
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
                      <Tag hue={payment.is_active ? "teal" : "grey"} size="sm">
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
          )}
        </div>
        <aside
          aria-labelledby={`${id}-intakes`}
          className="order-first min-w-0 space-y-4 xl:sticky xl:top-24 xl:order-none"
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
              <LinkBtn
                href={basePath}
                label="Back to universities"
                variant="secondary"
                icon={<ArrowLeft className="h-4 w-4" />}
              />
            </div>
          </SectionCard>
        </aside>
      </div>
    </motion.div>
  );
}
