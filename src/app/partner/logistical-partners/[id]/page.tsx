"use client";

import { useParams } from "next/navigation";
import LogisticalPartnersMarketplaceDetails from "features/logistical-service/components/partner/LogisticalServiceMarketplaceDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <LogisticalPartnersMarketplaceDetails id={id} />
    </div>
  );
}
