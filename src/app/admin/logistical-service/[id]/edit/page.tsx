"use client";

import { useParams } from "next/navigation";
import EditMarketplaceDetails from "components/admin/logisticalService/details/EditMarketplaceDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <EditMarketplaceDetails id={id} />
    </div>
  );
}
