import { MdDashboard, MdPeople, MdAssessment } from "react-icons/md";
import { IconType } from "react-icons";

interface Route {
    name: string;
    layout: string;
    path: string;
    icon: IconType;
}

const adminRoutes: Route[] = [
    { name: "Dashboard", layout: "/admin", path: "/default", icon: MdDashboard },
    { name: "Users", layout: "/admin", path: "/users", icon: MdPeople },
    { name: "Reports", layout: "/admin", path: "/reports", icon: MdAssessment },
];

export default adminRoutes;
