"use client";

import { useParams } from "next/navigation";
import { PartnerDetailsView as PartnerDetails, PartnerApplicationsTable } from "features/partners";

export default function PartnerPage() {
  const params = useParams();
  const partnerId = params?.id as string;

  if (!partnerId) return null;

  return (
    <div className="block space-y-6">
      <PartnerDetails id={partnerId} />
      <PartnerApplicationsTable partnerId={partnerId} />
    </div>
  );
}