import { IRoute } from "../types/navigation";
import { MdSchool } from 'react-icons/md';

// Knowledge Hub (programs) will be added once the Universities page is confirmed.
const dataEntryRoutes: IRoute[] = [
    {
        name: "Universities",
        layout: "/data-entry",
        path: "/universities",
        icon: MdSchool,
    },
];

export default dataEntryRoutes;
