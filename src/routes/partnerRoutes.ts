import { MdDashboard, MdDescription } from "react-icons/md";
import { IRoute } from "types/navigation";

const partnerRoutes: IRoute[] = [
  { name: "Dashboard", layout: "/partner", path: "/default", icon: MdDashboard },
  { name: "Applications", layout: "/partner", path: "/applications", icon: MdDescription },
];

export default partnerRoutes;
