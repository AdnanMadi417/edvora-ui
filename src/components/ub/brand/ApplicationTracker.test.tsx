import React from "react";
import { render, screen, within } from "@testing-library/react";
import ApplicationTracker, { trackerStepsAt } from "components/ub/brand/ApplicationTracker";
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
});
