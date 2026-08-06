'use client';

import KnowledgeHubCard from "features/programs/components/shared/card/ProgramCardGrid";

const Dashboard = () => {
  return (
    <div>
      <KnowledgeHubCard basePath="/account-manager" showApplyAction={false} />
    </div>
  );
};

export default Dashboard;
