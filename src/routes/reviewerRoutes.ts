import { IRoute } from "../types/navigation";
import { MdHandshake } from 'react-icons/md';

// Applications review will be added once the Partners review page is confirmed.
const reviewerRoutes: IRoute[] = [
    {
        name: "Partners",
        layout: "/reviewer",
        path: "/partners",
        icon: MdHandshake,
    },
];

export default reviewerRoutes;
