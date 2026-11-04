import { Home } from "lucide-react";
import { IRoute } from "../types/navigation";
import { ClipboardList, Handshake, BookOpen, Truck, Bell } from "lucide-react";

const accountManagerRoutes: IRoute[] = [
  { name: "Home", layout: "/account-manager", path: "/home", icon: Home },
    {
        name: "Notifications",
        layout: "/account-manager",
        path: "/notifications",
        icon: Bell,
    },
    {
        name: "Applications",
        layout: "/account-manager",
        path: "/applications",
        icon: ClipboardList,
    },
    {
        name: "Knowledge Hub",
        layout: "/account-manager",
        path: "/knowledge-hub",
        icon: BookOpen,
    },
    {
        name: "Logistics Marketplace",
        layout: "/account-manager",
        path: "/logistics-marketplace",
        icon: Truck,
    },
    {
        name: "Advisors",
        layout: "/account-manager",
        path: "/advisors",
        icon: Handshake,
    },
    // {
    //     name: "Commission",
    //     layout: "/account-manager",
    //     path: "/commission",
    //     icon: MdPayments,
    // },
];


export default accountManagerRoutes;
