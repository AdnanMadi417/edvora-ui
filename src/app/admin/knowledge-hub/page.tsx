"use client";

import { Suspense } from "react";
import ProgramsTable from "features/programs/components/admin/table/ProgramsTable";

const KnowledgeHubOverview = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <ProgramsTable />
      </Suspense>
    </div>
  );
};

export default KnowledgeHubOverview;
