import React from "react";
import { render, screen } from "@testing-library/react";
import OverviewVisual from "../components/OverviewVisual";
import type { OverviewResource, ResourcePlan } from "../model/types";
const ready = (total: number): OverviewResource => ({
  state: "ready",
  data: { total, items: [] },
});
const retry = jest.fn();
test("verification chart uses exact totals from both disjoint groups", () => {
  render(
    <OverviewVisual
      role="reviewer"
      resources={{ verified: ready(75), reviews: ready(25) }}
      plans={[]}
      onRetry={retry}
    />
  );
  expect(
    screen.getByRole("img", {
      name: "Advisor verification status: Verified 75%, Awaiting review 25%",
    })
  ).toBeInTheDocument();
  expect(screen.getByText("75")).toBeInTheDocument();
  expect(screen.getByText("25")).toBeInTheDocument();
});
test("missing totals keep the chart loading rather than reporting zero", () => {
  render(
    <OverviewVisual
      role="reviewer"
      resources={{ verified: ready(75), reviews: { state: "loading" } }}
      plans={[]}
      onRetry={retry}
    />
  );
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toBeInTheDocument();
});
test("failed chart source exposes retry instead of a misleading percentage", () => {
  render(
    <OverviewVisual
      role="reviewer"
      resources={{
        verified: ready(75),
        reviews: { state: "error", error: "Could not load reviews" },
      }}
      plans={[]}
      onRetry={retry}
    />
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Could not load reviews");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
test("data entry has no chart, since the cards already show visible and hidden", () => {
  const { container } = render(
    <OverviewVisual
      role="data_entry"
      resources={{ programs: ready(26), hiddenPrograms: ready(2) }}
      plans={[]}
      onRetry={retry}
    />
  );
  expect(container).toBeEmptyDOMElement();
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
    screen.getByRole("list", { name: "Applications by stage" })
  ).toHaveTextContent("50");
  expect(screen.getByText("Institution Review")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Open application tracker" })
  ).toHaveAttribute("href", "/admin/applications");
});
