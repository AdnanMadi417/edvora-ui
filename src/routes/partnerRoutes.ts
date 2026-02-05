import {
  MdDescription,
  MdPayments,
  MdNotifications,
  MdMenuBook,
  MdBusinessCenter,
} from "react-icons/md";

import type { IRoute } from "../types/navigation";

const partnerRoutes: IRoute[] = [
  {
    name: "Applications",
    layout: "/partner",
    path: "/applications",
    icon: MdDescription,
  },

  // {
  //   name: "Commission",
  //   layout: "/partner",
  //   path: "/commission",
  //   icon: MdPayments,
  // },

  {
    name: "Knowledge Hub",
    layout: "/partner",
    path: "/knowledgeHub",
    icon: MdMenuBook,
  },

  {
    name: "Notifications",
    layout: "/partner",
    path: "/notifications",
    icon: MdNotifications,
  },

  {
    name: "Partner Hub",
    layout: "/partner",
    path: "/marketplace",
    icon: MdBusinessCenter,
  },
];

export default partnerRoutes;
