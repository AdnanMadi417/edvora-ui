"use client";

import { useParams } from "next/navigation";
import AgencyMemberDetails from "features/agency-members/components/partner/AgencyMemberDetails";

export default function PartnerTeamMemberDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return <AgencyMemberDetails memberId={id} />;
}
