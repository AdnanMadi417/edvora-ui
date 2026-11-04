import { Home } from "lucide-react";
import { IRoute } from "../types/navigation";
import { Handshake, UserCog, Bell } from "lucide-react";

const reviewerRoutes: IRoute[] = [
  { name: "Home", layout: "/reviewer", path: "/home", icon: Home },
    {
        name: "Notifications",
        layout: "/reviewer",
        path: "/notifications",
        icon: Bell,
    },
    {
        name: "Advisors",
        layout: "/reviewer",
        path: "/advisors",
        icon: Handshake,
    },
    {
        name: "Account Managers",
        layout: "/reviewer",
        path: "/account-managers",
        icon: UserCog,
    },
];

export default reviewerRoutes;
