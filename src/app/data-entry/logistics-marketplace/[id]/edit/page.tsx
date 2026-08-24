"use client";

import { useParams } from "next/navigation";
import EditLogisticsMarketplaceDetails from "features/logistical-service/components/admin/details/EditLogisticsMarketplaceDetails";

export default function DataEntryEditLogisticsProviderPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) return null;

  return (
    <EditLogisticsMarketplaceDetails
      id={id}
      redirectPath={`/data-entry/logistics-marketplace/${id}/edit`}
      listPath="/data-entry/logistics-marketplace"
    />
  );
}
