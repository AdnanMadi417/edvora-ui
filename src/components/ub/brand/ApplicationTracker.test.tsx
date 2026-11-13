import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import ApplicationTracker, { trackerStepsAt, trackerSummary } from "components/ub/brand/ApplicationTracker";
import { GLASS_BOX_STEPS, STUDENT_PROFILE_STEPS } from "config/applicationStages";

describe("ApplicationTracker", () => {
  it("renders an ordered list with aria-current on the current step only", () => {
    render(<ApplicationTracker steps={trackerStepsAt(STUDENT_PROFILE_STEPS, "offer")} nextStep="Upload the offer letter from Sunway University" />);
    const list = screen.getByRole("list", { name: "Application progress" });
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    const current = items.filter((li) => li.getAttribute("aria-current") === "step");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Offer");
    expect(current[0]).toHaveTextContent("Next step: Upload the offer letter from Sunway University");
  });

  it('labels skipped steps "Not required" and marks attention steps', () => {
    const steps = trackerStepsAt(GLASS_BOX_STEPS, "submitted", {
      documents: { state: "attention", caption: "Bank statement needs replacing" },
      arrival: { state: "skipped" },
    });
    render(<ApplicationTracker steps={steps} />);
    const items = screen.getAllByRole("listitem");
    expect(items[5]).toHaveTextContent("Not required");
    expect(items[1]).toHaveTextContent("needs attention");
    expect(items[1]).toHaveTextContent("Bank statement needs replacing");
    expect(items[0]).toHaveTextContent("completed");
    expect(items[3]).toHaveTextContent("4"); // upcoming shows the step number
  });

  it("announces status updates in a polite live region, not on first render", () => {
    const { container, rerender } = render(<ApplicationTracker steps={trackerStepsAt(STUDENT_PROFILE_STEPS, "submitted")} />);
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toBeInTheDocument();
    expect(live).toHaveTextContent("");

    rerender(<ApplicationTracker steps={trackerStepsAt(STUDENT_PROFILE_STEPS, "offer")} nextStep="Upload the offer letter" />);
    expect(live).toHaveTextContent("Current step: Offer.");
    expect(live).toHaveTextContent("Next step: Upload the offer letter.");
  });

  it("fills connectors up to the current step", () => {
    const { container } = render(<ApplicationTracker steps={trackerStepsAt(STUDENT_PROFILE_STEPS, "submitted")} />);
    const fills = Array.from(container.querySelectorAll("[data-filled]")).map((el) => el.getAttribute("data-filled"));
    expect(fills).toEqual(["true", "true", "false", "false"]);
  });

  it("responsive: summarises the step in focus and opens the full list on demand", () => {
    // jsdom applies no media queries, so both the summary and the md+ list render; the toggle is the phone part.
    render(<ApplicationTracker orientation="responsive" steps={trackerStepsAt(STUDENT_PROFILE_STEPS, "offer")} />);
    expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Show all steps" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("list", { name: "Application progress" })).toHaveLength(1);
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Hide steps" })).toHaveAttribute("aria-expanded", "true");
    const lists = screen.getAllByRole("list", { name: "Application progress" });
    expect(lists).toHaveLength(2);
    expect(lists.some((l) => l.id === toggle.getAttribute("aria-controls"))).toBe(true);
  });

  it("trackerSummary focuses attention, then current, then the last complete step", () => {
    const attention = trackerStepsAt(GLASS_BOX_STEPS, "submitted", { documents: { state: "attention" } });
    expect(trackerSummary(attention).step?.id).toBe("documents");
    expect(trackerSummary(trackerStepsAt(STUDENT_PROFILE_STEPS, "offer")).index).toBe(3);
    const done = STUDENT_PROFILE_STEPS.map((s) => ({ id: s.id, label: s.label, state: "complete" as const }));
    expect(trackerSummary(done).done).toBe(true);
  });
});
