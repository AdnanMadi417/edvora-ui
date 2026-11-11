import { Home } from "lucide-react";
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
  Banknote,
  Truck,
  Building2,
  Tag,
  Users,
  Bell,
  Wallet,
  FileText,
  Settings,
} from "lucide-react";

const AdminRoutes: IRoute[] = [
  { name: "Home", layout: "/admin", path: "/home", icon: Home },
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
    name: "Finance Queue",
    layout: "/admin",
    path: "/finance-queue",
    icon: Wallet,
  },
  {
    name: "Advisors",
    layout: "/admin",
    path: "/advisors",
    icon: Handshake,
    // "Bank Accounts" (admin-wide list, /admin/advisors/bank-accounts) is
    // unlinked for now; the page still exists. Banks moved to Settings.
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
  {
    // Reference data that powers forms and payouts. Pages keep their
    // addresses; only their place in the menu changed (UX audit U7).
    name: "Settings",
    layout: "/admin",
    path: "/settings",
    icon: Settings,
    children: [
      { name: "University Types", layout: "/admin/config-universities", path: "", icon: SlidersHorizontal },
      { name: "Fields of Study", layout: "/admin/config-universities", path: "/fields-of-study", icon: Layers },
      { name: "Payment Methods", layout: "/admin/config-universities", path: "/payment-methods", icon: CreditCard },
      { name: "Document Templates", layout: "/admin", path: "/document-types", icon: FileText },
      { name: "Banks", layout: "/admin/advisors", path: "/banks", icon: Banknote },
    ],
  },
];

export default AdminRoutes;
