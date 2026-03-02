import { IRoute } from "../types/navigation";
import {
  MdBusinessCenter,
  MdHandshake,
  MdAdminPanelSettings,
  MdMenuBook,
  MdSchool,
  MdManageAccounts,
  MdAssignment,
} from "react-icons/md";

const AdminRoutes: IRoute[] = [
  {
    name: "Applications",
    layout: "/admin",
    path: "/applications",
    icon: MdAssignment,
  },
  {
    name: "Account Managers",
    layout: "/admin",
    path: "/account-managers",
    icon: MdManageAccounts,
  },
  {
    name: "Partners",
    layout: "/admin",
    path: "/partners",
    icon: MdHandshake,
  },
  {
    name: "Universities",
    layout: "/admin",
    path: "/universities",
    icon: MdSchool,
  },
  {
    name: "University Configuration",
    layout: "/admin",
    path: "/config-universities",
    icon: MdAdminPanelSettings,
  },
  {
    name: "Programs",
    layout: "/admin",
    path: "/knowledge-hub/programs",
    icon: MdMenuBook,
  },
  {
    name: "Logistical Service",
    layout: "/admin",
    path: "/logistical-service",
    icon: MdBusinessCenter,
  },
];

export default AdminRoutes;
