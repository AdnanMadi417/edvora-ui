import React from "react";
import { render, screen, within } from "@testing-library/react";
import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";

describe("Breadcrumbs", () => {
  const items = [
    { label: "Students", href: "/partner/students" },
    { label: "Nur Aisyah Binti Kamal", href: "/partner/students/42" },
    { label: "Documents" },
  ];

  it("renders a labelled nav with links and marks the last item as current", () => {
    render(<Breadcrumbs items={items} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("link", { name: "Students" })).toHaveAttribute("href", "/partner/students");
    expect(within(nav).getByRole("link", { name: "Nur Aisyah Binti Kamal" })).not.toHaveAttribute("aria-current");

    const current = within(nav).getByText("Documents");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(within(nav).queryByRole("link", { name: "Documents" })).not.toBeInTheDocument();
  });

  it("offers a menu for the collapsed middle levels", () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole("button", { name: "Show 1 more level" })).toHaveAttribute("aria-haspopup", "menu");
  });

  it("has no collapse menu with two items", () => {
    render(<Breadcrumbs items={[items[0], items[2]]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Documents")).toHaveAttribute("aria-current", "page");
  });
});
