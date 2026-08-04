"use client";

import ProgramsTable from "features/programs/components/admin/table/ProgramsTable";

export default function DataEntryKnowledgeHubPage() {
  return (
    <ProgramsTable
      basePath="/data-entry/knowledge-hub"
      hideDelete
      getRowHref={(id) => `/data-entry/knowledge-hub/${id}/edit`}
    />
  );
}
