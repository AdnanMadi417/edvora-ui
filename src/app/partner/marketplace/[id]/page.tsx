"use client";

import { useParams } from "next/navigation";
import MarketplaceDetails from "components/marketplace/partner/MarketplaceDetails";

export default function UniversityDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <MarketplaceDetails id={id} />
    </div>
  );
}
