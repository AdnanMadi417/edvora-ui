"use client";

import { useId, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  GraduationCap,
  Languages,
  Lock,
  MapPin,
  MessageCircle,
  Truck,
} from "lucide-react";
import PresignedImage from "components/ub/data/media/PresignedImage";
import Tag from "components/ub/data/badges/Tag";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
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
        <Link
          href={href}
          aria-label={`View ${provider.name}`}
          className={`absolute inset-0 z-10 rounded-ub-xl ${focusRing}`}
        />
      )}
      <div className="flex items-start justify-between gap-3 p-5 pb-0">
        <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-ub-lg border border-ub-border bg-ub-tone-brand-bg text-ub-tone-brand-text">
          <PresignedImage
            fileKey={locked ? undefined : provider.picture_file_key}
            alt=""
            className="h-full w-full object-cover"
            fallback={
              locked ? (
                <Lock className="h-6 w-6" />
              ) : (
                <Truck className="h-6 w-6" />
              )
            }
          />
        </span>
        <Tag
          hue={locked ? "grey" : provider.is_active ? "teal" : "grey"}
          size="sm"
        >
          {locked
            ? "Stage required"
            : provider.is_active
            ? "Active"
            : "Inactive"}
        </Tag>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h3 id={titleId} className="text-ub-heading-md text-ub-text-primary">
            {locked ? (
              "Logistics provider"
            ) : (
              <CardTextTooltip href={href} content={provider.name}>
                <span className="line-clamp-2 break-words">
                  {provider.name}
                </span>
              </CardTextTooltip>
            )}
          </h3>
          <p className="flex min-w-0 items-start gap-1.5 text-ub-body-sm text-ub-text-secondary">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {locked ? (
              <span>Provider details unlock with access</span>
            ) : (
              <CardTextTooltip
                href={href}
                content={provider.main_location || "Location not provided"}
              >
                <span className="line-clamp-1 break-words">
                  {provider.main_location || "Location not provided"}
                </span>
              </CardTextTooltip>
            )}
          </p>
        </div>
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
        <div className="space-y-3">
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
        <div className="space-y-2.5 border-t border-ub-border pt-4 text-ub-body-sm text-ub-text-secondary">
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
      <footer className="border-t border-ub-border p-4 pt-3.5">
        {locked ? (
          <p className="flex min-h-[40px] items-center justify-center gap-2 rounded-ub-full bg-ub-surface-subtle text-ub-label-sm text-ub-text-secondary">
            <Lock className="h-4 w-4" />
            Contact locked
          </p>
        ) : (
          <div className="relative z-20 grid grid-cols-2 gap-2">
            <LinkBtn
              href={href}
              label="Details"
              variant="secondary"
              icon={<ArrowUpRight className="h-4 w-4" />}
              size="sm"
              className="min-h-[44px] w-full !px-2"
            />
            {whatsapp ? (
              <LinkBtn
                href={`https://wa.me/${whatsapp}`}
                label="WhatsApp"
                variant="primary"
                target="_blank"
                rel="noopener noreferrer"
                icon={<MessageCircle className="h-4 w-4" />}
                size="sm"
                className="min-h-[44px] w-full !px-2"
              />
            ) : (
              <span className="flex items-center justify-center text-ub-caption text-ub-text-tertiary">
                No WhatsApp listed
              </span>
            )}
          </div>
        )}
      </footer>
    </article>
  );
}
