"use client";

import { useId, type ReactNode } from "react";
import Link from "next/link";
import {
  Eye,
  GraduationCap,
  Languages,
  Lock,
  MapPin,
  MessageCircle,
} from "lucide-react";
import EntityCell from "components/ub/data/display/EntityCell";
import TableActions, { TableAction } from "components/ub/data/tables/TableActions";
import ProviderAvatar from "features/logistical-service/components/shared/ProviderAvatar";
import Tag from "components/ub/data/badges/Tag";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import { focusRing } from "components/ub/recipes";
import type { ServiceProvider } from "features/logistical-service/types";

const money = (value: number) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

function CardTextTooltip({
  content,
  href,
  children,
}: {
  content: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <Tooltip
      content={content}
      position="top"
      className="relative z-20 w-full min-w-0 [&_[role=tooltip]]:max-w-full"
    >
      <Link
        href={href}
        className={`block w-full min-w-0 rounded-ub-xs py-1 ${focusRing}`}
      >
        {children}
      </Link>
    </Tooltip>
  );
}

export default function LogisticsProviderCard({
  provider,
  href,
  locked = false,
}: {
  provider: ServiceProvider;
  href: string;
  locked?: boolean;
}) {
  const titleId = useId();
  const whatsapp = provider.whatsapp?.replace(/\D/g, "");
  return (
    <article
      aria-labelledby={titleId}
      className={`relative flex h-full min-w-0 flex-col rounded-ub-xl border border-ub-border bg-ub-surface transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none ${
        locked
          ? ""
          : "hover:z-30 focus-within:z-30 hover:border-ub-border-hover hover:shadow-ub-sm"
      }`}
    >
      {!locked && (
        // Pointer shortcut only: keyboard and screen-reader users get the View action.
        <Link
          href={href}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 z-10 rounded-ub-xl"
        />
      )}
      <div className="flex items-start justify-between gap-2 p-4 pb-0 sm:p-5 sm:pb-0">
        <h3 id={titleId} className="min-w-0 flex-1">
          {locked ? (
            <EntityCell
              name="Logistics provider"
              avatar={
                <span className="grid h-10 w-10 place-items-center rounded-ub-full bg-ub-surface-subtle text-ub-text-tertiary">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </span>
              }
              subtitle="Unlocks at Visa Processing"
            />
          ) : (
            <EntityCell
              name={provider.name}
              avatar={<ProviderAvatar provider={provider} />}
              status={{ status: provider.is_active }}
              subtitle={
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {provider.main_location || "Location not provided"}
                </span>
              }
            />
          )}
        </h3>
        {!locked && (
          <div className="relative z-20 -me-2 -mt-1 shrink-0">
            <TableActions label={provider.name}>
              <TableAction
                label={`View ${provider.name}`}
                icon={<Eye className="h-4 w-4" />}
                href={href}
                primary
              />
              {whatsapp && (
                <TableAction
                  label={`WhatsApp ${provider.name}`}
                  icon={<MessageCircle className="h-4 w-4" />}
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                />
              )}
            </TableActions>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5">
        <dl className="grid grid-cols-2 gap-3 rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-3.5">
          {[
            { label: "Single service", range: provider.services_price_range },
            { label: "Package", range: provider.packages_price_range },
          ].map(({ label, range }) => (
            <div key={label} className="min-w-0">
              <dt className="text-ub-caption text-ub-text-secondary">
                {label}
              </dt>
              <dd className="mt-1 break-words text-ub-label-md text-ub-text-primary">
                {locked ? (
                  "Unlock to view"
                ) : range ? (
                  <>
                    <span className="font-normal text-ub-text-secondary">
                      From{" "}
                    </span>
                    {money(range.min_price)}
                  </>
                ) : (
                  "Not listed"
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div className="space-y-2 sm:space-y-3">
          <p className="text-ub-caption font-medium uppercase tracking-wider text-ub-text-tertiary">
            Services offered
          </p>
          <div className="flex min-h-[28px] flex-wrap gap-2">
            {locked ? (
              <Tag hue="grey">Unlock to explore services</Tag>
            ) : provider.services_offered?.length ? (
              <CardTextTooltip
                href={href}
                content={provider.services_offered
                  .map((service) => service.name)
                  .join(" · ")}
              >
                <span className="flex flex-wrap gap-2">
                  {provider.services_offered.slice(0, 2).map((service) => (
                    <Tag key={service.id} hue="sky">
                      <span className="line-clamp-1 max-w-[200px] break-words">
                        {service.name}
                      </span>
                    </Tag>
                  ))}
                  {provider.services_offered.length > 2 && (
                    <Tag hue="grey">
                      +{provider.services_offered.length - 2} more
                    </Tag>
                  )}
                </span>
              </CardTextTooltip>
            ) : (
              <span className="text-ub-body-sm text-ub-text-secondary">
                No services listed.
              </span>
            )}
          </div>
        </div>
        <div className="space-y-2 border-t border-ub-border pt-3 text-ub-body-sm sm:space-y-2.5 sm:pt-4 text-ub-text-secondary">
          <p className="flex items-start gap-2">
            <Languages className="mt-0.5 h-4 w-4 shrink-0" />
            {locked ? (
              <span>Languages available after unlock</span>
            ) : (
              <CardTextTooltip
                href={href}
                content={
                  provider.languages?.join(" · ") || "Languages not provided"
                }
              >
                <span className="line-clamp-1 break-words">
                  {provider.languages?.join(" · ") || "Languages not provided"}
                </span>
              </CardTextTooltip>
            )}
          </p>
          <p className="flex items-start gap-2">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />
            {locked ? (
              <span>University coverage after unlock</span>
            ) : (
              <CardTextTooltip
                href={href}
                content={
                  provider.universities_served?.join(" · ") ||
                  "No universities listed"
                }
              >
                <span>
                  {provider.universities_served?.length || 0} universities
                  served
                </span>
              </CardTextTooltip>
            )}
          </p>
        </div>
      </div>
      {locked && (
        <footer className="border-t border-ub-border p-4 pt-3.5">
          <p className="flex min-h-[40px] items-center justify-center gap-2 rounded-ub-full bg-ub-surface-subtle text-ub-label-sm text-ub-text-secondary">
            <Lock className="h-4 w-4" />
            Contact locked
          </p>
        </footer>
      )}
    </article>
  );
}
