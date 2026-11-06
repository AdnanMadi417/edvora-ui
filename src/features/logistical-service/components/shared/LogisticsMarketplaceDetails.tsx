"use client";
import ProviderProfileDetails from "./ProviderProfileDetails";
export default function LogisticsMarketplaceDetails({
  id,
  basePath = "/partner",
}: {
  id: string;
  basePath?: string;
}) {
  return (
    <ProviderProfileDetails
      id={id}
      basePath={`${basePath}/logistics-marketplace`}
    />
  );
}
