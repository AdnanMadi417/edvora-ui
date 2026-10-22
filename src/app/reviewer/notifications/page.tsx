'use client';

import Notification from "features/notifications/components/Notifications";

const Dashboard = () => {
  return (
    <div>
      <Notification partnerBasePath="/reviewer/advisors" />
    </div>
  );
};

export default Dashboard;
