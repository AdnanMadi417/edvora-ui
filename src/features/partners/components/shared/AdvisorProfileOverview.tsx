import type { ReactNode } from "react";
import { Building2, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import type {
  PartnerDetails,
  AccountManagerPartnerDetails,
} from "features/partners/types";
import { formatAgencyRole } from "features/partners/utils";
import SectionCard from "components/ub/data/cards/SectionCard";
import DescriptionList from "components/ub/data/display/DescriptionList";
import AppDate from "components/ub/data/formatting/AppDate";
import Tag from "components/ub/data/badges/Tag";

type Profile = PartnerDetails | AccountManagerPartnerDetails;
export default function AdvisorProfileOverview({
  partner,
  renderDocument,
  managers,
  showProfilePhoto = false,
}: {
  partner: Profile;
  renderDocument: (label: string, fileKey?: string | null) => ReactNode;
  managers?: ReactNode;
  showProfilePhoto?: boolean;
}) {
  const company = partner.type === "agency";
  const details = company
    ? partner.company_details
    : partner.individual_details;
  const website = partner.company_details?.website_url;
  const link = (href?: string | null) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-ub-text-link hover:underline"
      >
        {href}
      </a>
    ) : null;
  const documents = company
    ? [
        {
          label: "Company Registration Document",
          key: partner.company_details?.company_registration_doc_file_key,
        },
        { label: "Agency Logo", key: partner.company_details?.logo_file_key },
        {
          label: "Passport Photo",
          key: partner.company_details?.passport_photo_file_key,
        },
      ]
    : [
        ...(showProfilePhoto
          ? [
              {
                label: "Profile Photo",
                key: partner.individual_details?.profile_photo_file_key,
              },
            ]
          : []),
        {
          label: "Passport Photo",
          key: partner.individual_details?.passport_photo_file_key,
        },
      ];
  return (
    <div className="grid items-start gap-5 bg-ub-surface-subtle p-3 sm:gap-6 sm:p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5 sm:space-y-6">
        <SectionCard
          title={company ? "Company information" : "Personal information"}
          as="h2"
          description={
            company
              ? "Business and primary contact details."
              : "Background and identity information."
          }
          action={
            company ? (
              <Building2 className="h-5 w-5 text-ub-text-tertiary" />
            ) : (
              <UserRound className="h-5 w-5 text-ub-text-tertiary" />
            )
          }
        >
          <DescriptionList
            columns={2}
            divided
            items={
              company
                ? [
                    {
                      label: "Company name",
                      value: partner.company_details?.company_name,
                    },
                    { label: "Website", value: link(website) },
                    { label: "Primary contact", value: partner.name },
                    {
                      label: "Date of birth",
                      value: details?.date_of_birth ? (
                        <AppDate value={details.date_of_birth} format="short" />
                      ) : null,
                    },
                    {
                      label: "Passport number",
                      value: details?.passport_number,
                    },
                  ]
                : [
                    { label: "Full name", value: partner.name },
                    {
                      label: "Date of birth",
                      value: details?.date_of_birth ? (
                        <AppDate value={details.date_of_birth} format="short" />
                      ) : null,
                    },
                    {
                      label: "Passport number",
                      value: details?.passport_number,
                    },
                    {
                      label: "Background",
                      value: partner.individual_details?.background,
                    },
                    {
                      label: "LinkedIn",
                      value: link(partner.individual_details?.linkedin_url),
                    },
                    {
                      label: "Social media",
                      value: link(partner.individual_details?.social_media_url),
                    },
                  ]
            }
            fallback="Not provided"
          />
        </SectionCard>
        <SectionCard
          title="Supporting documents"
          as="h2"
          description="View or download the files submitted for this account."
          action={
            <Tag hue="grey">
              {documents.filter((doc) => doc.key).length} available
            </Tag>
          }
        >
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.label}>{renderDocument(doc.label, doc.key)}</div>
            ))}
          </div>
        </SectionCard>
        {managers && <div className="[&>div]:!m-0">{managers}</div>}
      </div>
      <aside className="min-w-0 space-y-5 sm:space-y-6">
        <SectionCard
          title="Contact details"
          as="h2"
          description="Reach the adviser or primary contact."
        >
          <div className="space-y-5">
            <div>
              <p className="mb-1.5 text-ub-caption text-ub-text-secondary">
                Email address
              </p>
              <a
                href={`mailto:${partner.email}`}
                className="-my-1 flex items-start gap-2 py-1 text-ub-body-sm text-ub-text-link hover:underline"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="min-w-0 break-all">{partner.email}</span>
              </a>
            </div>
            <div>
              <p className="mb-1.5 text-ub-caption text-ub-text-secondary">
                Phone number
              </p>
              {partner.phone ? (
                <a
                  href={`tel:${partner.phone}`}
                  className="-my-1 flex items-start gap-2 py-1 text-ub-body-sm text-ub-text-primary hover:text-ub-text-link"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="break-all">{partner.phone}</span>
                </a>
              ) : (
                <p className="text-ub-body-sm text-ub-text-secondary">
                  Not provided
                </p>
              )}
            </div>
            <DescriptionList
              divided
              items={[
                { label: "Country of residence", value: partner.country },
                { label: "Nationality", value: partner.nationality },
              ]}
              fallback="Not provided"
            />
          </div>
        </SectionCard>
        <SectionCard
          title="Account overview"
          as="h2"
          action={<ShieldCheck className="h-5 w-5 text-ub-text-tertiary" />}
        >
          <DescriptionList
            divided
            items={[
              {
                label: "Account status",
                value: (
                  <Tag hue={partner.is_active ? "teal" : "grey"}>
                    {partner.is_active ? "Active" : "Inactive"}
                  </Tag>
                ),
              },
              {
                label: "Verification",
                value: (
                  <Tag hue={partner.is_verified ? "sky" : "amber"}>
                    {partner.is_verified ? "Verified" : "Pending verification"}
                  </Tag>
                ),
              },
              {
                label: "Advisor type",
                value: company ? "Company" : "Individual",
              },
              ...("assigned_manager_name" in partner
                ? [
                    {
                      label: "Assigned manager",
                      value: partner.assigned_manager_name || "Unassigned",
                    },
                  ]
                : []),
              ...(partner.agency_role
                ? [
                    {
                      label: "Agency role",
                      value: formatAgencyRole(partner.agency_role),
                    },
                  ]
                : []),
              ...(partner.agency_membership
                ? [
                    {
                      label: "Member of",
                      value: partner.agency_membership.agency_name,
                    },
                  ]
                : []),
            ]}
          />
        </SectionCard>
        <SectionCard title="Account activity" as="h2">
          <DescriptionList
            divided
            items={[
              {
                label: "Registered",
                value: partner.created_at ? (
                  <AppDate value={partner.created_at} format="short" />
                ) : null,
              },
              ...("updated_at" in partner
                ? [
                    {
                      label: "Last updated",
                      value: partner.updated_at ? (
                        <AppDate value={partner.updated_at} format="datetime" />
                      ) : null,
                    },
                  ]
                : []),
              {
                label: "Last login",
                value: partner.last_login ? (
                  <AppDate value={partner.last_login} format="datetime" />
                ) : (
                  "Never"
                ),
              },
            ]}
          />
        </SectionCard>
      </aside>
    </div>
  );
}
