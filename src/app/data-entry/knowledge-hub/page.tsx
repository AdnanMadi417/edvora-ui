"use client";

import { Suspense } from "react";
import DataEntryProgramsTable from "features/programs/components/data-entry/DataEntryProgramsTable";

export default function DataEntryKnowledgeHubPage() {
  return (
    <Suspense fallback={null}>
      <DataEntryProgramsTable />
    </Suspense>
  );
}
