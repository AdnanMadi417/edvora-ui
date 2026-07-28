"use client";

import { useParams } from "next/navigation";
import LogisticsMarketplaceDetails from "features/logistical-service/components/shared/LogisticsMarketplaceDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <LogisticsMarketplaceDetails id={id} basePath="/account-manager" />
    </div>
  );
}
