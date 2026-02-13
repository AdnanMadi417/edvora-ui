import { IRoute } from '../types/navigation';
import {
  MdBusinessCenter,
  MdAddBusiness,
  MdSupervisorAccount,
  MdPersonAdd,
  MdDescription,
} from 'react-icons/md';

const AdminRoutes: IRoute[] = [
  {
    name: "Applications",
    layout: "/admin",
    path: "/applications",
    icon: MdDescription,
  },
  {
    name: 'Account Managers',
    layout: '/admin',
    path: '/account-managers',
    icon: MdSupervisorAccount,
    children: [
      {
        name: 'Manage Account Managers',
        layout: '/admin/account-managers',
        path: '/manage',
        icon: MdPersonAdd,
      },

    ],
  },
  {
    name: 'Logistical Service',
    layout: '/admin',
    path: '/logistical-service',
    icon: MdBusinessCenter,
    children: [
      {
        name: 'Create Logistical Partner',
        layout: '/admin/logistical-service',
        path: '/create',
        icon: MdAddBusiness,
      },
    ],
  },
];

export default AdminRoutes;
