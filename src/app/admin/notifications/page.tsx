'use client';

import Notification from "features/notifications/components/Notifications";

const Dashboard = () => {
  return (
    <div>
      <Notification applicationBasePath="/admin/applications" />
    </div>
  );
};

export default Dashboard;
