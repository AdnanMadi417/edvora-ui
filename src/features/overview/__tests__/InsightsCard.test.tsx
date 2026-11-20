import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InsightsCard from "../components/InsightsCard";
import type { OverviewResource } from "../model/types";

const ready = (data: Partial<NonNullable<OverviewResource["data"]>>): OverviewResource => ({ state: "ready", data: { total: 10, items: [], ...data } });
const resources = {
  studyLevels: ready({ studyLevels: { levels: [{ key: "Bachelor", label: "Bachelor", value: 6 }, { key: "Master", label: "Master", value: 4 }], notRecorded: 0 } }),
  pipeline: ready({ distribution: [{ key: "review", label: "Unibexs review", value: 3 }, { key: "visa", label: "Visa", value: 7 }] }),
  topAdvisors: ready({ byAdvisor: [{ key: "p1", label: "Global Pathways", value: 7 }, { key: "p2", label: "Bright Future", value: 3 }] }),
  overTime: ready({
    overTime: {
      daily: [{ key: "2026-11-19", label: "19", value: 1 }, { key: "2026-11-20", label: "20", value: 2 }],
      weekly: [{ key: "2026-11-10", label: "10/11", value: 3 }, { key: "2026-11-17", label: "17/11", value: 5 }],
      monthly: [{ key: "2026-10-01", label: "Oct", value: 4 }, { key: "2026-11-01", label: "Nov", value: 6 }],
    },
  }),
  topCountries: ready({ byCountry: [{ key: "Nigeria", label: "Nigeria", value: 6 }, { key: "China", label: "China", value: 4 }] }),
};

it("switches views with tabs and keeps focus on the chosen tab", async () => {
  const user = userEvent.setup();
  render(<InsightsCard role="admin" base="/admin" resources={resources} onRetry={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "Insights" })).toBeInTheDocument();
  // Stage is the first tab and opens first.
  expect(screen.getAllByRole("tab")[0]).toHaveTextContent("Stage");
  expect(screen.getByRole("tab", { name: "Stage" })).toHaveAttribute("aria-selected", "true");
  await user.click(screen.getByRole("tab", { name: "Study level" }));
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
  await user.click(screen.getByRole("tab", { name: "Over time" }));
  // A line over the period, and the latest period against the one before (Nov 6 vs Oct 4).
  expect(screen.getByRole("group", { name: /last 12 months/ })).toBeInTheDocument();
  expect(screen.getByText("+50%")).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Weekly" }));
  expect(screen.getByRole("table", { name: /last 12 weeks/ })).toHaveTextContent("17/11");
  await user.click(screen.getByRole("tab", { name: "Daily" }));
  expect(screen.getByRole("group", { name: /last 14 days/ })).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Top countries" }));
  expect(screen.getByText("1. Nigeria: 6 applications, 60.0%")).toBeInTheDocument();
});

it("says plainly when a chart has no data yet, and Advisors don't see Top Advisors", async () => {
  const user = userEvent.setup();
  render(
    <InsightsCard
      role="partner"
      base="/partner"
      resources={{ ...resources, overTime: ready({ unavailable: true }) }}
      onRetry={jest.fn()}
    />
  );
  expect(screen.queryByRole("tab", { name: "Top Advisors" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Over time" }));
  expect(screen.getByText(/needs the date each application was submitted/)).toBeInTheDocument();
});
