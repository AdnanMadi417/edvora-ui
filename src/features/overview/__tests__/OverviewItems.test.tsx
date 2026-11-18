import React from "react";
import { render, screen } from "@testing-library/react";
import OverviewItems from "../components/OverviewItems";

const item = {
  id: "advisor-1",
  title: "Education agency",
  description: "Agency · Malaysia",
  href: "/admin/advisors/advisor-1",
  actionLabel: "Review profile",
  waitingDays: 3,
};
test("advisors are rows (never a carousel) with one verb + object action", () => {
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
    // The whole row is the link: verb first, then the row's details. No separate button.
    screen.getByRole("link", { name: /^Review profile: Education agency/ })
  ).toHaveAttribute("href", item.href);
  expect(screen.queryByRole("button")).toBeNull();
  // Shown as "3 days" by a clock; screen readers hear "Waiting 3 days".
  expect(screen.getByText((_, el) => el?.tagName === "SPAN" && el.textContent === "Waiting 3 days")).toBeInTheDocument();
  // Every row here awaits review, so no row repeats it as a tag.
  expect(screen.queryByText("Awaiting review")).toBeNull();
  expect(screen.getByText(item.description)).toBeInTheDocument();
});
test("activity rows are dated and keep their notification links", () => {
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
  expect(screen.getByRole("link", { name: new RegExp(item.title) })).toHaveAttribute(
    "href",
    "/admin/notifications"
  );
  expect(document.querySelector("time")).toHaveAttribute(
    "datetime",
    "2026-01-01T12:00:00.000Z"
  );
});
test("application tasks name the student and the whole row opens the application", () => {
  render(
    <OverviewItems
      resourceId="active"
      title="Application work queue"
      items={[
        {
          ...item,
          title: "Nadia Rahman",
          description: "INTI International University",
          href: "/admin/applications/a",
          actionLabel: "Open application",
        },
      ]}
    />
  );
  expect(screen.getByText("Nadia Rahman")).toBeInTheDocument();
  expect(screen.getByText("INTI International University")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /^Open application: Nadia Rahman/ })).toHaveAttribute("href", "/admin/applications/a");
  expect(screen.getAllByRole("link")).toHaveLength(1);
});
