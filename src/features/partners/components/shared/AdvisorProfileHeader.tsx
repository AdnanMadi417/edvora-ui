import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import type { ReactNode } from "react";
import { Pencil, MapPin, Building2, User } from "lucide-react";
import type { PartnerDetails } from "features/partners/types";
import PresignedImage from "components/ub/data/media/PresignedImage";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Tag from "components/ub/data/badges/Tag";
export default function AdvisorProfileHeader({
  partner,
  basePath,
  editable = false,
  actions,
  avatar,
  backHref,
  editHref,
  editLabel = "Edit advisor details",
}: {
  partner: Pick<
    PartnerDetails,
    | "id"
    | "name"
    | "email"
    | "type"
    | "country"
    | "is_active"
    | "company_details"
    | "individual_details"
  > & { is_verified?: boolean };
  basePath: string;
  editable?: boolean;
  actions?: ReactNode;
  avatar?: ReactNode;
  backHref?: string | null;
  editHref?: string;
  editLabel?: string;
}) {
  const company = partner.type === "agency";
  const name = company
    ? partner.company_details?.company_name || partner.name
    : partner.name;
  return (
    <header className="flex flex-col gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-start gap-4">
        {avatar || (
          <div className="grid h-16 w-16 shrink-0 sm:h-20 sm:w-20 place-items-center overflow-hidden rounded-ub-xl border border-ub-border bg-ub-tone-brand-bg text-ub-tone-brand-text">
            <PresignedImage
              fileKey={
                (company
                  ? partner.company_details?.logo_file_key
                  : partner.individual_details?.profile_photo_file_key) ||
                undefined
              }
              alt=""
              className="h-full w-full object-cover"
              fallback={
                company ? (
                  <Building2 className="h-7 w-7" />
                ) : (
                  <User className="h-7 w-7" />
                )
              }
            />
          </div>
        )}
        <div className="min-w-0 space-y-2">
          {backHref !== null && (
            <Breadcrumbs items={[{ label: "Advisors", href: backHref || basePath }, { label: name }]} />
          )}
          <p className="text-ub-caption font-medium uppercase tracking-wider text-ub-text-tertiary">
            {company ? "Company advisor" : "Individual advisor"}
          </p>
          <h1 className="break-words text-ub-heading-lg text-ub-text-primary">
            {name}
          </h1>
          <p className="break-all text-ub-body-sm text-ub-text-secondary">
            {company && partner.name !== name
              ? `Primary contact: ${partner.name}`
              : partner.email}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Tag hue={partner.is_active ? "teal" : "grey"}>
              {partner.is_active ? "Active" : "Inactive"}
            </Tag>
            {typeof partner.is_verified === "boolean" && (
              <Tag hue={partner.is_verified ? "sky" : "amber"}>
                {partner.is_verified ? "Verified" : "Pending verification"}
              </Tag>
            )}
            {partner.country && (
              <span className="inline-flex items-center gap-1 text-ub-body-sm text-ub-text-secondary">
                <MapPin className="h-4 w-4" />
                {partner.country}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
        {actions}
        {editable && (
          <LinkBtn
            href={editHref || `${basePath}/${partner.id}/edit`}
            label={editLabel}
            variant="secondary"
            icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
          />
        )}
      </div>
    </header>
  );
}
