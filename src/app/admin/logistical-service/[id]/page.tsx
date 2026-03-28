"use client";

import { useParams } from "next/navigation";
import MarketplaceDetails from "components/admin/logisticalService/details/MarketplaceDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <MarketplaceDetails id={id} />
    </div>
  );
}
