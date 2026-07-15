"use client";

import { useParams } from "next/navigation";
import LogisticalPartnersProviderDetails from "features/logistical-service/components/shared/LogisticalPartnersMarketplaceDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <LogisticalPartnersProviderDetails id={id} />
    </div>
  );
}
