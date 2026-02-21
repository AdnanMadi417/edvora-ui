import { IRoute } from "../types/navigation";
import {
  MdBusinessCenter,
  MdAddBusiness,
  MdSupervisorAccount,
  MdPersonAdd,
  MdDescription,
  MdSchool,
} from "react-icons/md";
import { MdOutlineLibraryBooks , MdLibraryAdd } from "react-icons/md";


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
    children: [
      {
        name: "Create Account Managers",
        layout: "/admin/account-managers",
        path: "/create",
        icon: MdPersonAdd,
      },
    ],
  },
  {
    name: "Knowledge Hub",
    layout: "/admin",
    path: "/knowledge-hub",
    icon: MdOutlineLibraryBooks,
    children: [
      {
        name: "Create Program",
        layout: "/admin/knowledge-hub",
        path: "/programs/create",
        icon: MdLibraryAdd,
      },
      {
        name: "Create University",
        layout: "/admin/knowledge-hub",
        path: "/universities/create",
        icon: MdSchool,
      },
    ],
  },
  {
    name: "Logistical Service",
    layout: "/admin",
    path: "/logistical-service",
    icon: MdBusinessCenter,
    children: [
      {
        name: "Create Logistical Partner",
        layout: "/admin/logistical-service",
        path: "/create",
        icon: MdAddBusiness,
      },
    ],
  },
];

export default AdminRoutes;
