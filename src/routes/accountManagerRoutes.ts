import { IRoute } from "../types/navigation";
import { MdNotifications, MdHandshake, MdAssignment, MdPayments, MdManageAccounts, MdMenuBook, MdBusinessCenter } from 'react-icons/md';

const accountManagerRoutes: IRoute[] = [
    {
        name: "Applications",
        layout: "/account-manager",
        path: "/applications",
        icon: MdAssignment,
    },
    {
        name: "Knowledge Hub",
        layout: "/account-manager",
        path: "/knowledge-hub",
        icon: MdMenuBook,
    },
    {
        name: "Logistics Marketplace",
        layout: "/account-manager",
        path: "/logistics-marketplace",
        icon: MdBusinessCenter,
    },
    // {
    //     name: "Partners",
    //     layout: "/account-manager",
    //     path: "/partners",
    //     icon: MdHandshake,
    // },
    // {
    //     name: "Commission",
    //     layout: "/account-manager",
    //     path: "/commission",
    //     icon: MdPayments,
    // },
    {
        name: "Notifications",
        layout: "/account-manager",
        path: "/notifications",
        icon: MdNotifications,
    }
];


export default accountManagerRoutes;
