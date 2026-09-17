import { IRoute } from "../types/navigation";
import {
  ClipboardList,
  Handshake,
  UserCog,
  BookOpen,
  GraduationCap,
  Landmark,
  SlidersHorizontal,
  Layers,
  CreditCard,
  Truck,
  Building2,
  Tag,
  Users,
  Bell,
} from "lucide-react";

const AdminRoutes: IRoute[] = [
  {
    name: "Notifications",
    layout: "/admin",
    path: "/notifications",
    icon: Bell,
  },
  {
    name: "Applications",
    layout: "/admin",
    path: "/applications",
    icon: ClipboardList,
  },
  {
    name: "Partners",
    layout: "/admin",
    path: "/partners",
    icon: Handshake,
  },
  {
    name: "Account Managers",
    layout: "/admin",
    path: "/account-managers",
    icon: UserCog,
  },
  {
    name: "Staff Users",
    layout: "/admin",
    path: "/staff-users",
    icon: Users,
  },
  {
    name: "Knowledge Hub",
    layout: "/admin",
    path: "/knowledge-hub",
    icon: BookOpen,
    children: [
      {
        name: "Programs",
        layout: "/admin",
        path: "/knowledge-hub",
        icon: GraduationCap,
      },
      {
        name: "Universities",
        layout: "/admin",
        path: "/universities",
        icon: Landmark,
      },
      {
        name: "University Types",
        layout: "/admin/config-universities",
        path: "",
        icon: SlidersHorizontal,
      },
      {
        name: "Fields of Study",
        layout: "/admin/config-universities",
        path: "/fields-of-study",
        icon: Layers,
      },
      {
        name: "Payment Methods",
        layout: "/admin/config-universities",
        path: "/payment-methods",
        icon: CreditCard,
      },
    ],
  },
  {
    name: "Logistics Marketplace",
    layout: "/admin",
    path: "/logistics-marketplace",
    icon: Truck,
    children: [
      {
        name: "Providers",
        layout: "/admin/logistics-marketplace",
        path: "",
        icon: Building2,
      },
      {
        name: "Service Types",
        layout: "/admin/logistics-marketplace",
        path: "/services",
        icon: Tag,
      },
    ],
  },
];

export default AdminRoutes;
