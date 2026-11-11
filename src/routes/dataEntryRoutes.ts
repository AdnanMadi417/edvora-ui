import { Home } from "lucide-react";
import { IRoute } from "../types/navigation";
import {
  BookOpen,
  GraduationCap,
  Landmark,
  SlidersHorizontal,
  Layers,
  CreditCard,
  Banknote,
  Truck,
  Building2,
  Tag,
  Bell,
  Settings,
} from "lucide-react";

const dataEntryRoutes: IRoute[] = [
  { name: "Home", layout: "/data-entry", path: "/home", icon: Home },
  {
    name: "Notifications",
    layout: "/data-entry",
    path: "/notifications",
    icon: Bell,
  },
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
  {
    // Reference data, separate from the Knowledge Hub people read (UX audit U7).
    name: "Settings",
    layout: "/data-entry",
    path: "/settings",
    icon: Settings,
    children: [
      { name: "University Types", layout: "/data-entry/university-configuration", path: "", icon: SlidersHorizontal },
      { name: "Fields of Study", layout: "/data-entry/university-configuration", path: "/fields-of-study", icon: Layers },
      { name: "Payment Methods", layout: "/data-entry", path: "/payment-methods", icon: CreditCard },
      { name: "Banks", layout: "/data-entry", path: "/banks", icon: Banknote },
    ],
  },
];

export default dataEntryRoutes;
