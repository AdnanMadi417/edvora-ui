'use client';

import { Suspense } from "react";
import KnowledgeHubCard from "features/programs/components/shared/card/ProgramCardGrid";

const Dashboard = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <KnowledgeHubCard/>
      </Suspense>
    </div>
  );
};

export default Dashboard;
