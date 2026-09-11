'use client';

import Notification from "features/notifications/components/Notifications";

const Dashboard = () => {
  return (
    <div>
      <Notification partnerBasePath="/reviewer/partners" />
    </div>
  );
};

export default Dashboard;
