import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SidebarLinks from "./SidebarLinks";
import type { IRoute } from "types/navigation";
jest.mock("next/navigation", () => ({ usePathname: () => "/admin/home" }));
jest.mock("./sidebarState", () => ({
  useSidebarCollapsed: () => ({ collapsed: false, setCollapsed: jest.fn() }),
}));
const routes: IRoute[] = [
  {
    name: "Knowledge Hub",
    layout: "/admin",
    path: "/knowledge-hub",
    parentLink: true,
    children: [
      { name: "Programs", layout: "/admin", path: "/knowledge-hub" },
      { name: "Universities", layout: "/admin", path: "/universities" },
    ],
  },
];
it("navigates the group label to Programs and toggles its submenu separately", async () => {
  const user = userEvent.setup(),
    onLinkClick = jest.fn();
  render(<SidebarLinks routes={routes} onLinkClick={onLinkClick} />);
  const link = screen.getByRole("link", { name: "Knowledge Hub" });
  expect(link).toHaveAttribute("href", "/admin/knowledge-hub");
  await user.click(
    screen.getByRole("button", { name: "Expand Knowledge Hub" })
  );
  expect(screen.getByRole("link", { name: "Programs" })).toBeVisible();
  expect(onLinkClick).not.toHaveBeenCalled();
  await user.click(
    screen.getByRole("button", { name: "Collapse Knowledge Hub" })
  );
  expect(
    screen.getByRole("button", { name: "Expand Knowledge Hub" })
  ).toHaveAttribute("aria-expanded", "false");
  await user.click(link);
  expect(onLinkClick).toHaveBeenCalledTimes(1);
});
it("keeps other groups as expand-only buttons", async () => {
  const user = userEvent.setup();
  render(
    <SidebarLinks
      routes={[{ ...routes[0], name: "Settings", parentLink: false }]}
    />
  );
  expect(
    screen.queryByRole("link", { name: "Settings" })
  ).not.toBeInTheDocument();
  const toggle = screen.getByRole("button", { name: "Settings" });
  await user.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
});
