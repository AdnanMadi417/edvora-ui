"use client";

import { useParams } from "next/navigation";
import EditLogisticsMarketplaceDetails from "features/logistical-service/components/admin/details/EditLogisticsMarketplaceDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <EditLogisticsMarketplaceDetails id={id} />
    </div>
  );
}
