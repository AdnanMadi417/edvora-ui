'use client';

import Notification from "features/notifications/components/Notifications";

const Dashboard = () => {
  return (
    <div>
      <Notification applicationBasePath="/partner/applications" />
    </div>
  );
};

export default Dashboard;
