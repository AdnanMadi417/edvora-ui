import { IRoute } from "../types/navigation";
import {
  MdBusinessCenter,
  MdHandshake,
  MdAdminPanelSettings,
  MdMenuBook,
  MdSchool,
  MdManageAccounts,
  MdAssignment,
  MdNotifications,
} from 'react-icons/md';
import { BookOpen, CreditCard, Settings, Wrench } from 'lucide-react';

const AdminRoutes: IRoute[] = [
  {
    name: "Applications",
    layout: "/admin",
    path: "/applications",
    icon: MdAssignment,
  },
  {
    name: "Account Managers",
    layout: "/admin",
    path: "/account-managers",
    icon: MdManageAccounts,
  },
  {
    name: "Partners",
    layout: "/admin",
    path: "/partners",
    icon: MdHandshake,
  },
  {
    name: "Programs",
    layout: "/admin",
    path: "/knowledge-hub/programs",
    icon: MdMenuBook,
  },
  {
      name: "Notifications",
      layout: "/admin",
      path: "/notifications",
      icon: MdNotifications,
    },
    
  {
    name: "Universities",
    layout: "/admin",
    path: "/universities",
    icon: MdSchool,
  },
  {
    name: "University Configuration",
    layout: "/admin",
    path: "/config-universities",
    icon: MdAdminPanelSettings,
    children: [
      {
        name: "Payment methods",
        layout: "/admin/config-universities",
        path: "/payment-methods",
        icon: CreditCard,
      },
      {
        name: "Configuration type",
        layout: "/admin/config-universities",
        path: "",
        icon: Settings,
      },
      {
        name: "Fields of Study",
        layout: "/admin/config-universities",
        path: "/fields-of-study",
        icon: BookOpen,
      }
    ],
  },
  {
    name: "Logistical Service",
    layout: "/admin",
    path: "/logistical-service",
    icon: MdBusinessCenter,
    children: [
      {
        name: "Service Types",
        layout: "/admin/logistical-service",
        path: "/services",
        icon: Wrench,
      },
    ],
  },
];

export default AdminRoutes;
