"use client";

import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Globe2,
  GraduationCap,
  Languages,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  Phone,
  Truck,
} from "lucide-react";
import { useLogisticProviderDetails } from "features/logistical-service/hooks";
import Loading from "components/ub/feedback/states/Loading";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import IconButton from "components/ub/core/buttons/IconButton";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import Tag from "components/ub/data/badges/Tag";
import Card from "components/ub/data/cards/Card";
import SectionCard from "components/ub/data/cards/SectionCard";
import PresignedImage from "components/ub/data/media/PresignedImage";

const money = (value: number) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function ProviderProfileDetails({
  id,
  basePath,
  editable = false,
}: {
  id: string;
  basePath: string;
  editable?: boolean;
}) {
  const { service, loadingService, errorService } =
    useLogisticProviderDetails(id);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  async function copyPhone() {
    if (!service?.phone_number) return;
    try {
      await navigator.clipboard.writeText(service.phone_number);
      setCopied(true);
    } catch {
      showToast("Unable to copy phone number.", "error");
    }
  }
  if (loadingService) return <Loading text="Loading provider details..." />;
  if (errorService)
    return (
      <SectionCard
        title="Provider details"
        state="error"
        errorMessage={errorService}
      />
    );
  if (!service)
    return (
      <SectionCard
        title="Provider details"
        state="empty"
        empty={{
          title: "Provider not found",
          description: "Return to the provider list to choose another listing.",
        }}
        action={
          <LinkBtn
            href={basePath}
            title="Back to providers"
            variant="tertiary"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
        }
      />
    );
  const services = service.services_offered || [];
  const packages = service.packages_offered || [];
  const universities = service.universities_served || [];
  const locations = service.service_locations || [];
  const languages = service.languages || [];
  return (
    <article className="min-w-0 space-y-5 sm:space-y-6">
      <Card extra="overflow-hidden">
        <header className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <PresignedImage
              fileKey={service.picture_file_key}
              alt={service.name}
              className="h-16 w-16 shrink-0 rounded-ub-xl border border-ub-border object-cover sm:h-20 sm:w-20"
              fallback={
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-ub-xl border border-ub-tone-brand-border bg-ub-tone-brand-bg text-ub-tone-brand-text sm:h-20 sm:w-20">
                  <Truck className="h-8 w-8" />
                </span>
              }
            />
            <div className="min-w-0 space-y-2">
              <Breadcrumbs items={[{ label: "Logistics providers", href: basePath }, { label: service.name }]} />
              <h1 className="break-words text-ub-heading-lg text-ub-text-primary">
                {service.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ub-body-sm text-ub-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {service.main_location || "Location not provided"}
                </span>
                {service.nationality && (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2 className="h-4 w-4 shrink-0" />
                    {service.nationality}
                  </span>
                )}
                <Tag hue={service.is_active ? "teal" : "grey"}>
                  {service.is_active ? "Active" : "Inactive"}
                </Tag>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-end md:self-auto">
            {editable && (
              <LinkBtn
                href={`${basePath}/${id}/edit`}
                label="Edit provider"
                variant="secondary"
                icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
              />
            )}
            {!editable && service.whatsapp && (
              <LinkBtn
                href={`https://wa.me/${service.whatsapp.replace(/\D/g, "")}`}
                label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                icon={<MessageCircle className="h-4 w-4" />}
              />
            )}
          </div>
        </header>
        <dl className="grid grid-cols-3 divide-x divide-ub-border border-t border-ub-border bg-ub-surface-subtle px-2 py-4 sm:px-4 rtl:divide-x-reverse">
          {[
            { label: "Services", count: services.length, Icon: Truck },
            { label: "Packages", count: packages.length, Icon: Package },
            {
              label: "Universities",
              count: universities.length,
              Icon: GraduationCap,
            },
          ].map(({ label, count, Icon }) => (
            <div key={label} className="px-3 sm:px-5">
              <dt className="flex items-center gap-2 text-ub-caption text-ub-text-secondary">
                <Icon className="hidden h-4 w-4 sm:block" />
                {label}
              </dt>
              <dd className="mt-1 text-ub-heading-md ub-tabular text-ub-text-primary">
                {count}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          {!editable && (
            <SectionCard
              title="Pricing overview"
              as="h2"
              description="Listed prices in Malaysian ringgit."
            >
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Individual services",
                    range: service.services_price_range,
                  },
                  {
                    label: "Support packages",
                    range: service.packages_price_range,
                  },
                ].map(({ label, range }) => (
                  <div
                    key={label}
                    className="rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-4"
                  >
                    <dt className="text-ub-body-sm text-ub-text-secondary">
                      {label}
                    </dt>
                    <dd className="mt-2 text-ub-heading-md text-ub-text-primary">
                      {range ? (
                        <>
                          <span className="text-ub-body-sm font-normal text-ub-text-secondary">
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
              {service.price_range &&
                Boolean(services.length || packages.length) && (
                  <p className="mt-4 text-ub-body-sm text-ub-text-secondary">
                    Overall price range: {money(service.price_range.min_price)}
                    {service.price_range.max_price !==
                    service.price_range.min_price
                      ? ` – ${money(service.price_range.max_price)}`
                      : ""}
                  </p>
                )}
            </SectionCard>
          )}

          {Boolean(services.length) && (
            <SectionCard
              title="Services offered"
              as="h2"
              description="Individual services and their listed prices."
              state={services.length ? "ready" : "empty"}
              empty={{ icon: Truck, title: "No services listed" }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-col items-start gap-4 rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-4 transition-colors duration-200 hover:border-ub-border-hover motion-reduce:transition-none"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-ub-md border border-ub-border bg-ub-surface text-ub-tone-brand-text">
                      <Truck className="h-4 w-4" />
                    </span>
                    <p className="min-w-0 break-words text-ub-label-md">
                      {item.name}
                    </p>
                    <p className="mt-auto text-ub-heading-sm text-ub-text-primary">
                      {money(item.price)}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard
            title="Packages"
            as="h2"
            description="Bundled support and what each package includes."
            state={packages.length ? "ready" : "empty"}
            empty={{ icon: Package, title: "No packages listed" }}
          >
            <div
              className={`grid gap-4 ${
                packages.length > 1 ? "md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {packages.map((pkg, index) => (
                <Card
                  key={`${pkg.name}-${index}`}
                  extra="min-w-0 overflow-hidden"
                >
                  <div className="space-y-3 border-b border-ub-border bg-ub-tone-brand-bg p-5">
                    <Package className="h-5 w-5 text-ub-tone-brand-text" />
                    <h3 className="break-words text-ub-heading-sm text-ub-text-primary">
                      {pkg.name}
                    </h3>
                    <p className="text-ub-heading-lg ub-tabular text-ub-tone-brand-text">
                      {money(pkg.price)}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    {pkg.description && (
                      <p className="break-words text-ub-body-sm leading-relaxed text-ub-text-secondary">
                        {pkg.description}
                      </p>
                    )}
                    {Boolean(pkg.includes?.length) && (
                      <div className="space-y-3">
                        <p className="text-ub-caption font-medium uppercase tracking-wider text-ub-text-tertiary">
                          Included in this package
                        </p>
                        <ul className="space-y-3">
                          {pkg.includes.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-ub-body-sm"
                            >
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-ub-tone-brand-text" />
                              <span className="min-w-0 break-words">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </SectionCard>
        </div>

        <aside className="min-w-0 space-y-5 sm:space-y-6">
          <SectionCard
            title="Contact provider"
            as="h2"
            description="Connect directly to discuss student needs."
          >
            <div className="space-y-4">
              {service.phone_number ? (
                <div>
                  <p className="mb-1 text-ub-caption text-ub-text-secondary">
                    Phone number
                  </p>
                  <a
                    href={`tel:${service.phone_number}`}
                    className="-my-1 inline-flex items-center gap-2 break-all py-1 text-ub-label-md text-ub-text-primary hover:text-ub-text-link"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {service.phone_number}
                  </a>
                  <IconButton
                    title={copied ? "Phone number copied" : "Copy phone number"}
                    variant="tertiary"
                    size="sm"
                    icon={
                      copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )
                    }
                    onClick={copyPhone}
                  />
                  {copied && (
                    <span
                      role="status"
                      className="text-ub-caption text-ub-text-secondary"
                    >
                      Copied
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-ub-body-sm text-ub-text-secondary">
                  No phone number provided.
                </p>
              )}
              {service.whatsapp && (
                <LinkBtn
                  href={`https://wa.me/${service.whatsapp.replace(/\D/g, "")}`}
                  label="Contact on WhatsApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  icon={<MessageCircle className="h-4 w-4" />}
                  className="w-full"
                />
              )}
            </div>
          </SectionCard>
          <SectionCard title="Service coverage" as="h2">
            <div className="space-y-5">
              <div>
                <p className="mb-2 flex items-center gap-2 text-ub-label-sm text-ub-text-secondary">
                  <MapPin className="h-4 w-4" />
                  Locations
                </p>
                <div className="flex flex-wrap gap-2">
                  {locations.length ? (
                    locations.map((location) => (
                      <Tag key={location} hue="grey">
                        {location}
                      </Tag>
                    ))
                  ) : (
                    <p className="text-ub-body-sm text-ub-text-secondary">
                      Not provided
                    </p>
                  )}
                </div>
              </div>
              <div className="border-t border-ub-border pt-4">
                <p className="mb-3 flex items-center gap-2 text-ub-label-sm text-ub-text-secondary">
                  <GraduationCap className="h-4 w-4" />
                  Universities served
                </p>
                {universities.length ? (
                  <ul className="space-y-3">
                    {universities.map((university) => (
                      <li
                        key={university}
                        className="flex items-start gap-2 text-ub-body-sm"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ub-tone-brand-text" />
                        <span className="min-w-0 break-words">
                          {university}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ub-body-sm text-ub-text-secondary">
                    Not provided
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
          <SectionCard
            title="Languages"
            as="h2"
            action={<Languages className="h-5 w-5 text-ub-text-tertiary" />}
          >
            <div className="flex flex-wrap gap-2">
              {languages.length ? (
                languages.map((language) => (
                  <Tag key={language} hue="sky">
                    {language}
                  </Tag>
                ))
              ) : (
                <p className="text-ub-body-sm text-ub-text-secondary">
                  Not provided
                </p>
              )}
            </div>
          </SectionCard>
        </aside>
      </div>
    </article>
  );
}
