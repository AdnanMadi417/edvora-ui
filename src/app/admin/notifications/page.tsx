'use client';

import Notification from "features/notifications/components/Notifications";

const Dashboard = () => {
  return (
    <div>
      <Notification applicationBasePath="/admin/applications" partnerBasePath="/admin/advisors" />
    </div>
  );
};

export default Dashboard;
