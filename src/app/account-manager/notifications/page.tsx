'use client';

import Notification from "features/notifications/components/Notifications";

const Dashboard = () => {
  return (
    <div>
      <Notification applicationBasePath="/account-manager/applications" />
    </div>
  );
};

export default Dashboard;
