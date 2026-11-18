"use client";
import EntityCell, { type EntityCellStatus } from "components/ub/data/display/EntityCell";
import { Avatar } from "components/ub/data/media/Avatar";
import PresignedImage from "components/ub/data/media/PresignedImage";

/** The fields every advisor list row has, whichever endpoint it came from. */
export interface AdvisorCellRecord {
  name?: string | null;
  type?: string | null;
  country?: string | null;
  is_active: boolean;
  is_verified?: boolean;
  individual_details?: { profile_photo_file_key?: string | null } | null;
  company_details?: { company_name?: string | null; logo_file_key?: string | null } | null;
  agency_membership?: { agency_name: string } | null;
}

/** A company shows its company name; an individual their own name. */
export function advisorName(advisor: AdvisorCellRecord): string {
  if (advisor.type === "agency" && advisor.company_details?.company_name) return advisor.company_details.company_name;
  return advisor.name || "Unknown advisor";
}

/** Profile photo for an individual, logo for a company. */
export function advisorImageKey(advisor: AdvisorCellRecord): string | undefined {
  const key = advisor.type === "agency" ? advisor.company_details?.logo_file_key : advisor.individual_details?.profile_photo_file_key;
  return key ?? undefined;
}

/** "Company · Malaysia", or "Member of Acme · Malaysia" for an agency member. */
export function advisorSubtitle(advisor: AdvisorCellRecord): string {
  const kind = advisor.agency_membership
    ? `Member of ${advisor.agency_membership.agency_name}`
    : advisor.type === "agency"
      ? "Company"
      : advisor.type === "individual"
        ? "Individual"
        : "—";
  return `${kind} · ${advisor.country || "—"}`;
}

/** Active, Pending review (registration not reviewed yet) or Suspended: the circle on the avatar. */
export function advisorStatus(advisor: AdvisorCellRecord): EntityCellStatus {
  if (advisor.is_active) return { status: "active" };
  if (advisor.is_verified === false) return { status: "pending", label: "Pending review" };
  return { status: "inactive", label: "Suspended" };
}

/** 40px round photo or logo from a presigned key; initials while it loads or when there is none. */
export function AdvisorAvatar({ name, fileKey }: { name: string; fileKey?: string | null }) {
  const initials = <Avatar name={name} size={40} alt="" />;
  return (
    <PresignedImage
      fileKey={fileKey ?? undefined}
      fallback={initials}
      renderImage={(src) => <Avatar name={name} src={src} size={40} alt="" />}
    />
  );
}

/** The advisor name cell shared by every advisor table and phone card. */
export default function AdvisorEntityCell({ advisor, subtitle }: { advisor: AdvisorCellRecord; subtitle?: string }) {
  const name = advisorName(advisor);
  return (
    <EntityCell
      name={name}
      avatar={<AdvisorAvatar name={name} fileKey={advisorImageKey(advisor)} />}
      status={advisorStatus(advisor)}
      subtitle={subtitle ?? advisorSubtitle(advisor)}
    />
  );
}
