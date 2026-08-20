import { IRoute } from "../types/navigation";
import { Handshake, UserCog, Bell } from "lucide-react";

const reviewerRoutes: IRoute[] = [
    {
        name: "Partners",
        layout: "/reviewer",
        path: "/partners",
        icon: Handshake,
    },
    {
        name: "Account Managers",
        layout: "/reviewer",
        path: "/account-managers",
        icon: UserCog,
    },
    {
        name: "Notifications",
        layout: "/reviewer",
        path: "/notifications",
        icon: Bell,
    },
];

export default reviewerRoutes;
