import {
  MdNotifications,
  MdMenuBook,
  MdBusinessCenter,
  MdAssignment,
} from 'react-icons/md';

import type { IRoute } from "../types/navigation";

const partnerRoutes: IRoute[] = [
  {
    name: "Applications",
    layout: "/partner",
    path: "/applications",
    icon: MdAssignment,
  },

  {
    name: "Knowledge Hub",
    layout: "/partner",
    path: "/knowledge-hub",
    icon: MdMenuBook,
  },

  {
    name: "Notifications",
    layout: "/partner",
    path: "/notifications",
    icon: MdNotifications,
  },

  {
    name: "Logistics Marketplace",
    layout: "/partner",
    path: "/logistics-marketplace",
    icon: MdBusinessCenter,
  },
];

export default partnerRoutes;
