"use client";

import LogisticsMarketplaceTable from "features/logistical-service/components/admin/table/LogisticsMarketplaceTable";

export default function DataEntryLogisticsMarketplacePage() {
  return (
    <LogisticsMarketplaceTable
      basePath="/data-entry/logistics-marketplace"
      hideDelete
      getRowHref={(id) => `/data-entry/logistics-marketplace/${id}/edit`}
    />
  );
}
