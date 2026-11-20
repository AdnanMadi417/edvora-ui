import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PipelineFlow from "./PipelineFlow";
import { stageFromParam } from "features/applications/hooks/useStageParam";

const stages = [
  { id: "review", label: "Unibexs review", count: 1 },
  { id: "offer", label: "University and offer", count: 3 },
  { id: "visa", label: "Visa", count: 0 },
];

it("lists stages in order with each count and share once, and no badges", () => {
  render(<PipelineFlow stages={stages} />);
  const list = screen.getByRole("list", { name: "Applications by stage" });
  expect(list.querySelectorAll("li")).toHaveLength(3);
  const offer = screen.getByRole("group", { name: /^University and offer:/ });
  // The count and the share appear once each (the step number is "2").
  expect(within(offer).getAllByText("3")).toHaveLength(1);
  expect(within(offer).getAllByText("75%")).toHaveLength(1);
  expect(screen.queryByText("Action needed")).toBeNull();
  expect(screen.getByRole("group", { name: /^Unibexs review: 1 applications, 25%$/ })).toBeInTheDocument();
});

it("toggles a stage filter on and off", async () => {
  function Harness() {
    const [selected, setSelected] = useState<string | null>(null);
    return <PipelineFlow stages={stages} selectedId={selected} onSelect={setSelected} />;
  }
  const user = userEvent.setup();
  render(<Harness />);
  const offer = screen.getByRole("button", { name: /^University and offer:/ });
  await user.click(offer);
  expect(offer).toHaveAttribute("aria-pressed", "true");
  await user.click(offer);
  expect(offer).toHaveAttribute("aria-pressed", "false");
});

it("links each stage when getHref is given, and the list layout drops the columns", () => {
  render(<PipelineFlow stages={stages} layout="list" getHref={(s) => `/partner/applications?stage=${s.id}`} />);
  expect(screen.getByRole("link", { name: /^Visa:/ })).toHaveAttribute("href", "/partner/applications?stage=visa");
  // On narrow screens: the pipeline donut over a compact legend.
  expect(screen.getByRole("list").closest("[data-layout]")).toHaveAttribute("data-layout", "list");
  expect(screen.getByRole("img", { name: /^Applications by stage:/ })).toBeInTheDocument();
});

it("reads ?stage= as a stage id, a stage code or 'commission'", () => {
  const api = [
    { id: "stg_1", name: "Application Review", code: "APPLICATION_REVIEW" },
    { id: "stg_5", name: "Partner Commission Invoicing", code: "PARTNER_COMMISSION_INVOICING" },
  ];
  expect(stageFromParam(api, "stg_1")?.id).toBe("stg_1");
  expect(stageFromParam(api, "application_review")?.id).toBe("stg_1");
  expect(stageFromParam(api, "commission")?.id).toBe("stg_5");
  expect(stageFromParam(api, "nope")).toBeUndefined();
  expect(stageFromParam(api, null)).toBeUndefined();
});

it("shows each stage as a StatTile from 1024px, as a filter toggle", async () => {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: query.includes("1024px"),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
  try {
    function Harness() {
      const [selected, setSelected] = useState<string | null>(null);
      return <PipelineFlow stages={stages} selectedId={selected} onSelect={setSelected} />;
    }
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    expect(screen.getByRole("list")).toHaveAttribute("data-layout", "tiles");
    expect(container.querySelectorAll("[data-ub-stat-tile]")).toHaveLength(3);
    const offer = screen.getByRole("button", { name: /^University and offer:/ });
    expect(within(offer).getAllByText("3")).toHaveLength(1);
    expect(within(offer).getByText("75%")).toBeInTheDocument();
    await user.click(offer);
    expect(offer).toHaveAttribute("aria-pressed", "true");
    await user.click(offer);
    expect(offer).toHaveAttribute("aria-pressed", "false");
  } finally {
    window.matchMedia = original;
  }
});
