import React from "react";
import { render, screen } from "@testing-library/react";
import OverviewItems from "../components/OverviewItems";

const item = {
  id: "advisor-1",
  title: "Education agency",
  description: "Agency · Malaysia",
  href: "/admin/advisors/advisor-1",
};
test("advisor lists use people rows with accessible profile links", () => {
  render(
    <OverviewItems
      resourceId="reviews"
      title="Advisors awaiting review"
      items={[item]}
    />
  );
  expect(
    screen.getByRole("list", { name: "Advisors awaiting review" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Open advisor: Education agency" })
  ).toHaveAttribute("href", item.href);
  expect(screen.getByText(item.description)).toBeInTheDocument();
});
test("activity uses a dated timeline and retains notification links", () => {
  render(
    <OverviewItems
      resourceId="updates"
      title="Recent activity"
      items={[
        { ...item, at: "2026-01-01T12:00:00Z", href: "/admin/notifications" },
      ]}
    />
  );
  expect(
    screen.getByRole("list", { name: "Recent activity" })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: item.title })).toHaveAttribute(
    "href",
    "/admin/notifications"
  );
  expect(document.querySelector("time")).toHaveAttribute(
    "datetime",
    "2026-01-01T12:00:00.000Z"
  );
});
test("application tasks retain their actionable link and student context", () => {
  render(
    <OverviewItems
      resourceId="active"
      title="Application work queue"
      items={[
        {
          ...item,
          title: "Review documents",
          description: "Student · University",
          href: "/admin/applications/a",
        },
      ]}
    />
  );
  expect(
    screen.getByRole("link", { name: "Review documents" })
  ).toHaveAttribute("href", "/admin/applications/a");
  expect(screen.getByText("Student · University")).toBeInTheDocument();
});
