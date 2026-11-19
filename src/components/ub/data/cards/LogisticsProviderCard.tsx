"use client";

import { Lock } from "lucide-react";
import Tag from "components/ub/data/badges/Tag";
import CatalogCard, { type CatalogCardAction } from "components/ub/data/cards/CatalogCard";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import ProviderAvatar from "features/logistical-service/components/shared/ProviderAvatar";
import type { ServiceProvider } from "features/logistical-service/types";

const money = (value: number) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

const fromPrice = (range?: { min_price: number } | null) =>
  range ? (
    <>
      <span className="font-normal text-ub-text-secondary">From </span>
      <span className="ub-tabular">{money(range.min_price)}</span>
    </>
  ) : (
    "Not listed"
  );

/** One line that truncates, with the full text in the kit tooltip. */
const OneLine = ({ text }: { text: string }) => (
  <Tooltip content={text} className="relative z-20 w-full min-w-0">
    <span className="block truncate">{text}</span>
  </Tooltip>
);

export default function LogisticsProviderCard({
  provider,
  href,
  locked = false,
}: {
  provider: ServiceProvider;
  href: string;
  locked?: boolean;
}) {
  if (locked)
    return (
      <CatalogCard
        name="Logistics provider"
        avatar={
          <span className="grid h-10 w-10 place-items-center rounded-ub-full bg-ub-surface-subtle text-ub-text-tertiary">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
        }
        subtitle="Unlocks at Visa Processing"
        facts={[
          { label: "Single service", value: "Unlock to view" },
          { label: "Package", value: "Unlock to view" },
          { label: "Services", value: <Tag hue="grey">Unlock to explore services</Tag>, wide: true },
        ]}
        footer={
          <p className="flex min-h-[40px] items-center justify-center gap-2 text-ub-label-sm text-ub-text-secondary">
            <Lock className="h-4 w-4" aria-hidden="true" />
            Contact locked
          </p>
        }
      />
    );

  const whatsapp = provider.whatsapp?.replace(/\D/g, "");
  const services = provider.services_offered ?? [];
  const languages = provider.languages?.join(" · ");
  const universities = provider.universities_served ?? [];
  const actions: CatalogCardAction[] = [
    { label: "View details", view: true, href, ariaLabel: `View details of ${provider.name}`, variant: whatsapp ? "secondary" : "primary" },
  ];
  if (whatsapp)
    actions.push({ label: "WhatsApp", href: `https://wa.me/${whatsapp}`, ariaLabel: `WhatsApp ${provider.name}`, variant: "primary", external: true });

  return (
    <CatalogCard
      name={provider.name}
      avatar={<ProviderAvatar provider={provider} />}
      status={{ status: provider.is_active }}
      subtitle={provider.main_location || "Location not provided"}
      href={href}
      facts={[
        { label: "Single service", value: fromPrice(provider.services_price_range) },
        { label: "Package", value: fromPrice(provider.packages_price_range) },
        {
          label: "Services",
          wide: true,
          value: services.length ? (
            <Tooltip content={services.map((s) => s.name).join(" · ")} className="relative z-20 w-full min-w-0">
              <span className="flex min-w-0 flex-wrap gap-1.5">
                {services.slice(0, 2).map((service) => (
                  <Tag key={service.id} hue="sky" size="sm">
                    {service.name}
                  </Tag>
                ))}
                {services.length > 2 && (
                  <Tag tone="neutral" size="sm">
                    +{services.length - 2} more
                  </Tag>
                )}
              </span>
            </Tooltip>
          ) : (
            "No services listed"
          ),
        },
        { label: "Languages", value: languages ? <OneLine text={languages} /> : "Not provided" },
        {
          label: "Universities served",
          value: universities.length ? (
            <OneLine text={`${universities.length} ${universities.length === 1 ? "university" : "universities"}`} />
          ) : (
            "None listed"
          ),
        },
      ]}
      actions={actions}
    />
  );
}
