"use client";

import { useParams } from "next/navigation";
import LogisticsMarketplaceProviderDetails from "features/logistical-service/components/admin/details/LogisticsMarketplaceProviderDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <LogisticsMarketplaceProviderDetails id={id} />
    </div>
  );
}
