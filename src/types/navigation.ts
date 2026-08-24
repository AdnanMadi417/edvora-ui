import type { LucideIcon } from "lucide-react";

export interface IRoute {
  name: string;
  layout?: string;
  path: string;
  icon?: LucideIcon;
  children?: IRoute[];
  /** Used by utils/navigation.ts's findCurrentRoute for recursive route matching; no route currently sets this. */
  items?: IRoute[];
  /** Used by utils/navigation.ts's getActiveNavbar to toggle the Navbar's secondary row; no route currently sets this. */
  secondary?: boolean;
}
