import React from "react";
import { render, screen } from "@testing-library/react";
import OverviewVisual from "../components/OverviewVisual";
import type { OverviewResource, ResourcePlan } from "../model/types";
const ready = (total: number): OverviewResource => ({
  state: "ready",
  data: { total, items: [] },
});
const retry = jest.fn();
test("reviewer home has no second verification chart (the Advisors card shows it)", () => {
  const { container } = render(
    <OverviewVisual
      role="reviewer"
      resources={{ verified: ready(75), reviews: ready(25) }}
      plans={[]}
      onRetry={retry}
    />
  );
  expect(container).toBeEmptyDOMElement();
});
test("data entry charts required-field completeness, independently of hidden state", () => {
  render(
    <OverviewVisual
      role="data_entry"
      resources={{
        programs: ready(26),
        hiddenPrograms: ready(2),
        catalogueQuality: ready(7),
      }}
      plans={[]}
      onRetry={retry}
    />
  );
  expect(
    screen.getByRole("img", {
      name: "Required program information: Complete 75%, Needs attention 25%",
    })
  ).toBeInTheDocument();
  // The counts live in the Records to complete tile, not repeated here.
  expect(screen.queryByText("7")).not.toBeInTheDocument();
});
test("a complete catalogue says so in one line instead of a 100% gauge", () => {
  render(
    <OverviewVisual
      role="data_entry"
      resources={{ programs: ready(26), hiddenPrograms: ready(2), catalogueQuality: ready(0) }}
      plans={[]}
      onRetry={retry}
    />
  );
  expect(screen.getByText("All 28 programs are complete.")).toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
test("pipeline displays API counts and stage names", () => {
  const plan = {
    id: "pipeline",
    title: "Application pipeline",
    subtitle: "All active applications",
    href: "/admin/applications",
    emptyMessage: "No active applications",
    load: jest.fn(),
  } as ResourcePlan;
  render(
    <OverviewVisual
      role="admin"
      resources={{
        pipeline: {
          state: "ready",
          data: {
            total: 50,
            items: [],
            distribution: [
              {
                key: "stage",
                label: "Institution Review",
                value: 50,
                stageId: "institution-review",
              },
            ],
          },
        },
      }}
      plans={[plan]}
      onRetry={retry}
    />
  );
  // One view only: the pipeline, with no Bars/Pipeline switch.
  expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  expect(
    screen.getByRole("list", { name: "By stage, 50 in total" })
  ).toHaveTextContent("50");
  expect(screen.getByText("Institution Review")).toBeInTheDocument();
  // Each stage opens the tracker filtered to it.
  expect(screen.getByRole("link", { name: /^Institution Review: 50, 100%$/ })).toHaveAttribute("href", "/admin/applications?stage=stage");
  expect(
    screen.getByRole("link", { name: "Open application tracker" })
  ).toHaveAttribute("href", "/admin/applications");
});
