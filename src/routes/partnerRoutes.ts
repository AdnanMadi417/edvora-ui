import { MdDescription, MdPayments } from "react-icons/md";
import { IRoute } from "types/navigation";

const partnerRoutes: IRoute[] = [
  { name: "Applications", layout: "/partner", path: "/applications", icon: MdDescription },
  { name: "Commission", layout: "/partner", path: "/commission", icon: MdPayments },
];

export default partnerRoutes;
