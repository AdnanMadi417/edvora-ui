import { IRoute } from "types/navigation";
import { MdDashboard, MdHandshake, MdAssignment } from "react-icons/md";

const accountManagerRoutes: IRoute[] = [
    { name: "Dashboard", layout: "/account-manager", path: "/default", icon: MdDashboard },
    { name: "Applications", layout: "/account-manager", path: "/applications", icon: MdAssignment },
    { name: "Partners", layout: "/account-manager", path: "/partners", icon: MdHandshake },
];

export default accountManagerRoutes;
