import { render, screen } from "@testing-library/react";
import StudyLevelCard from "../components/StudyLevelCard";

it("shows active applications by study level", () => {
  render(
    <StudyLevelCard
      onRetry={jest.fn()}
      resource={{
        state: "ready",
        data: {
          total: 10,
          items: [],
          studyLevels: {
            levels: [
              { key: "Bachelor", label: "Bachelor", value: 6 },
              { key: "Master", label: "Master", value: 2 },
            ],
            notRecorded: 2,
          },
        },
      }}
    />
  );
  expect(screen.getByRole("heading", { name: "Study level mix" })).toBeInTheDocument();
  expect(screen.getByText("75.0%")).toBeInTheDocument();
  // No reconciliation section on the home card.
  expect(screen.queryByText("Level on record")).not.toBeInTheDocument();
});
