import { IRoute } from 'types/navigation';

// NextJS Requirement
export const isWindowAvailable = () => typeof window !== 'undefined';

export const findCurrentRoute = (
  routes: IRoute[],
  pathname: string,
): IRoute => {
  let active: IRoute | undefined;
  let longest = -1;
  const visit = (entries: IRoute[]) => {
    for (const route of entries) {
      const href = `${route.layout ?? ""}${route.path}`.replace(/\/$/, "") || "/";
      const matches = pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));
      if (matches && href.length >= longest) {
        active = route;
        longest = href.length;
      }
      if (route.children) visit(route.children);
      if (route.items) visit(route.items);
    }
  };
  visit(routes);
  return active;
};

export const getActiveRoute = (routes: IRoute[], pathname: string): string => {
  const route = findCurrentRoute(routes, pathname);
  if (route) return route.name;
  // Direct links can target a section hidden from the sidebar by a feature flag.
  const section = pathname?.split("/")[2];
  return section
    ? section.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    : "Main Dashboard";
};

export const getActiveNavbar = (
  routes: IRoute[],
  pathname: string,
): boolean => {
  const route = findCurrentRoute(routes, pathname);
  return route?.secondary;
};

export const getActiveNavbarText = (
  routes: IRoute[],
  pathname: string,
): string | boolean => {
  return getActiveRoute(routes, pathname) || false;
};
