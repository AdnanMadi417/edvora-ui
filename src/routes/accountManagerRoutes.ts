import { IRoute } from "../types/navigation";
import { ClipboardList, Handshake, BookOpen, Truck, Bell } from "lucide-react";

const accountManagerRoutes: IRoute[] = [
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
        name: "Partners",
        layout: "/account-manager",
        path: "/partners",
        icon: Handshake,
    },
    {
        name: "Notifications",
        layout: "/account-manager",
        path: "/notifications",
        icon: Bell,
    },
    // {
    //     name: "Commission",
    //     layout: "/account-manager",
    //     path: "/commission",
    //     icon: MdPayments,
    // },
];


export default accountManagerRoutes;
