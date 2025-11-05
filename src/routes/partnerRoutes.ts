import { MdDescription, MdPayments,MdNotifications,MdPostAdd } from "react-icons/md";
import { IRoute } from "types/navigation";

const partnerRoutes: IRoute[] = [
  { name: "Applications", layout: "/partner", path: "/applications", icon: MdDescription },
  { name: "Commission", layout: "/partner", path: "/commission", icon: MdPayments },
  { name: "Notifications", layout: "/partner", path: "/notifications", icon: MdNotifications },
  // { name: "New Application", layout: "/partner", path: "/new-application", icon: MdPostAdd },
];

export default partnerRoutes;
