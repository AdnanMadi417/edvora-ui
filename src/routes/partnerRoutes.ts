import { MdDescription, MdPayments,MdNotifications,MdMenuBook,MdBusinessCenter } from "react-icons/md";
import { IRoute } from "types/navigation";

const partnerRoutes: IRoute[] = [
  { name: "Applications", layout: "/partner", path: "/applications", icon: MdDescription },
  { name: "Commission", layout: "/partner", path: "/commission", icon: MdPayments },
  { name: "Notifications", layout: "/partner", path: "/notifications", icon: MdNotifications },
  { name: "Knowledge Hub", layout: "/partner", path: "/knowledgeHub", icon: MdMenuBook },
  { name: "Partner Hub", layout: "/partner", path: "/marketplace", icon: MdBusinessCenter },
];

export default partnerRoutes;
