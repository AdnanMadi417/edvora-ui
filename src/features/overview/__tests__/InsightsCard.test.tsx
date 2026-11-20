import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InsightsCard from "../components/InsightsCard";
import type { OverviewResource } from "../model/types";

const ready = (data: Partial<NonNullable<OverviewResource["data"]>>): OverviewResource => ({ state: "ready", data: { total: 10, items: [], ...data } });
const resources = {
  studyLevels: ready({ studyLevels: { levels: [{ key: "Bachelor", label: "Bachelor", value: 6 }, { key: "Master", label: "Master", value: 4 }], notRecorded: 0 } }),
  pipeline: ready({ distribution: [{ key: "review", label: "Unibexs review", value: 3 }, { key: "visa", label: "Visa", value: 7 }] }),
  topAdvisors: ready({ byAdvisor: [{ key: "p1", label: "Global Pathways", value: 7 }, { key: "p2", label: "Bright Future", value: 3 }] }),
  monthly: ready({ byMonth: [{ key: "2026-10", label: "Oct", value: 4 }, { key: "2026-11", label: "Nov", value: 6 }] }),
  topCountries: ready({ byCountry: [{ key: "Nigeria", label: "Nigeria", value: 6 }, { key: "China", label: "China", value: 4 }] }),
};

it("switches views with tabs and keeps focus on the chosen tab", async () => {
  const user = userEvent.setup();
  render(<InsightsCard role="admin" base="/admin" resources={resources} onRetry={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "Insights" })).toBeInTheDocument();
  expect(screen.getByText("60.0%")).toBeInTheDocument();

  await user.click(screen.getByRole("tab", { name: "Stage" }));
  expect(screen.getByRole("tab", { name: "Stage" })).toHaveFocus();
  expect(screen.getByRole("link", { name: /^Visa: 7 applications/ })).toHaveAttribute("href", "/admin/applications?stage=visa");

  await user.click(screen.getByRole("tab", { name: "Top Advisors" }));
  expect(screen.getByRole("link", { name: "1. Global Pathways: 7 applications, 70.0%" })).toHaveAttribute("href", "/admin/advisors/p1");
});

it("draws the monthly and country views when the list sends the data", async () => {
  const user = userEvent.setup();
  render(<InsightsCard role="admin" base="/admin" resources={resources} onRetry={jest.fn()} />);
  await user.click(screen.getByRole("tab", { name: "Monthly" }));
  expect(screen.getByRole("list", { name: /by month submitted/ })).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Top countries" }));
  expect(screen.getByText("1. Nigeria: 6 applications, 60.0%")).toBeInTheDocument();
});

it("says plainly when a chart has no data yet, and Advisors don't see Top Advisors", async () => {
  const user = userEvent.setup();
  render(
    <InsightsCard
      role="partner"
      base="/partner"
      resources={{ ...resources, monthly: ready({ unavailable: true }) }}
      onRetry={jest.fn()}
    />
  );
  expect(screen.queryByRole("tab", { name: "Top Advisors" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Monthly" }));
  expect(screen.getByText(/needs the date each application was submitted/)).toBeInTheDocument();
});
