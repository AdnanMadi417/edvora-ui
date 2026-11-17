import { BookOpen, Building2, Home, Languages } from "lucide-react";
import type { IRoute } from "types/navigation";
const base = "/language-centre-admin";
const routes: IRoute[] = [
  { name: "Overview", layout: base, path: "/overview", icon: Home },
  {
    name: "Centre Profile",
    layout: base,
    path: "/centre-profile",
    icon: Languages,
  },
  { name: "Branches", layout: base, path: "/branches", icon: Building2 },
  { name: "Courses", layout: base, path: "/courses", icon: BookOpen },
];
export default routes;
