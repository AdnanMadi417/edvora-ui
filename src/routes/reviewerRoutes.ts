import { IRoute } from "../types/navigation";
import { Handshake, UserCog } from "lucide-react";

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
];

export default reviewerRoutes;
