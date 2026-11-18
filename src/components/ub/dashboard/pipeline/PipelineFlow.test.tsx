import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PipelineFlow from "./PipelineFlow";
import { stageFromParam } from "features/applications/hooks/useStageParam";

const stages = [
  { id: "review", label: "Unibexs review", count: 1, stageId: "documents-pending", attention: true },
  { id: "offer", label: "University and offer", count: 3, stageId: "offer-received" },
  { id: "visa", label: "Visa", count: 0, stageId: "visa-in-progress" },
];

it("lists stages in order with each count and share once, and an Action needed badge", () => {
  render(<PipelineFlow stages={stages} />);
  const list = screen.getByRole("list", { name: "Applications by stage" });
  expect(list.querySelectorAll("li")).toHaveLength(3);
  const offer = screen.getByRole("group", { name: /^University and offer:/ });
  // The count and the share appear once each (the step number is "2").
  expect(within(offer).getAllByText("3")).toHaveLength(1);
  expect(within(offer).getAllByText("75%")).toHaveLength(1);
  // One badge per layout (list under the name, columns in the bottom row); only one is shown at a time.
  expect(screen.getAllByText("Action needed")).toHaveLength(2);
  expect(screen.getByRole("group", { name: /^Unibexs review: 1 applications, 25%, Action needed$/ })).toBeInTheDocument();
  render(<PipelineFlow stages={stages} layout="list" label="List only" />);
  const listOnly = screen.getByRole("list", { name: "List only" });
  expect(within(listOnly).getAllByText("Action needed")).toHaveLength(1);
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
  expect(screen.getByRole("list").className).not.toMatch(/lg:grid-cols/);
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
