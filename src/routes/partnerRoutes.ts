import { FaHome, FaBox, FaUser } from "react-icons/fa";
import { IconType } from "react-icons";

interface Route {
  name: string;
  layout: string;
  path: string;
  icon: IconType;
}

const partnerRoutes: Route[] = [
  { name: "Dashboard", layout: "/partner", path: "/dashboard", icon: FaHome },
  { name: "Orders", layout: "/partner", path: "/orders", icon: FaBox },
  { name: "Profile", layout: "/partner", path: "/profile", icon: FaUser },
];

export default partnerRoutes;
