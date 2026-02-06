import { IRoute } from "../types/navigation";
import { MdAssignment, MdBusinessCenter,MdAddBusiness ,MdSchool,MdAccountBalance} from 'react-icons/md';

const AdminRoutes: IRoute[] = [
  {
    name: "Admin",
    layout: "/admin",
    path: "/default",
    icon: MdAssignment,
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
      }
    ],
  },
];

export default AdminRoutes;
