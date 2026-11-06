"use client";
import ProviderProfileDetails from "../../shared/ProviderProfileDetails";
export default function LogisticsMarketplaceProviderDetails({
  id,
  basePath = "/admin/logistics-marketplace",
}: {
  id: string;
  basePath?: string;
}) {
  return <ProviderProfileDetails id={id} basePath={basePath} editable />;
}
