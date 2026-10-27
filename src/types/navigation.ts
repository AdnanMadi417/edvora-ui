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
  /**
   * Names of viewer-visibility flags that, if any is true, hide this route
   * from the sidebar. The flags themselves are computed per role layout
   * (e.g. app/partner/layout.tsx) from the signed-in profile -- declared
   * here as plain strings so a route's visibility rule lives next to the
   * route itself instead of in a separate, growing filter chain.
   */
  hiddenWhen?: string[];
}
