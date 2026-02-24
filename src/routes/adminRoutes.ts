import { IRoute } from "../types/navigation";
import {
  MdBusinessCenter,
  MdSupervisorAccount,
  MdDescription,
  MdHandshake,
  MdOutlineBusiness
} from "react-icons/md";
import { MdOutlineAccountBalance  } from "react-icons/md";


const AdminRoutes: IRoute[] = [
  {
    name: "Applications",
    layout: "/admin",
    path: "/applications",
    icon: MdDescription,
  },
  {
    name: "Account Managers",
    layout: "/admin",
    path: "/account-managers",
    icon: MdSupervisorAccount,
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
    icon: MdOutlineBusiness,
  },
  {
    name: "Programs",
    layout: "/admin",
    path: "/knowledge-hub/programs",
    icon: MdOutlineAccountBalance,
  },
  {
    name: "Logistical Service",
    layout: "/admin",
    path: "/logistical-service",
    icon: MdBusinessCenter,
  },
];

export default AdminRoutes;
