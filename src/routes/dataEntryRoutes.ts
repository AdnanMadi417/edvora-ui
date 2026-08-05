import { IRoute } from "../types/navigation";
import {
  BookOpen,
  GraduationCap,
  Landmark,
  SlidersHorizontal,
  Layers,
  CreditCard,
  Truck,
  Building2,
  Tag,
} from "lucide-react";

const dataEntryRoutes: IRoute[] = [
  {
    name: "Knowledge Hub",
    layout: "/data-entry",
    path: "/knowledge-hub",
    icon: BookOpen,
    children: [
      {
        name: "Programs",
        layout: "/data-entry",
        path: "/knowledge-hub",
        icon: GraduationCap,
      },
      {
        name: "Universities",
        layout: "/data-entry",
        path: "/universities",
        icon: Landmark,
      },
      {
        name: "University Types",
        layout: "/data-entry/university-configuration",
        path: "",
        icon: SlidersHorizontal,
      },
      {
        name: "Fields of Study",
        layout: "/data-entry/university-configuration",
        path: "/fields-of-study",
        icon: Layers,
      },
      {
        name: "Payment Methods",
        layout: "/data-entry",
        path: "/payment-methods",
        icon: CreditCard,
      },
    ],
  },
  {
    name: "Logistics Marketplace",
    layout: "/data-entry",
    path: "/logistics-marketplace",
    icon: Truck,
    children: [
      {
        name: "Providers",
        layout: "/data-entry/logistics-marketplace",
        path: "",
        icon: Building2,
      },
      {
        name: "Service Types",
        layout: "/data-entry/logistics-marketplace",
        path: "/services",
        icon: Tag,
      },
    ],
  },
];

export default dataEntryRoutes;
