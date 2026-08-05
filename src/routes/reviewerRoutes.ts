import { IRoute } from "../types/navigation";
import { Handshake } from "lucide-react";

const reviewerRoutes: IRoute[] = [
    {
        name: "Partners",
        layout: "/reviewer",
        path: "/partners",
        icon: Handshake,
    },
];

export default reviewerRoutes;
