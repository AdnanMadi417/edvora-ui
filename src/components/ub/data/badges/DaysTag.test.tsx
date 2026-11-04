import React from "react";
import { render, screen } from "@testing-library/react";
import DaysTag, { DAYS_TAG_THRESHOLDS, getDaysLabel, getDaysLevel } from "components/ub/data/badges/DaysTag";

describe("getDaysLevel", () => {
  it.each([
    [0, "grey"],
    [3, "grey"],
    [4, "amber"],
    [7, "amber"],
    [8, "orange"],
    [14, "orange"],
    [15, "red"],
    [40, "red"],
  ])("days in stage %i → %s", (days, level) => {
    expect(getDaysLevel("inStage", days)).toBe(level);
  });

  it.each([
    [30, "grey"],
    [15, "grey"],
    [14, "amber"],
    [8, "amber"],
    [7, "orange"],
    [1, "orange"],
    [0, "red"],
    [-2, "red"],
  ])("deadline in %i days → %s", (days, level) => {
    expect(getDaysLevel("deadline", days)).toBe(level);
  });

  it("accepts custom thresholds", () => {
    const thresholds = { ...DAYS_TAG_THRESHOLDS, inStage: { amberFrom: 2, orangeFrom: 5, redFrom: 10 } };
    expect(getDaysLevel("inStage", 2, thresholds)).toBe("amber");
    expect(getDaysLevel("inStage", 10, thresholds)).toBe("red");
  });
});

describe("getDaysLabel", () => {
  it("handles singular and plural", () => {
    expect(getDaysLabel("inStage", 5)).toBe("5 days in stage");
    expect(getDaysLabel("inStage", 1)).toBe("1 day in stage");
    expect(getDaysLabel("inStage", 0)).toBe("0 days in stage");
    expect(getDaysLabel("deadline", 3)).toBe("Due in 3 days");
    expect(getDaysLabel("deadline", 1)).toBe("Due in 1 day");
    expect(getDaysLabel("deadline", 0)).toBe("Due today");
    expect(getDaysLabel("deadline", -1)).toBe("Overdue by 1 day");
    expect(getDaysLabel("deadline", -2)).toBe("Overdue by 2 days");
  });
});

describe("DaysTag", () => {
  it("renders the label with the level", () => {
    render(<DaysTag mode="deadline" days={-2} />);
    const tag = screen.getByText("Overdue by 2 days");
    expect(tag).toHaveAttribute("data-level", "red");
  });
});
