"use client";

import UniversityManagementTable from "features/universities/components/admin/tables/UniversityManagementTable";

export default function DataEntryUniversityConfigurationPage() {
  return (
    <UniversityManagementTable
      basePath="/data-entry/university-configuration"
      hideDelete
      getRowHref={(id) => `/data-entry/university-configuration/${id}/edit`}
    />
  );
}
