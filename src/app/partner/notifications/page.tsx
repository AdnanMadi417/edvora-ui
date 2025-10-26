'use client';

import Notification from "components/notifications/notifications";

interface Notification {
  params: {
    id: string;
  };
}

const Dashboard = ({ params }: Notification) => {
  return (
    <div>
      <Notification params={params} />
    </div>
  );
};

export default Dashboard;
