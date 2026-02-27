import { IRoute } from "../types/navigation";
import { MdNotifications, MdHandshake, MdAssignment, MdPayments, MdManageAccounts } from 'react-icons/md';

const accountManagerRoutes: IRoute[] = [
    {
        name: "Applications",
        layout: "/account-manager",
        path: "/applications",
        icon: MdManageAccounts,
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
